import { Address, TransactionReceipt, createPublicClient, createWalletClient, custom, encodeAbiParameters, http, parseAbiParameters } from 'viem';
import FunctionsBillingRegistry from '../build/artifacts/contracts/dev/functions/FunctionsBillingRegistry.sol/FunctionsBillingRegistry.json';
import LinkTokenInterface from '../build/artifacts/@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol/LinkTokenInterface.json';
import { sepolia } from 'viem/chains';
import { Chain, getContract } from 'viem';
import FunctionsOracle from '../build/artifacts/contracts/dev/functions/FunctionsOracle.sol/FunctionsOracle.json';
import { ethers, hexlify, parseEther } from 'ethers';
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

export async function fundSubscriptionCall(subscriptionId: number, linkAmount: number): Promise<any> {
    const FunctionsOracleContract =
     { address: networks.ethereumSepolia["functionsOracleProxy"] as Address,
      abi: FunctionsOracle.abi };

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


    const linkReadContract = getContract({
        address: networks.ethereumSepolia.linkToken as Address,
        abi: LinkTokenInterface.abi,
        publicClient,
    })

    const linkWriteContract = getContract({
        address: networks.ethereumSepolia.linkToken as Address,
        abi: LinkTokenInterface.abi,
        walletClient,
    })

    // Ensure sufficient balance
    const currentAddress = (await walletClient.requestAddresses()).at(0);

    console.log("currentAddress:", currentAddress);

    const balance = await linkReadContract.read.balanceOf([currentAddress]) as bigint;
    console.log("balance:", ethers.formatEther(balance));
    if (juelsAmount > balance) {
        return {
            message: `Error: Insufficient LINK balance. Trying to fund subscription with ${ethers.formatEther(
                juelsAmount
            )} LINK, but wallet only has ${ethers.formatEther(balance)}.`
        } 
    }

    // Fund the subscription with LINK
    console.log("subscriptionId:", subscriptionId);

    const subsc = BigInt(subscriptionId);
    const encoded = encodeAbiParameters(
        parseAbiParameters('uint64'),
        [subsc]
    )
    console.log("encode:", encoded);

    let transaction: TransactionReceipt;
    try {
        console.log("juelsAmount:", juelsAmount);
        const fundTx = await linkWriteContract.write.transferAndCall(
            [
                networks.ethereumSepolia.functionsBillingRegistryProxy,
                juelsAmount,
                encoded,
            ]
        )
        transaction = await publicClient.waitForTransactionReceipt(
            { hash: fundTx }
        );
        transaction.logs.forEach((log) => {
            console.log(log);
        });

        console.log(
            `Waiting ${networks.ethereumSepolia.confirmations} blocks for transaction ${fundTx} to be confirmed...`
        )

        const postbalance = await linkReadContract.read.balanceOf([currentAddress]) as bigint;
        const postbalanceLink = ethers.formatEther(postbalance);
        return {
            message: `Funded subscription ${subscriptionId} with ${ethers.formatEther(juelsAmount)} LINK`,
            preBalance: ethers.formatEther(balance), //Balance before transaction
            currentLinkBalance: postbalanceLink,
            transactionHash: transaction.transactionHash,
            subscriptionId: subscriptionId,
        }
    } catch (error) {
        console.error(`Transaction failed: ${error}`)
    }

}
