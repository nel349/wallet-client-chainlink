import React, { useState } from "react";
import { acceptOwnershipCall, addConsumerToSubscriptionCall, createSubscriptionCall, fundSubscriptionCall, removeConsumerToSubscriptionCall, requestFunctionCall, transferOwnershipCall, walletClient } from "../functions-v2";
import { Address } from "viem";

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
  
    const handleButtonClick = async (callback: () => Promise<string>) => {
      try {
        setState("Running...");
        const result = await callback();
        setResult(result);
        setState("Success");
      } catch (error) {
        setState("Error");
        setResult(error.message);
      }
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
            const result = await fundSubscriptionCall(subid, amount);
            return (result as string | undefined)?.toString() ?? "";
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

    const removeConsumerToSubscriptionCallExecution = async () => {
        removeConsumerToSubscriptionCall(384, "0xf4C1B1B5f4885588f25231075D896Cf8D2946d60");
    };

    const transferOwnershipCallExecution = async () => {
        transferOwnershipCall(419, "0xe119584dd81d99eff581AED4D22B962D6CbEB426");
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
                    <button onClick={() => fundSubscriptionCallExecution(419, 1)}>Fund Subscription</button>
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
                    <button onClick={removeConsumerToSubscriptionCallExecution}>Remove Consumer to Subscription</button>
                    <br />
                </>
            )}

            {executionType === ExecutionType.TransferOwnershipCall && (
                <>
                    <button onClick={transferOwnershipCallExecution}>Transfer Ownership</button>
                    <br />
                </>
            )}

            {executionType === ExecutionType.AcceptOwnershipCall && (
                <>
                    <button onClick={acceptOwnershipCallExecution}>Accept Ownership</button>
                    <br />
                </>
            )}

        <p>State: {state}</p>
        <p>Result: {result}</p>
        </div>
    );
};