'use client'

import React from 'react'
import { 
  RainbowKitProvider,
  getDefaultConfig, darkTheme, midnightTheme
} from '@rainbow-me/rainbowkit';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
  goerli,
  sepolia,
} from "wagmi/chains";
import { WagmiProvider } from 'wagmi'
import { http } from 'viem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const projectId = "c60d838bc7682699062e8af4283518b3";
const chains = [mainnet, polygon, optimism, arbitrum, base, zora, goerli,sepolia];

// Create a client
const queryClient = new QueryClient()

const config = getDefaultConfig({
  appName: "NFTNexus",
  projectId: projectId,
  chains,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [zora.id]: http(),
    [goerli.id]: http(),
  },
});

const Providers = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider chains={chains} modalSize='lg'  
         theme={darkTheme({
          accentColor: '#d9dbd9',
          accentColorForeground: 'black',
          borderRadius: 'medium',
          fontStack: 'system',
        })}>
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}

export default Providers