import React, { useState } from "react";
import { acceptOwnershipCall, addConsumerToSubscriptionCall, createSubscriptionCall, fundSubscriptionCall, removeConsumerToSubscriptionCall, requestFunctionCall, transferOwnershipCall, walletClient } from "../functions-v2";

type Props = {
    executionType: string;
}

export enum ExecutionType {
    RequestFunctionCall = "requestFunctionCall",
    FundSubscriptionCall = "fundSubscriptionCall",
    CreateSubscriptionCall = "createSubscriptionCall",
    AddConsumerToSubscriptionCall = "addConsumerToSubscriptionCall",
    RemoveConsumerToSubscriptionCall = "removeConsumerToSubscriptionCall",
    TransferOwnershipCall = "transferOwnershipCall",
    AcceptOwnershipCall = "acceptOwnershipCall",
};

export const ExecutionButtons = ({ executionType }: Props) => {

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

    const addConsumerToSubscriptionCallExecution = async () => {
        addConsumerToSubscriptionCall(384, "0xf4C1B1B5f4885588f25231075D896Cf8D2946d60");
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
                    Run function WC
                </button>
                <br />
                <br />
                </>
            )}

            {executionType === ExecutionType.FundSubscriptionCall && (
                <>
                    <button onClick={() => fundSubscriptionCallExecution(419, 1)}>Fund Link</button>
                    <br />
                </>
            )}

            {executionType === ExecutionType.CreateSubscriptionCall && (
                <>
                    <button onClick={createSubscriptionCallExecution}>Create subscription</button>
                    <br />
                </>
            )}

            {executionType === ExecutionType.AddConsumerToSubscriptionCall && (
                <>
                    <button onClick={addConsumerToSubscriptionCallExecution}>Add consumer to Subscription</button>
                    <br />
                </>
            )}

            {executionType === ExecutionType.RemoveConsumerToSubscriptionCall && (
                <>
                    <button onClick={removeConsumerToSubscriptionCallExecution}>Remove consumer to Subscription</button>
                    <br />
                </>
            )}

            {executionType === ExecutionType.TransferOwnershipCall && (
                <>
                    <button onClick={transferOwnershipCallExecution}>Transfer owner of subscription</button>
                    <br />
                </>
            )}

            {executionType === ExecutionType.AcceptOwnershipCall && (
                <>
                    <button onClick={acceptOwnershipCallExecution}>Accept ownership of subscription</button>
                    <br />
                </>
            )}

        <p>State: {state}</p>
        <p>Result: {result}</p>
        </div>
    );
};