import React from 'react';
import { ExecutionButtons, ExecutionType } from './ExecutionButtons';

type Props = {
  executionType: string | ExecutionType;
  otherParameter: string | null;
};

const HeroSection: React.FC<Props> = ({ executionType, otherParameter }: Props) => (
  <section className="hero">
    <div className="container">
      <h1 className="hero-title">Welcome to Chainlink Functions!</h1>
      <p className="hero-description">We've built this tool to empower you to seamlessly execute functions within the Chainlink network using ChatGPT.</p>
      <ExecutionButtons executionType={executionType}/>
    </div>
  </section>
);

export default HeroSection;
