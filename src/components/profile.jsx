import { useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useChainId,
  useChains,
  useSwitchChain,
} from 'wagmi';
import '../assets/profile.css';

const Profile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const { address, isConnected } = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
  });
  const chainId = useChainId();
  const chains = useChains();
  const { switchChain } = useSwitchChain();

  const openModal = () => {
    setConnectionError('');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleConnect = (connector) => {
    setConnectionError('');
    connect({ connector, chainId });
  };

  if (isConnected) {
    return (
      <div className='profile-container'>
        <div className='wallet-info'>
          <h2>Wallet Connected</h2>
          <div className='info-row'>
            <span className='label'>Status:</span>
            <span className='value connected'>Connected</span>
          </div>
          <div className='info-row'>
            <span className='label'>Address:</span>
            <span className='value'>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
          </div>
          <div className='info-row'>
            <span className='label'>Balance:</span>
            <span className='value'>
              {balance?.formatted} {balance?.symbol}
            </span>
          </div>
          <div className='info-row'>
            <span className='label'>Network:</span>
            <span className='value'>{chains.find((c) => c.id === chainId)?.name || chainId}</span>
          </div>
          <div className='network-switcher'>
            <h3>Switch Network</h3>
            <div className='networks-grid'>
              {chains.map((x) => (
                <button
                  key={x.id}
                  onClick={() => switchChain({ chainId: x.id })}
                  className={x.id === chainId ? 'active' : ''}
                >
                  {x.name}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => disconnect()} className='disconnect-btn'>
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='profile-container'>
      <div className='connect-wallet'>
        <h2>Connect Wallet</h2>
        <p>Connect your wallet to access the application</p>
        <button onClick={openModal} className='connect-btn'>
          Connect Wallet
        </button>
      </div>

      {isModalOpen && (
        <div className='modal-backdrop'>
          <div className='modal'>
            <div className='modal-header'>
              <h3>Connect a Wallet</h3>
              <button onClick={closeModal} className='close-btn'>
                ×
              </button>
            </div>
            <div className='modal-content'>
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={connector.id !== 'walletConnect' && !connector.ready}
                  className='wallet-option'
                >
                  <div className='wallet-name'>{connector.name}</div>
                  <div className='wallet-status'>
                    {connector.id === 'walletConnect'
                      ? '(QR code)'
                      : !connector.ready
                      ? '(not installed)'
                      : '(ready)'}
                  </div>
                </button>
              ))}
              {error && <div className='error'>{error.message}</div>}
              {connectionError && <div className='error'>{connectionError}</div>}
              {status === 'pending' && <div className='connecting-status'>Connecting...</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
