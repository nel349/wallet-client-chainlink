import { createWalletClient, custom, Address, parseEther, getContract, createPublicClient, http } from 'viem';
import { goerli, sepolia } from 'viem/chains';
import FunctionsOracle from '../functions-hardhat-starter-kit/build/artifacts/contracts/dev/functions/FunctionsOracle.sol/FunctionsOracle.json';
import FunctionsConsumer from '../functions-hardhat-starter-kit/build/artifacts/contracts/FunctionsConsumer.sol/FunctionsConsumer.json';
import FunctionsBillingRegistry from '../functions-hardhat-starter-kit/build/artifacts/contracts/dev/functions/FunctionsBillingRegistry.sol/FunctionsBillingRegistry.json';


import { Chain } from 'viem/src';

const networks = {
  ethereumSepolia: {
    url: "process.env.ETHEREUM_SEPOLIA_RPC_URL" || "UNSET",
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
  transport: custom(window.ethereum!),
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
    abi: FunctionsBillingRegistry.abi ,
    publicClient,
  })

      // Check that the subscription is valid
      let subInfo
      try {
        subInfo = await registryContract.read.getSubscription([subscriptionId]);

        console.log("subInfo:", subInfo)

        // subInfo = await publicClient.readContract({
        //   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
        //   abi: wagmiAbi,
        //   functionName: 'balanceOf',
        //   args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC']
        // })
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





  

}