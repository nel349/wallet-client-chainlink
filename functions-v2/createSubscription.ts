import { Address, TransactionReceipt, formatUnits, getContract } from "viem";
import { publicClient, walletClient } from "./clients";
import { FunctionsBillingRegistry, FunctionsOracleContract } from "./contracts";
import { networks } from "./networks";
import { Hex } from "viem/src";

export async function createSubscriptionCall() {
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

    const registryContract = getContract({
        address: registryAddress as Address,
        abi: FunctionsBillingRegistry.abi,
        walletClient,
    })

    console.log("Creating Functions billing subscription")

    let createSubscriptionTxReceipt: TransactionReceipt;
    try {
        const createSubscriptionTx = await registryContract.write.createSubscription();
        createSubscriptionTxReceipt = await publicClient.waitForTransactionReceipt(
            { hash: createSubscriptionTx }
        );

        console.log(
            `Waiting ${networks.ethereumSepolia.confirmations} blocks for transaction ${createSubscriptionTx} to be confirmed...`
        )
        // createSubscriptionTxReceipt.logs.forEach((log) => {
        //     console.log("createSubscriptionTxEvent:", log);
        // });


        const subscriptionIdHex = createSubscriptionTxReceipt.logs[0].topics[1] as Hex;
        const result = parseInt(subscriptionIdHex);

        console.log(`Subscription created with ID: ${result}`)

        return result;


    } catch (error) {
        console.error(`Transaction failed: ${error}`)
    }
}