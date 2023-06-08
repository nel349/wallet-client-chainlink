import { Address, TransactionReceipt, formatEther, formatUnits, getContract } from "viem";
import { publicClient, walletClient } from "./clients";
import { FunctionsBillingRegistry, FunctionsOracleContract } from "./contracts";

export async function acceptOwnershipCall(subscriptionId: number) {
    // Get reigstry contract and address
    const isWalletAllowed = await publicClient.readContract({
        ...FunctionsOracleContract,
        functionName: 'getRegistry',
    });

    if (!isWalletAllowed) {
        const resultMessage = `Error: Chainlink Functions is currently in a closed testing phase.\nFor access sign up here:\nhttps://functions.chain.link`;
        console.log(resultMessage)
        return { message: resultMessage }
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
    let preSubInfo: any
    try {
        preSubInfo = await registryReadContract.read.getSubscription([subscriptionId]);
        console.log("preSubInfo:" , preSubInfo);
    } catch (error: any) {
        if (error.errorName === "InvalidSubscription") {
            const resultMessage = `Error: Subscription ID "${subscriptionId}" is invalid or does not exist`;
            console.log(resultMessage);
            return {
                message: resultMessage
            }
        }
        throw error
    }


    const currentAddress = (await walletClient.requestAddresses()).at(0);

    if (preSubInfo[1] === currentAddress?.toString()) {
        const resultMessage = `Error: The current wallet is already the owner of the subscription`;
        console.log(resultMessage);
        return { message: resultMessage }
    }

    let acceptTxReceipt: TransactionReceipt;

    try {
        console.log(`Accepting ownership of subscription ${subscriptionId}`)
        const acceptTx = await registryWriteContract.write.acceptSubscriptionOwnerTransfer([subscriptionId])

        acceptTxReceipt = await publicClient.waitForTransactionReceipt(
            { hash: acceptTx }
        );

        console.log(`Transaction hash: ${acceptTxReceipt.transactionHash}`);


        // Print information about the accepted subscription
        let postSubInfo: any = await registryReadContract.read.getSubscription([subscriptionId]);

        console.log(`\nSubscription ${subscriptionId} owner: ${postSubInfo[1]}`)
        console.log(`Balance: ${formatEther(postSubInfo[0])} LINK`)
        console.log(`${postSubInfo[2].length} authorized consumer contract${postSubInfo[2].length === 1 ? "" : "s"}:`)
        console.log(postSubInfo[2])

        const resultMessage = `Ownership of subscription ${subscriptionId} transferred to ${currentAddress}`;
        console.log(resultMessage)

        return {
            hash: acceptTxReceipt.transactionHash,
            message: resultMessage,
            subscriptionId: subscriptionId,
        }

    } catch (error: any) {
        console.log(
            `\nFailed to accept ownership. Ensure that a transfer has been requested by the previous owner ${preSubInfo[1]}`
        )
        return {
            message: `Error: Failed to accept ownership.
             Ensure that a transfer has been requested by the previous owner ${preSubInfo[1]}
              ${error.message}`
        }
    }

}