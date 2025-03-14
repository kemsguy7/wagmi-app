import { mainnet, base, optimism, polygon, arbitrum } from 'wagmi/chains';
import { http, createConfig } from 'wagmi';
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';

const projectId = '5522a0564d30a2b6a33387ae8bf3aa8f';

const walletConnectConfig = {
  projectId,
  metadata: {
    name: 'My Web3 App',
    description: 'My Web3 Application',
    url: window.location.origin,
  },
  showQrModal: true,
  // Add this to handle failed connections better
  relayUrl: 'wss://relay.walletconnect.org',
};

// Create wagmi config
const config = createConfig({
  chains: [mainnet, base, optimism, polygon, arbitrum],
  connectors: [
    injected({
      shimDisconnect: true,
      target: 'conflux',
    }),
    metaMask({
      shimDisconnect: true,
    }),
    walletConnect(walletConnectConfig),
    coinbaseWallet({
      appName: 'My Web3 App',
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

export { walletConnectConfig, config };
