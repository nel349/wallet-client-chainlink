import { Address, Chain, createPublicClient, getContract, http } from "viem";
import FunctionsConsumer from '../build/artifacts/contracts/FunctionsConsumer.sol/FunctionsConsumer.json';
import { sepolia } from "viem/chains";

const currentChain = sepolia as Chain;

const ReturnType = {
  uint: "uint256",
  uint256: "uint256",
  int: "int256",
  int256: "int256",
  string: "string",
  bytes: "Buffer",
  Buffer: "Buffer",
}

const publicClient = createPublicClient({
  chain: currentChain,
  transport: http(),
});

export async function getLatestResponse(contractAddr: string) {

  const clientContract = getContract({
    address: contractAddr as Address,
    abi: FunctionsConsumer.abi,
    publicClient,
  });


    let latestError = await clientContract.read.latestError() as any;
    if (latestError.length > 0 && latestError !== "0x") {
      const errorString = Buffer.from(latestError.slice(2), "hex").toString()
      console.log(`\nOn-chain error message: ${Buffer.from(latestError.slice(2), "hex").toString()}`)
    }

    let latestResponse = await clientContract.read.latestResponse() as any;
    let latestRequestId = await clientContract.read.latestRequestId() as any;
    if (latestResponse.length > 0 && latestResponse !== "0x") {
      // const requestConfig = require(path.isAbsolute(taskArgs.configpath)
      //   ? taskArgs.configpath
      //   : path.join(process.cwd(), taskArgs.configpath))
      console.log(`Last request id was ${latestRequestId}`)
      console.log(
        `\nOn-chain response represented as a hex string: ${latestResponse}\n${getDecodedResultLog(
          ReturnType.uint256,
          latestResponse
        )}`
      )
    }
}

const getDecodedResultLog = (expectedReturnType, successResult) => {
  let resultLog = ""
  if (expectedReturnType && expectedReturnType !== "Buffer") {
    let decodedOutput
    switch (expectedReturnType) {
      case "uint256":
        decodedOutput = BigInt("0x" + successResult.slice(2).slice(-64))
        break
      case "int256":
        decodedOutput = signedInt256toBigInt("0x" + successResult.slice(2).slice(-64))
        break
      case "string":
        decodedOutput = Buffer.from(successResult.slice(2), "hex").toString()
        break
      default:
        const end = expectedReturnType
        throw new Error(`unused expectedReturnType ${end}`)
    }
    const decodedOutputLog = `Decoded as a ${expectedReturnType}: ${decodedOutput}`
    resultLog += `${decodedOutputLog}\n`
  }
  return resultLog
}

const signedInt256toBigInt = (hex) => {
  const binary = BigInt(hex).toString(2).padStart(256, "0")
  // if the first bit is 0, number is positive
  if (binary[0] === "0") {
    return BigInt(hex)
  }
  return -(BigInt(2) ** BigInt(255)) + BigInt(`0b${binary.slice(1)}`)
}
