import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Address, createWalletClient, custom, parseEther, getContract, createPublicClient, http } from 'viem'
import { mainnet, polygonMumbai } from 'viem/chains'
import 'viem/window'
import { EtherscanApi } from './etherscan/service'
import { requestFunctionCall } from './functions-v2/request_new'
import { readResultFunctionCall } from './functions-v2/readResultAndError'
import { fundSubscriptionCall } from './functions-v2/fund_subscription'
import { getSubscriptionBalanceCall } from './functions-v2/checkSubscriptionBalance'
import { createSubscriptionCall } from './functions-v2/createSubscription'
import { addConsumerToSubscriptionCall } from './functions-v2/addConsumer'
import { removeConsumerToSubscriptionCall } from './functions-v2/removeConsumer'
import { transferOwnershipCall } from './functions-v2/transferSubscription'
import { acceptOwnershipCall } from './functions-v2/acceptTransferOwnership'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
const currentChain = mainnet;
const currentTestingContract = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const currentTestUser = "0x9584DD0D9bA9d81103020281B77EA23cAaC4e3A4";

const walletClient = createWalletClient({
  chain: currentChain,
  transport: custom(window.ethereum!),
})

const publicClient = createPublicClient({
  chain: currentChain,
  transport: http()
})

function Example() {
  const [account, setAccount] = useState<Address>()

  useEffect(() => {
    // const isConnected = localStorage.getItem('isConnected');
    // if (!isConnected) {
    //   connect();
    //   localStorage.setItem('isConnected', 'true');
    // }

    // async function getAddress() {
    //   const [address] = await walletClient.getAddresses();
    //   return address;
    // }

    // getAddress().then((address) => {
    //   setAccount(address);
    // });

    // walletClient.requestAddresses().then(([address]) => {
    //   console.log('connected address', address);
    //   setTimeout(() => {
    //     walletClient.sendTransaction({
    //       account: address,
    //       to: '0xe119584dd81d99eff581AED4D22B962D6CbEB426',
    //       value: parseEther('0.000001'),
    //     })
    //   }, 1000);
    // });


    const etherscanService = new EtherscanApi("Y3UYYUXD327T6UFR8DQP4FHJ42UBURF92E");
    etherscanService.getAbi(currentTestingContract).then(async (abi) => {
      // console.log("ABI", abi);


      //Ask if user would like to call any of this functions?
      // const iface = new ethers.Interface(abi);
      // console.log(iface.format());

      // const contract = getContract({
      //     abi: JSON.parse(abi),
      //     address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      //     walletClient
      //   });

      //   console.log(contract);

      // {
      //   const data = await publicClient.readContract({
      //     address: currentTestingContract,
      //     abi: JSON.parse(abi),
      //     functionName: 'balanceOf',
      //     args: [currentTestUser]
      //   })
      //   console.log("Result:", data);
      // }

      // {
      //   const data = await publicClient.readContract({
      //     address: currentTestingContract,
      //     abi: JSON.parse(abi),
      //     functionName: 'name',
      //     args: []
      //   })
      //   console.log("Result:", data);
      // }
    });



  }, []);

  const connect = async () => {
    const [address] = await walletClient.requestAddresses()
    setAccount(address)
  }

  const sendTransaction = async () => {
    if (!account) {
      console.log('no account')
      return;
    }
    // changeToMumbai ();
    await walletClient.sendTransaction({
      account,
      to: '0xe119584dd81d99eff581AED4D22B962D6CbEB426',
      value: parseEther('0.000001'),
    })
  }

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
      {/* <FunctionButtonsComponent requestType="functions-request" /> */}

      <button onClick={() => {
        requestFunctionCall("0xf4C1B1B5f4885588f25231075D896Cf8D2946d60", 384, walletClient);
      }}>Run function WC</button>
      <br />
      <br />

      <button onClick={() => {
        readResultFunctionCall("0xf4C1B1B5f4885588f25231075D896Cf8D2946d60");
      }}>Read Result</button>

      <br />
      <button onClick={() => {
        fundSubscriptionCall(384, 2);
      }}>Fund Link</button>

      <br />
      {/* <button onClick={() => {
        
      }}>Subscription Balance</button> */}
      <div>
      <label htmlFor="subscriptionId">Subscription ID:</label>
      <input
        type="text"
        id="subscriptionId"
        name="subscriptionId"
        value={subscriptionId}
        onChange={handleSubscriptionIdChange}
      />
      <button onClick={handleSubscriptionBalanceClick}>Subscription Balance</button>
    </div>

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

root.render(
  <Example />,
)
