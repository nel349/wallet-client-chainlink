import { Address, TransactionReceipt, getContract } from "viem";
import { publicClient, walletClient } from "./clients";
import { FunctionsBillingRegistry, FunctionsOracleContract } from "./contracts";

/**
 * Transferring the subscription to a new owner will require generating a new signature for encrypted secrets.
    Any previous encrypted secrets will no longer work with this subscription ID and must be regenerated by the new owner.  
 * @param subscriptionId 
 * @param newOwner
 * @returns 
 */

export async function transferOwnershipCall(subscriptionId: number, newOwner: string) {
    // Get reigstry contract and address
    const isWalletAllowed = await publicClient.readContract({
        ...FunctionsOracleContract,
        functionName: 'getRegistry',
    });

    if (!isWalletAllowed) {
        const resultMessage = `Error: Chainlink Functions is currently in a closed testing phase.\nFor access sign up here:\nhttps://functions.chain.link`;
        console.log(resultMessage);
        return {
            message: resultMessage
        }
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
            // throw Error(`Subscription ID "${subscriptionId}" is invalid or does not exist`)
            return {
                message: `Error: Subscription ID "${subscriptionId}" is invalid or does not exist`
            }
        }
        throw error
    }


    const currentAddress = (await walletClient.requestAddresses()).at(0);

    if (preSubInfo[1] !== currentAddress?.toString()) {
        // throw Error("The current wallet is not the owner of the subscription")
        return {
            message: `Error: The current wallet is not the owner of the subscription`
        }

    }



    let transferTxReceipt: TransactionReceipt;

    try {
        console.log(`Requesting ownership transfer of subscription ${subscriptionId} to new owner ${newOwner}`)
        const transferTx =
         await registryWriteContract.write.requestSubscriptionOwnerTransfer([subscriptionId, newOwner])

         transferTxReceipt = await publicClient.waitForTransactionReceipt(
            { hash: transferTx }
        );


        console.log(`Transaction hash: ${transferTxReceipt.transactionHash}`);

        const resultMessage = `Ownership transfer to ${newOwner} requested for subscription ${subscriptionId}.
        \nThe new owner must now accept the transfer request.`;
        console.log(resultMessage);

        return {
            message: resultMessage,
            hash: transferTxReceipt.transactionHash
        }
 

    } catch (error) {
        console.error(`Transaction failed: ${error}`)
        return {
            message: `Error: Transaction failed: ${error}`
        }
        
    }

}