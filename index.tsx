import React from 'react'
import ReactDOM from 'react-dom/client'
import 'viem/window'
import HeroSection from './components/HeroSection';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const searchParams = new URLSearchParams(window.location.search);
const executionTypeParam = searchParams.get('executionType') ?? "";
const subscriptionId = searchParams.get('subscriptionId');
const consumerAddress = searchParams.get('consumerAddress');
const amount = searchParams.get('amount');
const newOwnerAddress = searchParams.get('newOwnerAddress');
const urlSource = searchParams.get('urlSource');
console.log("executionTypeParam: ", executionTypeParam);

root.render(
  <HeroSection 
    executionType={executionTypeParam}
    subscriptionId={subscriptionId}
    consumerAddress={consumerAddress}
    amount={amount}
    newOwnerAddress={newOwnerAddress}
    urlSource={urlSource}
  />
)
