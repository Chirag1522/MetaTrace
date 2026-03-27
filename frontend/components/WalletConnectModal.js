"use client";
import React, { useState, useEffect } from 'react';

const WalletConnectModal = ({ isOpen, onClose, onConnect }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    try {
      setError(null);
      if (!window.ethereum) {
        setError('MetaMask not detected. Please install MetaMask extension.');
        return;
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts[0]) {
        setWalletAddress(accounts[0]);
        localStorage.setItem('walletAddress', accounts[0]);
        onConnect(accounts[0]);
      }
    } catch (err) {
      console.error('Wallet connect error:', err);
      if (err.code === -32602) {
        setError('Invalid parameters provided to MetaMask');
      } else if (err.code === 4001) {
        setError('User rejected the wallet connection');
      } else {
        setError(err.message || 'Failed to connect wallet');
      }
    }
  };

  const skipWallet = () => {
    localStorage.setItem('walletSkipped', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">Connect Your Wallet</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          Connect your blockchain wallet to store metadata on-chain. Or continue with the default storage.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded mb-4 text-sm sm:text-base">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={connectWallet}
            disabled={walletAddress !== null}
            className={`w-full py-2 sm:py-3 px-4 rounded-lg font-semibold transition text-sm sm:text-base ${
              walletAddress
                ? 'bg-green-100 text-green-800 cursor-default'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {walletAddress ? `✓ Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect MetaMask'}
          </button>

          <button
            onClick={skipWallet}
            className="w-full py-2 sm:py-3 px-4 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition text-sm sm:text-base"
          >
            Continue Without Wallet
          </button>
        </div>

        <p className="text-xs sm:text-sm text-gray-500 mt-6 text-center">
          You can connect your wallet later from your profile settings
        </p>
      </div>
    </div>
  );
};

export default WalletConnectModal;
