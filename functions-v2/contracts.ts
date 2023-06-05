import { Address } from 'viem';

import FunctionsOracle from '../build/artifacts/contracts/dev/functions/FunctionsOracle.sol/FunctionsOracle.json';
import FunctionsConsumer from '../build/artifacts/contracts/FunctionsConsumer.sol/FunctionsConsumer.json';
import FunctionsBillingRegistry from '../build/artifacts/contracts/dev/functions/FunctionsBillingRegistry.sol/FunctionsBillingRegistry.json';
import { networks } from './networks';

export {FunctionsOracle, FunctionsConsumer, FunctionsBillingRegistry};

export const FunctionsOracleContract = { address: networks.ethereumSepolia["functionsOracleProxy"] as Address, abi: FunctionsOracle.abi };
