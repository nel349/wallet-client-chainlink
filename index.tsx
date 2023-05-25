import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Address, createWalletClient, custom, parseEther, getContract, createPublicClient, http } from 'viem'
import { polygonMumbai } from 'viem/chains'
import 'viem/window'
import { EtherscanApi } from './etherscan/service'
import { parseAbi } from 'viem'
import { ethers } from 'ethers'

const walletClient = createWalletClient({
  chain: polygonMumbai,
  transport: custom(window.ethereum!),
})

const publicClient = createPublicClient({
  chain: polygonMumbai,
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
    etherscanService.getAbi('0xdAC17F958D2ee523a2206206994597C13D831ec7').then((abi) => {
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
      //     address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      //     abi: wagmiAbi,
      //     functionName: 'balanceOf',
      //     args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC']
      //   })
      // }


      

    });
    


  }, []);

  const connect = async () => {
    const [address] = await walletClient.requestAddresses()
    setAccount(address)
  }



  // const contract = getContract({
  //   abi: contractAbi,
  //   address: contractAddress,
  //   walletClient
  // }); 


  // async function makeContractCall() {

  //   const result = await contract.
  //   console.log(result);
  // }

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
      params: [{ chainId: `0x${polygonMumbai.id}` }],
    });
  }


  if (account)
    return (
      <>
        <div>Connected: {account}</div>
        <button onClick={sendTransaction}>Send Transaction</button>
      </>
    )
  return <button onClick={connect}>Connect Wallet</button>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Example />,
)
