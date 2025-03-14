import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  WagmiProvider,
  useAccount,
  useConnect,
  useDisconnect,
  useEnsName,
  useBalance,
  useChainId,
  useChains,
  useSwitchChain,
} from 'wagmi';

import '../src/assets/wallet.css';
import { config } from './config/wagmi';

// Create a client for React Query with retries enabled
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// ======== Wallet Modal Component ========
function WalletModal({ isOpen, onClose }) {
  const { connectors, connect, error: connectError } = useConnect();
  const [readyConnectors, setReadyConnectors] = useState([]);
  const [error, setError] = useState(null);

  // Check which connectors are ready
  useEffect(() => {
    // Reset error when modal opens
    if (isOpen) {
      setError(null);
    }

    const checkConnectors = async () => {
      try {
        const ready = await Promise.all(
          connectors.map(async (connector) => {
            try {
              // For other connectors, check if provider is available
              const provider = await connector.getProvider().catch(() => null);
              return {
                ...connector,
                ready: !!provider,
              };
            } catch (e) {
              console.log(`Error checking connector ${connector.name}:`, e);
              return {
                ...connector,
                ready: false,
              };
            }
          }),
        );
        setReadyConnectors(ready);
      } catch (e) {
        console.error('Error checking connectors:', e);
        setError('Failed to initialize wallet connectors');
      }
    };

    if (isOpen) {
      checkConnectors();
    }
  }, [connectors, isOpen]);

  // Update error state when connect error changes
  useEffect(() => {
    if (connectError) {
      setError(connectError.message);
    }
  }, [connectError]);

  const handleConnect = async (connector) => {
    try {
      setError(null);
      await connect({ connector });
      onClose();
    } catch (e) {
      console.error('Connection error:', e);
      setError(e.message || 'Failed to connect to wallet');
    }
  };

  if (!isOpen) return null;

  return (
    <div className='modal-overlay'>
      <div className='modal-container'>
        <div className='modal-header'>
          <h3>Connect Wallet</h3>
          <button className='close-button' onClick={onClose}>
            ×
          </button>
        </div>

        <div className='modal-content'>
          <p>Please select a wallet to connect:</p>

          <div className='wallet-list'>
            {readyConnectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => handleConnect(connector)}
                disabled={!connector.ready}
                className='wallet-button'
              >
                <span>{connector.name}</span>
                {!connector.ready && <span className='not-ready'> (not installed)</span>}
              </button>
            ))}
          </div>

          {error && (
            <div className='error-message'>
              {error}
              {error.includes('provider') && (
                <p className='error-hint'>
                  Please make sure you have a wallet extension installed.
                </p>
              )}
            </div>
          )}

          <div className='install-hint'>
            <p>Don't have a wallet?</p>
            <div className='wallet-links'>
              <a
                href='https://metamask.io/download/'
                target='_blank'
                rel='noopener noreferrer'
                className='wallet-link'
              >
                Install MetaMask
              </a>
              <a
                href='https://www.coinbase.com/wallet/downloads'
                target='_blank'
                rel='noopener noreferrer'
                className='wallet-link'
              >
                Install Coinbase Wallet
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ======== Network Switcher Component ========
function NetworkSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const chainId = useChainId();
  const chains = useChains();
  const { switchChain, error, isLoading, pendingChainId } = useSwitchChain();

  const currentChain = chains.find((chain) => chain.id === chainId);

  return (
    <div className='network-switcher'>
      <button className='network-display' onClick={() => setIsOpen(!isOpen)}>
        <div className='network-indicator'></div>
        <span>{currentChain?.name || 'Unknown Network'}</span>
        <span className='dropdown-arrow'>▼</span>
      </button>

      {isOpen && (
        <div className='network-dropdown'>
          {chains.map((chain) => (
            <button
              key={chain.id}
              onClick={() => {
                switchChain({ chainId: chain.id });
                setIsOpen(false);
              }}
              disabled={chain.id === chainId || isLoading}
              className={chain.id === chainId ? 'active' : ''}
            >
              {chain.name}
              {isLoading && pendingChainId === chain.id && ' (switching...)'}
            </button>
          ))}
        </div>
      )}

      {error && <div className='error-message'>{error.message}</div>}
    </div>
  );
}

// ======== Account Component ========
function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: balance } = useBalance({ address });

  // Truncate address for display
  const displayAddress = address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : '';

  return (
    <div className='account-container'>
      <div className='account-header'>
        <h3>Connected Wallet</h3>
      </div>

      <div className='account-details'>
        <div className='account-info'>
          <div className='info-row'>
            <span className='label'>Address:</span>
            <span className='value'>{ensName || displayAddress}</span>
          </div>

          <div className='info-row'>
            <span className='label'>Balance:</span>
            <span className='value'>
              {balance
                ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
                : 'Loading...'}
            </span>
          </div>

          <div className='info-row'>
            <span className='label'>Network:</span>
            <div className='network-container'>
              <NetworkSwitcher />
            </div>
          </div>
        </div>

        <button className='disconnect-button' onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    </div>
  );
}

// ======== Connect Wallet Component ========
function ConnectWallet() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnected } = useAccount();

  // Handle ethereum check
  useEffect(() => {
    const handleEthereum = () => {
      const { ethereum } = window;
      if (ethereum && ethereum.isMetaMask) {
        console.log('MetaMask is installed!');
      }
    };

    // Use this safer check that won't trigger errors
    if (typeof window !== 'undefined') {
      if (window.ethereum) {
        handleEthereum();
      } else {
        window.addEventListener('ethereum#initialized', handleEthereum, {
          once: true,
        });
        // If the event is not dispatched by the end of the timeout,
        // the user probably doesn't have MetaMask installed.
        setTimeout(handleEthereum, 3000); // 3 seconds
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ethereum#initialized', handleEthereum);
      }
    };
  }, []);

  if (isConnected) {
    return <Account />;
  }

  return (
    <div className='connect-container'>
      <h3>Welcome to My Web3 App</h3>
      <p>Please connect your wallet to continue</p>

      <button className='connect-button' onClick={() => setIsModalOpen(true)}>
        Connect Wallet
      </button>

      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

// ======== Main App Component ========
function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className='app'>
          <ConnectWallet />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
