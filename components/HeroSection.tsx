import React from 'react';
import { ExecutionButtons, ExecutionType } from './ExecutionButtons';

type Props = {
  executionType: string | ExecutionType;
  otherParameter: string | null;
};

const HeroSection: React.FC<Props> = ({ executionType, otherParameter }: Props) => (
  <section className="hero">
    <div className="container">
      <h1 className="hero-title">Welcome to Chainlink</h1>
      <p className="hero-description">Decentralized oracle network</p>
      <ExecutionButtons executionType={executionType}/>
    </div>
  </section>
);

export default HeroSection;
