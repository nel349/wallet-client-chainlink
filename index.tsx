import React from 'react'
import ReactDOM from 'react-dom/client'
import 'viem/window'
import { Example } from './components/Examples'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <Example />,
)
