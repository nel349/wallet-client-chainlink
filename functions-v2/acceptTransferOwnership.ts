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

    if (preSubInfo[1] === currentAddress?.toString()) {
        throw Error("The current wallet is already the owner of the subscription")
    }

    let acceptTxReceipt: TransactionReceipt;

    try {
        console.log(`Accepting ownership of subscription ${subscriptionId}`)
        const acceptTx = await registryWriteContract.write.acceptSubscriptionOwnerTransfer([subscriptionId])

        acceptTxReceipt = await publicClient.waitForTransactionReceipt(
            { hash: acceptTx }
        );

        console.log(`Transaction hash: ${acceptTxReceipt.transactionHash}`);
        console.log(`Ownership of subscription ${subscriptionId} transferred to ${currentAddress}`)

    } catch (error) {
        console.log(
            `\nFailed to accept ownership. Ensure that a transfer has been requested by the previous owner ${preSubInfo[1]}`
        )
    }

        // Print information about the accepted subscription
        let postSubInfo: any = await registryReadContract.read.getSubscription([subscriptionId]);

        console.log(`\nSubscription ${subscriptionId} owner: ${postSubInfo[1]}`)
        console.log(`Balance: ${formatEther(postSubInfo[0])} LINK`)
        console.log(`${postSubInfo[2].length} authorized consumer contract${postSubInfo[2].length === 1 ? "" : "s"}:`)
        console.log(postSubInfo[2])

}