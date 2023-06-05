import { Chain, createWalletClient, custom } from "viem";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

const currentChain = sepolia as Chain;

export const publicClient = createPublicClient({
    chain: currentChain,
    transport: http(),
});

const [account] = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });

export const walletClient = createWalletClient({
    chain: currentChain,
    transport: typeof window.ethereum !== 'undefined' ? custom(window.ethereum) : http(),
    account: account,
});