import React, { useState } from "react";
import { acceptOwnershipCall, addConsumerToSubscriptionCall, createSubscriptionCall, fundSubscriptionCall, removeConsumerToSubscriptionCall, requestFunctionCall, transferOwnershipCall, walletClient } from "../functions-v2";
import { Address, TransactionExecutionError } from "viem";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Props = {
    executionType: ExecutionType;
    [key: string]: any; // Allow arbitrary props
};

export enum ExecutionType {
    RequestFunctionCall = "requestFunctionCall",
    FundSubscriptionCall = "fundSubscriptionCall",
    CreateSubscriptionCall = "createSubscriptionCall",
    AddConsumerToSubscriptionCall = "addConsumerToSubscriptionCall",
    RemoveConsumerToSubscriptionCall = "removeConsumerToSubscriptionCall",
    TransferOwnershipCall = "transferOwnershipCall",
    AcceptOwnershipCall = "acceptOwnershipCall",
};

export const ExecutionButtons = ({ executionType, ...props }: Props) => {

    const [state, setState] = useState("");
    const [result, setResult] = useState("");

    const handleButtonClick = async (callback: () => Promise<any>) => {
        try {
            setState("Running...");
            const result = await callback();
            const strResult = JSON.stringify(result);
            setResult(strResult);
            setState("Completed");
            if (result instanceof Error ||
                result instanceof TransactionExecutionError ||
                containsError(result)
            ) {
                // Display an error toast
                console.log("result: ", strResult);
                toast.error(strResult);
            } else {
                // Display a success toast
                // TODO: Is not working
                toast.success('Success!');
            }
        } catch (error) {
            setState("Error");
            toast.error(error.message);
            setResult(error.message);
        }
    };

    const containsError = (result: any) => {
        return typeof result === 'string' &&
            (result.includes("Error") || result.includes("error") || result.includes("ERROR"));
    };

    const requestFunctionCallExecution = async () => {
        requestFunctionCall(
            "0xf4C1B1B5f4885588f25231075D896Cf8D2946d60",
            384,
            walletClient
        );
    };

    const fundSubscriptionCallExecution = async (subid: number, amount: number) => {
        handleButtonClick(async () => {
            return await fundSubscriptionCall(subid, amount);
        });
    };

    const createSubscriptionCallExecution = async () => {
        handleButtonClick(async () => {
            const result = await createSubscriptionCall();
            return (result as string | undefined)?.toString() ?? "";
        });
    };

    const addConsumerToSubscriptionCallExecution = async (subid: number, address: Address) => {
        handleButtonClick(async () => {
            const result = await addConsumerToSubscriptionCall(subid, address);
            return JSON.stringify(result);
        });
    };

    const removeConsumerToSubscriptionCallExecution = async (subid: number, address: string) => {
        handleButtonClick(async () => {
            const result = await removeConsumerToSubscriptionCall(subid, address);
            return JSON.stringify(result);
        });
    };

    const transferOwnershipCallExecution = async (subid: number, newOwnerAddress: string) => {
        handleButtonClick(async () => {
            return await transferOwnershipCall(subid, newOwnerAddress);
        });
        
    };

    const acceptOwnershipCallExecution = async () => {
        acceptOwnershipCall(419);
    };

    return (
        <div>
            {executionType === ExecutionType.RequestFunctionCall && (
                <>
                    <button onClick={requestFunctionCallExecution}>
                        Send Request Function Call (Example)
                    </button>
                    <br />
                    <br />
                </>
            )}

            {executionType === ExecutionType.FundSubscriptionCall && (
                <>
                    <button onClick={() => fundSubscriptionCallExecution(props.subscriptionId, props.amount)}>Fund Subscription</button>
                    <br />
                </>
            )}

            {executionType === ExecutionType.CreateSubscriptionCall && (
                <>
                    <button onClick={createSubscriptionCallExecution}>Create Subscription</button>
                    <br />
                </>
            )}

            {executionType === ExecutionType.AddConsumerToSubscriptionCall && (
                <>
                    <button onClick={() => addConsumerToSubscriptionCallExecution(props.subscriptionId, props.consumerAddress)}>Add Consumer to Subscription</button>
                    <br />
                </>
            )}

            {executionType === ExecutionType.RemoveConsumerToSubscriptionCall && (
                <>
                    <button onClick={
                        () => removeConsumerToSubscriptionCallExecution(props.subscriptionId, props.consumerAddress)
                    }>Remove Consumer to Subscription</button>
                    <br />
                </>
            )}

            {executionType === ExecutionType.TransferOwnershipCall && (
                <>
                    <button onClick={() => 
                        transferOwnershipCallExecution(props.subscriptionId, props.newOwnerAddress)
                    }>Transfer Ownership</button>
                    <br />
                </>
            )}

            {executionType === ExecutionType.AcceptOwnershipCall && (
                <>
                    <button onClick={acceptOwnershipCallExecution}>Accept Ownership</button>
                    <br />
                </>
            )}

            {/* Wrap the following content inside a container and center it */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <p>State: {state}</p>
                <p>Result:</p>
                {result}
            </div>
        </div>
    );
};