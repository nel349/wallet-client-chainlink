import { createWalletClient, custom, Address, parseEther, getContract, createPublicClient, http, Transport, formatUnits } from 'viem';
import { goerli, sepolia } from 'viem/chains';
import FunctionsOracle from '../functions-hardhat-starter-kit/build/artifacts/contracts/dev/functions/FunctionsOracle.sol/FunctionsOracle.json';
import FunctionsConsumer from '../functions-hardhat-starter-kit/build/artifacts/contracts/FunctionsConsumer.sol/FunctionsConsumer.json';
import FunctionsBillingRegistry from '../functions-hardhat-starter-kit/build/artifacts/contracts/dev/functions/FunctionsBillingRegistry.sol/FunctionsBillingRegistry.json';
import fs from "fs";
import { ethers } from 'ethers';



import { Chain } from 'viem/src';
import { publicActions } from 'viem/src/clients/decorators/public';


async function readFile(path: string): Promise<string> {
  const response = await fetch(path);
  const text = await response.text();
  return text;
}


const networks = {
  ethereumSepolia: {
    url: (import.meta as any).env.VITE_REACT_APP_ETHEREUM_SEPOLIA_RPC_URL_U,
    gasPrice: undefined,
    accounts: [],
    verifyApiKey: "process.env.ETHERSCAN_API_KEY" || "UNSET",
    chainId: 11155111,
    confirmations: "",
    nativeCurrencySymbol: "ETH",
    linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    linkPriceFeed: "0x42585eD362B3f1BCa95c640FdFf35Ef899212734",
    functionsOracleProxy: "0x649a2C205BE7A3d5e99206CEEFF30c794f0E31EC",
    functionsBillingRegistryProxy: "0x3c79f56407DCB9dc9b852D139a317246f43750Cc",
    functionsPublicKey: "",
  },
  polygonMumbai: {
    url: "process.env.POLYGON_MUMBAI_RPC_URL" || "UNSET",
    gasPrice: undefined,
    accounts: [],
    verifyApiKey: "process.env.POLYGONSCAN_API_KEY" || "UNSET",
    chainId: 80001,
    confirmations: "",
    nativeCurrencySymbol: "MATIC",
    linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    linkPriceFeed: "0x12162c3E810393dEC01362aBf156D7ecf6159528", // LINK/MATIC
    functionsOracleProxy: "0xeA6721aC65BCeD841B8ec3fc5fEdeA6141a0aDE4",
    functionsBillingRegistryProxy: "0xEe9Bf52E5Ea228404bB54BCFbbDa8c21131b9039",
    functionsPublicKey: "",
  },
  avalancheFuji: {
    url: "process.env.AVALANCHE_FUJI_RPC_URL" || "UNSET",
    gasPrice: undefined,
    accounts: [],
    verifyApiKey: "process.env.SNOWTRACE_API_KEY" || "UNSET",
    chainId: 43113,
    confirmations: 2 * 60 * 60 / 5, // 2 hours in blocks
    nativeCurrencySymbol: "AVAX",
    linkToken: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
    linkPriceFeed: "0x79c91fd4F8b3DaBEe17d286EB11cEE4D83521775", // LINK/AVAX
    functionsOracleProxy: "0xE569061eD8244643169e81293b0aA0d3335fD563",
    functionsBillingRegistryProxy: "0x452C33Cef9Bc773267Ac5F8D85c1Aca2bA4bcf0C",
    functionsPublicKey: "",
  },
}


const currentChain = sepolia as Chain;
const currentTestingContract = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const currentTestUser = "0x9584DD0D9bA9d81103020281B77EA23cAaC4e3A4";

const walletClient = createWalletClient({
  chain: currentChain,
  transport: typeof window.ethereum !== 'undefined' ? custom(window.ethereum) : http(),
});

const publicClient = createPublicClient({
  chain: currentChain,
  transport: http(),
});




export async function requestFunctionCall(contractAddr: string, subscriptionId: number, wallet: any) {

  const FunctionsOracleContract = { address: networks.ethereumSepolia["functionsOracleProxy"] as Address, abi: FunctionsOracle.abi };
  const FunctionsConsumerContract = { address: contractAddr, abi: FunctionsConsumer.abi };


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
  let subInfo
  try {
    subInfo = await registryContract.read.getSubscription([subscriptionId]);

    console.log("subInfo:", subInfo)
  } catch (error) {
    if (error.errorName === "InvalidSubscription") {
      throw Error(`Subscription ID "${subscriptionId}" is invalid or does not exist`)
    }
    throw error
  }


  // Validate the client contract has been authorized to use the subscription
  const existingConsumers = subInfo[2].map((addr) => addr.toLowerCase())
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
  const estimatedCostJuels = await clientContract.read.estimateCost(
    [
      [
        0, // 0: CodeLocation: Inline
        1, // SecretsLocation: Remote
        0, // Code language: Javascript
        (await readFile("functions-hardhat-starter-kit/calculation-example.js")).toString(),
        [],
        ["1", "bitcoin", "btc-bitcoin", "btc", "1000000", "450"],
      ],
      subscriptionId,
      100000, // 100k gas limit
      maxPriorityFeePerGas && baseFeePerGas ? maxPriorityFeePerGas + baseFeePerGas : baseFeePerGas
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




}