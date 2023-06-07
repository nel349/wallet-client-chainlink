import React from "react";
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
    return (
        <div>
            {executionType === ExecutionType.RequestFunctionCall && (
                <>
                    <button onClick={() => {
                        requestFunctionCall("0xf4C1B1B5f4885588f25231075D896Cf8D2946d60", 384, walletClient);
                    }}>Run function WC</button>
                    <br />
                    <br />
                </>
            )}

            {executionType === ExecutionType.FundSubscriptionCall && (
                <>
                    <button onClick={() => {
                        fundSubscriptionCall(384, 2);
                    }}>Fund Link</button>
                    <br />
                </>
            )}

            {executionType === ExecutionType.CreateSubscriptionCall && (
                <>
                    <button onClick={() => {
                        createSubscriptionCall();
                    }}>Create subscription</button>
                    <br />
                </>
            )}

            {executionType === ExecutionType.AddConsumerToSubscriptionCall && (
                <>
                    <button onClick={() => {
                        addConsumerToSubscriptionCall(384, "0xf4C1B1B5f4885588f25231075D896Cf8D2946d60");
                    }}>Add consumer to Subscription</button>
                    <br />
                </>
            )}

            {executionType === ExecutionType.RemoveConsumerToSubscriptionCall && (
                <>
                    <button onClick={() => {
                        removeConsumerToSubscriptionCall(384, "0xf4C1B1B5f4885588f25231075D896Cf8D2946d60");
                    }}>Remove consumer to Subscription</button>
                    <br />
                </>
            )}

            {executionType === ExecutionType.TransferOwnershipCall && (
                <>
                    <button onClick={() => {
                        transferOwnershipCall(419, "0xe119584dd81d99eff581AED4D22B962D6CbEB426");
                    }}>Transfer owner of subscription</button>
                    <br />
                </>
            )}

            {executionType === ExecutionType.AcceptOwnershipCall && (
                <>
                    <button onClick={() => {
                        acceptOwnershipCall(419);
                    }}>Accept ownership of subscription</button>
                    <br />
                </>
            )}
        </div>
    );
};