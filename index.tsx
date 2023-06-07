import React from 'react'
import ReactDOM from 'react-dom/client'
import 'viem/window'
import { ExecutionButtons, ExecutionType } from './components/ExecutionButtons';
import HeroSection from './components/HeroSection';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <HeroSection />
)
