// src/components/portfolio/Assets.js
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTokenBalances } from '../../services/evm/tokens';
import { tokenList } from '../../services/evm/tokenlist';
// import { getUserNFTs } from '../../services/evm/nfts'; // désactivé pour l’instant
import './Portfolio.css';

function Assets({ address }) {
  const [activeTab, setActiveTab] = useState('tokens');

  // Vérifier si l'adresse est valide
  const isValidAddress =
    typeof address === 'string' && address.startsWith('0x') && address.length === 42;

  // Fetch tokens (passe tokenList)
  const {
    data: tokens = [],
    isLoading: loadingTokens,
    error: tokenError,
    refetch: refetchTokens,
  } = useQuery({
    queryKey: ['tokens', address],
    queryFn: () => getTokenBalances(address, tokenList),
    enabled: isValidAddress,
    staleTime: 30_000,
    onError: (error) => {
      console.error('Error fetching tokens:', error);
    },
  });

  // Fetch NFTs (désactivé pour l’instant)
  const {
    data: nfts = [],
    isLoading: loadingNFTs,
    error: nftError,
    refetch: refetchNFTs,
  } = useQuery({
    queryKey: ['nfts', address],
    // queryFn: () => getUserNFTs(address),
    queryFn: async () => [],
    enabled: false, // éviter l’appel tant que non implémenté
    staleTime: 60_000,
    onError: (error) => {
      console.error('Error fetching NFTs:', error);
    },
  });

  // Calculer la valeur totale du portfolio (si pas de prix, restera 0)
  const totalValue = tokens.reduce((sum, token) => sum + (token.value || 0), 0);

  // Debug logs
  useEffect(() => {
    if (isValidAddress) {
      console.log('📊 Assets component - Address:', address);
      console.log('💰 Tokens found:', tokens.length);
      console.log('🖼️ NFTs found:', nfts.length);
    }
  }, [address, tokens, nfts, isValidAddress]);

  if (!isValidAddress) {
    return (
      <div className="assets-container">
        <div className="error-message">
          ⚠️ Invalid address format. Please enter a valid Ethereum address.
        </div>
      </div>
    );
  }

  return (
    <div className="assets-container">
      <div className="assets-header">
        <h2>Portfolio Assets</h2>
        <div className="portfolio-value">
          <span className="value-label">Total Value:</span>
          <span className="value-amount">${totalValue.toFixed(2)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="assets-tabs">
        <button
          className={`tab-button ${activeTab === 'tokens' ? 'active' : ''}`}
          onClick={() => setActiveTab('tokens')}
        >
          Tokens ({tokens.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'nfts' ? 'active' : ''}`}
          onClick={() => setActiveTab('nfts')}
        >
          NFTs ({nfts.length})
        </button>
      </div>

      {/* Contenu des tabs */}
      <div className="assets-content">
        {activeTab === 'tokens' && (
          <div className="tokens-section">
            {loadingTokens ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading tokens from Monad Testnet...</p>
              </div>
            ) : tokenError ? (
              <div className="error-message">
                <p>❌ Error loading tokens: {String(tokenError.message || tokenError)}</p>
                <button onClick={refetchTokens} className="retry-button">
                  Retry
                </button>
              </div>
            ) : tokens.length === 0 ? (
              <div className="empty-state">
                <p>No tokens found in this wallet</p>
                <p className="address-display">Address: {address}</p>
              </div>
            ) : (
              <div className="tokens-grid">
                {tokens.map((token, index) => (
                  <div key={index} className="token-card">
                    <div className="token-header">
                      <img
                        src={
                          token.imageURL ||
                          `https://via.placeholder.com/40/8B5CF6/FFFFFF?text=${token.symbol?.[0] || '?'}`
                        }
                        alt={token.symbol}
                        className="token-icon"
                      />
                      <div className="token-info">
                        <span className="token-symbol">{token.symbol}</span>
                        <span className="token-name">{token.name || 'Unknown Token'}</span>
                      </div>
                    </div>
                    <div className="token-balance">
                      <div className="balance-amount">{(token.balance ?? 0).toFixed(6)}</div>
                      <div className="balance-value">${(token.value ?? 0).toFixed(2)}</div>
                    </div>
                    <div className="token-address">
                      {token.address?.slice(0, 8)}...{token.address?.slice(-6)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'nfts' && (
          <div className="nfts-section">
            {loadingNFTs ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading NFTs...</p>
              </div>
            ) : nftError ? (
              <div className="error-message">
                <p>❌ Error loading NFTs: {String(nftError.message || nftError)}</p>
                <button onClick={refetchNFTs} className="retry-button">
                  Retry
                </button>
              </div>
            ) : nfts.length === 0 ? (
              <div className="empty-state">
                <p>No NFTs found or NFT fetching disabled</p>
                <p className="address-display">Address: {address}</p>
              </div>
            ) : (
              <div className="nfts-grid">
                {nfts.map((nft, index) => (
                  <div key={index} className="nft-card">
                    <div className="nft-thumb">🖼️</div>
                    <div className="nft-info">
                      <div className="nft-title">{nft.name || `#${nft.tokenId}`}</div>
                      <div className="nft-collection">{nft.collection || 'Unknown'}</div>
                    </div>
                    <div className="nft-id">ID: {String(nft.tokenId)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Assets;
