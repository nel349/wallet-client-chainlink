import React from 'react';
import { ExecutionButtons } from './ExecutionButtons';

type HeroSectionProps = Record<string, any>;

const HeroSection: React.FC<HeroSectionProps> = (props: any) => (
  <section className="hero">
    <div className="container">
      <h1 className="hero-title">Welcome to Chainlink Functions!</h1>
      <p className="hero-description">We've built this tool to empower you to seamlessly execute functions within the Chainlink network using ChatGPT.</p>
      <div>
        {props.subscriptionId && <p>Subscription id: {props.subscriptionId}</p>}
        {props.consumerAddress && <p>Consumer address: {props.consumerAddress}</p>}
        {props.amount && <p>Amount: {props.amount}</p>}
        {props.newOwnerAddress && <p>New owner address: {props.newOwnerAddress}</p>}
    </div>
      <ExecutionButtons 
        executionType={props.executionType as string}
        {...props}
      />
    </div>
  </section>
);

export default HeroSection;
