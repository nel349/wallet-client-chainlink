import { Address, createPublicClient, createWalletClient, custom, http } from 'viem';
import FunctionsBillingRegistry from '../build/artifacts/contracts/dev/functions/FunctionsBillingRegistry.sol/FunctionsBillingRegistry.json';
import LinkTokenInterface from '../../build/artifacts/@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol/LinkTokenInterface.json';
import { sepolia } from 'viem/chains';
import { Chain, getContract } from 'viem';
import FunctionsOracle from '../build/artifacts/contracts/dev/functions/FunctionsOracle.sol/FunctionsOracle.json';
import { ethers, parseEther } from 'ethers';
import { networks } from './networks';

const currentChain = sepolia as Chain;

const publicClient = createPublicClient({
    chain: currentChain,
    transport: http(),
});

const [account] = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });

const walletClient = createWalletClient({
    chain: currentChain,
    transport: typeof window.ethereum !== 'undefined' ? custom(window.ethereum) : http(),
    account: account,
});

export async function fundSubscriptionCall(subscriptionId: number, linkAmount: number) {


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
    let preSubInfo
    try {
        preSubInfo = await registryContract.read.getSubscription([subscriptionId]);
    } catch (error) {
        if (error.errorName === "InvalidSubscription") {
            throw Error(`Subscription ID "${subscriptionId}" is invalid or does not exist`)
        }
        throw error
    }

    // Convert LINK to Juels
    const juelsAmount = ethers.parseUnits(linkAmount.toString());
    console.log(`Funding subscription ${subscriptionId} with ${ethers.formatEther(juelsAmount)} LINK`);


    const linkContract = getContract({
        address: networks.ethereumSepolia.linkToken as Address,
        abi: LinkTokenInterface.abi,
        publicClient,
    })

    // const LinkTokenFactory = await ethers.getContractFactory("LinkToken")
    // const linkToken = await LinkTokenFactory.attach(networks[network.name].linkToken)

    // const accounts = await ethers.getSigners()
    // const signer = accounts[0]

    // Ensure sufficient balance

    const currentAddress = (await walletClient.requestAddresses()).at(0);

    console.log("currentAddress:", currentAddress);

    const balance = await linkContract.read.balanceOf([currentAddress]) as bigint;
    console.log("balance:", ethers.formatEther(balance));
    if (juelsAmount > balance) {
        throw Error(
            `Insufficient LINK balance. Trying to fund subscription with ${ethers.formatEther(
                juelsAmount
            )} LINK, but wallet only has ${ethers.formatEther(balance)}.`
        )
    }

    // // Fund the subscription with LINK
    // const fundTx = await linkToken.transferAndCall(
    //     networks[network.name]["functionsBillingRegistryProxy"],
    //     juelsAmount,
    //     ethers.utils.defaultAbiCoder.encode(["uint64"], [subscriptionId])
    // )

    // console.log(
    //     `Waiting ${networks[network.name].confirmations} blocks for transaction ${fundTx.hash} to be confirmed...`
    // )
    // await fundTx.wait(networks[network.name].confirmations)

    // const postSubInfo = await registry.getSubscription(subscriptionId)

    // console.log(
    //     `\nSubscription ${subscriptionId} has a total balance of ${ethers.utils.formatEther(postSubInfo[0])} LINK`
    // )
}
