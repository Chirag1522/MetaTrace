import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  moonbaseAlpha,
  sepolia,
  mainnet,
  polygon,
  optimism,
  arbitrum,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'MetaTrace',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [
    moonbaseAlpha,
    sepolia,
    mainnet,
    polygon,
    optimism,
    arbitrum,
  ],
  ssr: true,
});
