import { Address, TransactionReceipt, formatUnits, getContract } from "viem";
import { publicClient, walletClient } from "./clients";
import { FunctionsBillingRegistry, FunctionsOracleContract } from "./contracts";
import { networks } from "./networks";
import { Hex } from "viem/src";

export async function removeConsumerToSubscriptionCall(subscriptionId: number, consumerAddress: string) {
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

    const currentAddress = (await walletClient.requestAddresses()).at(0);

    if (preSubInfo[1] !== currentAddress?.toString()) {
        throw Error("The current wallet is not the owner of the subscription")
    }

    // Check that the consumer IS already authorized (for convenience)
    const existingConsumers = preSubInfo[2].map((addr) => addr.toLowerCase());
    console.log("existingConsumers:", existingConsumers);
    if (!existingConsumers.includes(consumerAddress.toLowerCase())) {
        // console.log(`Consumer ${consumerAddress} is NOT authorized to use subscription ${subscriptionId}`)
        return { error: `Error: Consumer ${consumerAddress} is NOT authorized to use subscription ${subscriptionId}`}
    }


    let rmTxReceipt: TransactionReceipt;

    try {
        console.log(`Removing consumer contract address ${consumerAddress} to subscription ${subscriptionId}`)
        const rmTx = await registryWriteContract.write.removeConsumer([subscriptionId, consumerAddress]);

        rmTxReceipt = await publicClient.waitForTransactionReceipt(
            { hash: rmTx }
        );

        console.log(`Consumer contract address ${consumerAddress} removed from subscription ${subscriptionId}`);

        console.log(`Transaction hash: ${rmTxReceipt.transactionHash}`);

        return {
            message: `Consumer contract address ${consumerAddress} removed from subscription ${subscriptionId}`,
            transactionHash: rmTxReceipt.transactionHash
        }

    } catch (error) {
        console.error(`Transaction failed: ${error}`)
        return {
            error: `Transaction failed: ${error}`
        }
    }


}