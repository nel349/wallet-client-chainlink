import React from 'react'
import ReactDOM from 'react-dom/client'
import 'viem/window'
import HeroSection from './components/HeroSection';
import { ExecutionType } from './components/ExecutionButtons';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const searchParams = new URLSearchParams(window.location.search);
const executionTypeParam = searchParams.get('executionType') ?? "";
const otherParameter = searchParams.get('otherParameter');
console.log("executionTypeParam: ", executionTypeParam);

root.render(
  <HeroSection executionType={executionTypeParam} otherParameter={otherParameter} />
)

// function toPascalCase(str: string): string {
//   return str.replace(/(\w)(\w*)/g, (_, firstChar, rest) => firstChar.toUpperCase() + rest.toLowerCase());
// }
