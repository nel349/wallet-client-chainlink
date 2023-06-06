import { Address, formatUnits, getContract } from "viem";
import { publicClient } from "./clients";
import { FunctionsBillingRegistry, FunctionsOracleContract } from "./contracts";

export async function getSubscriptionBalanceCall(subscriptionId: string) {
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

    const subBalanceInJules = subInfo[0];
    const linkBalance = formatUnits(subBalanceInJules, 18);
  
    console.log(`The subscription has a balance of ${linkBalance} LINK`);

}