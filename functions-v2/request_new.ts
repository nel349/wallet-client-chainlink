import { createWalletClient, custom, Address, parseEther, getContract, createPublicClient, http, Transport, formatUnits, TransactionReceipt } from 'viem';
import { sepolia } from 'viem/chains';
import FunctionsOracle from '../build/artifacts/contracts/dev/functions/FunctionsOracle.sol/FunctionsOracle.json';
import FunctionsConsumer from '../build/artifacts/contracts/FunctionsConsumer.sol/FunctionsConsumer.json';
import FunctionsBillingRegistry from '../build/artifacts/contracts/dev/functions/FunctionsBillingRegistry.sol/FunctionsBillingRegistry.json';
import { ethers } from 'ethers';
import { Chain } from 'viem/src';
import { networks } from './networks';

async function readFile(path: string): Promise<string> {
  const response = await fetch(path);
  const text = await response.text();
  return text;
}

const currentChain = sepolia as Chain;
const [account] = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });

const walletClient = createWalletClient({
  chain: currentChain,
  transport: typeof window.ethereum !== 'undefined' ? custom(window.ethereum) : http(),
  account: account,
});

const publicClient = createPublicClient({
  chain: currentChain,
  transport: http(),
});

export async function requestFunctionCall(contractAddr: string, subscriptionId: number, wallet: any) {

  const FunctionsOracleContract = { address: networks.ethereumSepolia["functionsOracleProxy"] as Address, abi: FunctionsOracle.abi };

  // Get reigstry contract and address
  const registryAddress = await publicClient.readContract({
    ...FunctionsOracleContract,
    functionName: 'getRegistry',
  });

  const FunctionsConsumerRegistryContract = { address: registryAddress as Address, abi: FunctionsBillingRegistry.abi };


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
  if (!existingConsumers.includes(contractAddr.toLowerCase())) {
    throw Error(`Consumer contract ${contractAddr} is not registered to use subscription ${subscriptionId}`)
  }

  const clientContract = getContract({
    address: contractAddr as Address,
    abi: FunctionsConsumer.abi,
    publicClient,
  });


  // Estimate the cost of the request
  const provider = new ethers.JsonRpcProvider(networks.ethereumSepolia["url"]);
  const { maxPriorityFeePerGas,  } = await provider.getFeeData();
  // const { maxPriorityFeePerGas } = await ethers.getDefaultProvider(publicClient).getFeeData();
  const block = await provider.getBlock("latest");
  const baseFeePerGas = block?.baseFeePerGas;
  const source = (await readFile("functions-hardhat-starter-kit/calculation-example.js")).toString();
  const args = ["1", "bitcoin", "btc-bitcoin", "btc", "1000000", "450"];
  const gasLimit = 300000;

  const overrides = {}
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
    address: contractAddr as Address,
    abi: FunctionsConsumer.abi,
    walletClient,
  });

  publicClient.watchContractEvent({
    address: contractAddr as Address,
    abi: FunctionsConsumer.abi,
    eventName: 'RequestSent', 
    onLogs: logs => {
      const requestId = (logs[0] as any).args.id.toString();
      console.log(`Request ${requestId} has been sent.`)
    }
  });

  let requestTx
  try {
    // Initiate the on-chain request after all listeners are initialized
    requestTx = await consumerWriteContract.write.executeRequest(
      [      
        source,
        [], //secrets ?? [],
        args ?? [],
        subscriptionId,
        gasLimit
      ]
    );

    console.log("requestTx:", requestTx);
  } catch (error: any) {
    throw Error(`Could not initiate request: ${error.message}`);
  }



  // const requestId = requestTxReceipt.events[2].args.id.toString() ?? "";

  // console.log(`Request ${requestTx} has been sent.
  //  Waiting for fulfillment from the Decentralized Oracle Network...\n
  //  Make read result to check latest status of the request. (id: ${requestId})`);

}

