import React, { useState, useEffect } from "react";
import { Address, parseEther } from "viem";
import { EtherscanApi } from "../etherscan/service";
import { walletClient, getSubscriptionBalanceCall, requestFunctionCall, getLatestResponse, fundSubscriptionCall, createSubscriptionCall, addConsumerToSubscriptionCall, removeConsumerToSubscriptionCall, transferOwnershipCall, acceptOwnershipCall } from "../functions-v2";
import { sepolia } from "viem/chains";

const currentChain = sepolia

export function Example() {
    // const [account, setAccount] = useState<Address>();
  
    // useEffect(() => {
    //   // const isConnected = localStorage.getItem('isConnected');
    //   // if (!isConnected) {
    //   //   connect();
    //   //   localStorage.setItem('isConnected', 'true');
    //   // }
  
    //   // async function getAddress() {
    //   //   const [address] = await walletClient.getAddresses();
    //   //   return address;
    //   // }
  
    //   // getAddress().then((address) => {
    //   //   setAccount(address);
    //   // });
  
    //   // walletClient.requestAddresses().then(([address]) => {
    //   //   console.log('connected address', address);
    //   //   setTimeout(() => {
    //   //     walletClient.sendTransaction({
    //   //       account: address,
    //   //       to: '0xe119584dd81d99eff581AED4D22B962D6CbEB426',
    //   //       value: parseEther('0.000001'),
    //   //     })
    //   //   }, 1000);
    //   // });
  
  
  
    //     //Ask if user would like to call any of this functions?
    //     // const iface = new ethers.Interface(abi);
    //     // console.log(iface.format());
  
    //     // const contract = getContract({
    //     //     abi: JSON.parse(abi),
    //     //     address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    //     //     walletClient
    //     //   });
  
    //     //   console.log(contract);
  
    //     // {
    //     //   const data = await publicClient.readContract({
    //     //     address: currentTestingContract,
    //     //     abi: JSON.parse(abi),
    //     //     functionName: 'balanceOf',
    //     //     args: [currentTestUser]
    //     //   })
    //     //   console.log("Result:", data);
    //     // }
  
    //     // {
    //     //   const data = await publicClient.readContract({
    //     //     address: currentTestingContract,
    //     //     abi: JSON.parse(abi),
    //     //     functionName: 'name',
    //     //     args: []
    //     //   })
    //     //   console.log("Result:", data);
    //     // }
    //   });
  
  
  
    // }, []);
  
    // const connect = async () => {
    //   const [address] = await walletClient.requestAddresses()
    //   setAccount(address)
    // }
  
    // const sendTransaction = async () => {
    //   if (!account) {
    //     console.log('no account')
    //     return;
    //   }
    //   // changeToMumbai ();
    //   await walletClient.sendTransaction({
    //     account,
    //     to: '0xe119584dd81d99eff581AED4D22B962D6CbEB426',
    //     value: parseEther('0.000001'),
    //   })
    // }
  
    async function changeToMumbai() {
      const ethereum = window.ethereum;
      if (!ethereum) {
        console.log('Ethereum object not found');
        return;
      }
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${currentChain.id}` }],
      });
    }
  
    const [subscriptionId, setSubscriptionId] = useState('');
  
    const handleSubscriptionIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSubscriptionId(event.target.value);
    };
  
    const handleSubscriptionBalanceClick = () => {
      // Handle subscription balance click here
      getSubscriptionBalanceCall(subscriptionId);
    };
  
    
    return (
      <>  
        <button onClick={() => {
          requestFunctionCall("0xf4C1B1B5f4885588f25231075D896Cf8D2946d60", 384, walletClient);
        }}>Run function WC</button>
        <br />
        <br />

        <br />
        <button onClick={() => {
          fundSubscriptionCall(384, 2);
        }}>Fund Link</button>

        <br />
        <button onClick={() => {
          createSubscriptionCall();
        }}>Create subscription</button>
  
        <br />
        <button onClick={() => {
          addConsumerToSubscriptionCall(384, "0xf4C1B1B5f4885588f25231075D896Cf8D2946d60");
        }}>Add consumer to Subscription</button>
  
        <br />
        <button onClick={() => {
          removeConsumerToSubscriptionCall(384, "0xf4C1B1B5f4885588f25231075D896Cf8D2946d60");
        }}>Remove consumer to Subscription</button>
  
        <br />
        <button onClick={() => {
          transferOwnershipCall(419, "0xe119584dd81d99eff581AED4D22B962D6CbEB426");
        }}>Transfer owner of subscription</button>
  
        <br />
        <button onClick={() => {
          acceptOwnershipCall(419);
        }}>Accept ownership of subscription</button>
      </>
    )
}


