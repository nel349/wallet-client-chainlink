import { Address, TransactionReceipt, formatUnits, getContract } from "viem";
import { publicClient, walletClient } from "./clients";
import { FunctionsBillingRegistry, FunctionsOracleContract } from "./contracts";
import { networks } from "./networks";
import { Hex } from "viem/src";

export async function addConsumerToSubscriptionCall(subscriptionId: number, consumerAddress: string) {
    // Get reigstry contract and address
    const isWalletAllowed = await publicClient.readContract({
        ...FunctionsOracleContract,
        functionName: 'getRegistry',
    });

    if (!isWalletAllowed) {
        return console.log(
            "\nChainlink Functions is currently in a closed testing phase.\nFor access sign up here:\nhttps://functions.chain.link"
        )
    }

    // Get reigstry contract and address
    const registryAddress = await publicClient.readContract({
        ...FunctionsOracleContract,
        functionName: 'getRegistry',
    });

    const registryReadContract = getContract({
        address: registryAddress as Address,
        abi: FunctionsBillingRegistry.abi,
        publicClient,
    })

    const registryWriteContract = getContract({
        address: registryAddress as Address,
        abi: FunctionsBillingRegistry.abi,
        walletClient,
    })

    // Check that the subscription is valid
    let preSubInfo
    try {
        preSubInfo = await registryReadContract.read.getSubscription([subscriptionId]);
        console.log("preSubInfo:" , preSubInfo);
    } catch (error) {
        if (error.errorName === "InvalidSubscription") {
            throw Error(`Subscription ID "${subscriptionId}" is invalid or does not exist`)
        }
        throw error
    }

    const [account] = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });

    const currentAddress = (await walletClient.requestAddresses()).at(0);

    if (preSubInfo[1] !== currentAddress?.toString()) {
        throw Error("The current wallet is not the owner of the subscription")
    }

    // Check that the consumer is not already authorized (for convenience)
    const existingConsumers = preSubInfo[2].map((addr) => addr.toLowerCase());
    console.log("existingConsumers:", existingConsumers);
    if (existingConsumers.includes(consumerAddress.toLowerCase())) {
        throw Error(`Consumer ${consumerAddress} is already authorized to use subscription ${subscriptionId}`)
    }

    let addTxReceipt: TransactionReceipt;

    try {
        console.log(`Adding consumer contract address ${consumerAddress} to subscription ${subscriptionId}`)
        const addTx = await registryWriteContract.write.addConsumer([subscriptionId, consumerAddress]);

        addTxReceipt = await publicClient.waitForTransactionReceipt(
            { hash: addTx }
        );

        console.log(`Consumer contract address ${consumerAddress} added to subscription ${subscriptionId}`);

        console.log(`Transaction hash: ${addTxReceipt.transactionHash}`);


          // Print information about the subscription
        const postSubInfo : any = await registryReadContract.read.getSubscription([subscriptionId]);

        if (postSubInfo[2]?.length !== 0) {
            console.log(
                `${postSubInfo[2].length} authorized consumer contract${
                postSubInfo[2].length === 1 ? "" : "s"
                } for subscription ${subscriptionId}:`
            )
            console.log(postSubInfo[2]);
        }

 

    } catch (error) {
        console.error(`Transaction failed: ${error}`)
    }

}