import React from 'react';
import { ExecutionButtons, ExecutionType } from './ExecutionButtons';

const HeroSection: React.FC = () => (
  <section className="hero">
    <div className="container">
      <h1 className="hero-title">Welcome to Chainlink</h1>
      <p className="hero-description">Decentralized oracle network</p>
      <ExecutionButtons executionType={ExecutionType.CreateSubscriptionCall}/>
    </div>
  </section>
);

export default HeroSection;
