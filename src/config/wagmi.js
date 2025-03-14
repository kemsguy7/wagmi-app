import { mainnet, base, optimism, polygon, arbitrum } from 'wagmi/chains';
import { http, createConfig } from 'wagmi';
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors';

const config = createConfig({
  chains: [mainnet, base, optimism, polygon, arbitrum],
  connectors: [
    metaMask({
      shimDisconnect: true,
    }),
    coinbaseWallet({
      appName: 'My Web3 App',
      shimDisconnect: true,
    }),
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
});

export { config };
