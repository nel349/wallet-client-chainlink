import { Address, getContract, formatUnits, TransactionReceipt } from 'viem';
import FunctionsOracle from '../build/artifacts/contracts/dev/functions/FunctionsOracle.sol/FunctionsOracle.json';
import FunctionsConsumer from '../build/artifacts/contracts/FunctionsConsumer.sol/FunctionsConsumer.json';
import FunctionsBillingRegistry from '../build/artifacts/contracts/dev/functions/FunctionsBillingRegistry.sol/FunctionsBillingRegistry.json';
import { ethers } from 'ethers';
import { networks } from './networks';
import { publicClient, walletClient } from '.';

async function readFile(path: string): Promise<string> {
  const response = await fetch(path);
  const text = await response.text();
  return text;
}

export async function requestFunctionCall(consumerAddress: string, subscriptionId: number) {
  const FunctionsOracleContract = { address: networks.ethereumSepolia["functionsOracleProxy"] as Address, abi: FunctionsOracle.abi };

  // Get reigstry contract and address
  const registryAddress = await publicClient.readContract({
    ...FunctionsOracleContract,
    functionName: 'getRegistry',
  });


  const registryContract = getContract({
    address: registryAddress as Address,
    abi: FunctionsBillingRegistry.abi,
    publicClient,
  })

  // Check that the subscription is valid
  let subInfo: any;
  try {
    subInfo = await registryContract.read.getSubscription([subscriptionId]);


    console.log("subInfo:", subInfo)
  } catch (error: any) {
    if (error.errorName === "InvalidSubscription") {
      throw Error(`Subscription ID "${subscriptionId}" is invalid or does not exist`)
    }
    throw error
  }


  // Validate the client contract has been authorized to use the subscription
  const existingConsumers = subInfo[2].map((addr: string) => addr.toLowerCase())
  if (!existingConsumers.includes(consumerAddress.toLowerCase())) {
    throw Error(`Consumer contract ${consumerAddress} is not registered to use subscription ${subscriptionId}`)
  }

  const clientContract = getContract({
    address: consumerAddress as Address,
    abi: FunctionsConsumer.abi,
    publicClient,
  });

  // const rpcUrl =  networks?.ethereumSepolia?.url as string;

  const provider = new ethers.JsonRpcProvider(networks.ethereumSepolia["url"]);
  // Estimate the cost of the request
  // const provider = new ethers.AlchemyProvider(rpcUrl);
  const { maxPriorityFeePerGas,  } = await provider.getFeeData();
  console.log("maxPriorityFeePerGas:", maxPriorityFeePerGas);
  const block = await provider.getBlock("latest");
  const baseFeePerGas = block?.baseFeePerGas;
  console.log("baseFeePerGas:", baseFeePerGas);
  const source = (await readFile("public/calculation-example.js")).toString();
  console.log("source:", source);
  const args = ["1", "bitcoin", "btc-bitcoin", "btc", "1000000", "450"];
  const gasLimit = 300000;

  const estimatedCostJuels = await clientContract.read.estimateCost(
    [
      [
        0, // 0: CodeLocation: Inline
        1, // SecretsLocation: Remote
        0, // Code language: Javascript
        source,
        [],
        args,
      ],
      subscriptionId,
      gasLimit, // 300k gas limit
      maxPriorityFeePerGas && baseFeePerGas ? maxPriorityFeePerGas + baseFeePerGas : maxPriorityFeePerGas
    ]
  );

  const estimatedCostLink = formatUnits(estimatedCostJuels as bigint, 18);

  // Ensure that the subscription has a sufficient balance
  const subBalanceInJules = subInfo[0];
  const linkBalance = formatUnits(subBalanceInJules, 18);


  if (subBalanceInJules < (estimatedCostJuels as bigint) ) {
    throw Error(
      `Subscription ${subscriptionId} does not have sufficient funds. The estimated cost is ${estimatedCostLink} LINK, but the subscription only has a balance of ${linkBalance} LINK`
    )
  } else {
    console.log(`The estimated cost is ${estimatedCostLink} LINK, and the subscription has a balance of ${linkBalance} LINK`);
  }

  // TODO: add prompt to ask for confirmation before initiating the request on-chain - frontend
  // await utils.promptTxCost(transactionEstimateGas, hre, true)

  // Print the estimated cost of the request
  // Ask for confirmation before initiating the request on-chain
  // await utils.prompt(
  //   `If the request's callback uses all ${utils.numberWithCommas(
  //     gasLimit
  //   )} gas, this request will charge the subscription:\n${chalk.blue(estimatedCostLink + " LINK")}`
  // )
  //  TODO: add cost of this LINK in USD


  const consumerWriteContract = getContract({
    address: consumerAddress as Address,
    abi: FunctionsConsumer.abi,
    walletClient,
  });

  let requestId: string = "";

  publicClient.watchContractEvent({
    address: consumerAddress as Address,
    abi: FunctionsConsumer.abi,
    eventName: 'RequestSent', 
    onLogs: logs => {
      requestId = (logs[0] as any).args.id.toString();
      console.log(`Request ${requestId} has been sent.`)
    }
  });


  let requestTxReceipt: TransactionReceipt;
  try {
    // Initiate the on-chain request after all listeners are initialized
    const requestTx = await consumerWriteContract.write.executeRequest(
      [      
        source,
        [], //secrets ?? [],
        args ?? [],
        subscriptionId,
        gasLimit
      ]
    );
    requestTxReceipt = await publicClient.waitForTransactionReceipt(
      { hash: requestTx }
    );

    while (!requestId) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // wait for 10 seconds
    }
    console.log("requestId:", requestId);
    const resultMessage = `Request ${requestTx} has been sent.
    Waiting for fulfillment from the Decentralized Oracle Network...\n
    Make read result to check latest status of the request. (id: ${requestId})`;

    return {
      message: resultMessage,
      transactionHash: requestTxReceipt.transactionHash
    }
  } catch (error: any) {
    throw Error(`Could not initiate request: ${error.message}`);
  }

}