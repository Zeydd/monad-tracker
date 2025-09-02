import React, { useState, useEffect } from 'react';
import PortfolioOverview from './PortfolioOverview';
import AssetComposition from './AssetComposition';
import DeFiPositions from './DeFiPositions';
import { getAllTokenBalances, calculateTokensValue } from '../../services/evm/tokens';
import { getAllUserNFTs } from '../../services/evm/nfts';

const Portfolio = () => {
  const [address, setAddress] = useState('');
  const [tokens, setTokens] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculs des valeurs
  const tokensValue = calculateTokensValue(tokens);
  const nftsValue = nfts.reduce((sum, nft) => sum + (nft.totalValue || 0), 0);
  const defiValue = 0;
  const totalValue = tokensValue + nftsValue + defiValue;

  const fetchPortfolioData = async (walletAddress) => {
    if (!walletAddress) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching portfolio data for:', walletAddress);
      
      const [tokensData, nftsData] = await Promise.allSettled([
        getAllTokenBalances(walletAddress),
        getAllUserNFTs(walletAddress)
      ]);

      if (tokensData.status === 'fulfilled') {
        setTokens(tokensData.value);
        console.log('Tokens loaded:', tokensData.value.length);
      } else {
        console.error('Error tokens:', tokensData.reason);
      }

      if (nftsData.status === 'fulfilled') {
        setNfts(nftsData.value);
        console.log('NFT collections loaded:', nftsData.value.length);
      } else {
        console.error('Error NFTs:', nftsData.reason);
      }

    } catch (err) {
      console.error('General error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData(address);
  }, [address]);

  const handleAddressChange = (e) => {
    e.preventDefault();
    const newAddress = e.target.address.value.trim();
    if (newAddress) {
      setAddress(newAddress);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  // Calculs des pourcentages
  const tokensPercent = totalValue > 0 ? (tokensValue / totalValue) * 100 : 0;
  const nftsPercent = totalValue > 0 ? (nftsValue / totalValue) * 100 : 0;
  const defiPercent = totalValue > 0 ? (defiValue / totalValue) * 100 : 0;

  // Calcul du nombre total de NFTs
  const totalNFTCount = nfts.reduce((sum, collection) => sum + collection.balance, 0);

  return (
    <div className="portfolio">
      {/* Search Section */}
      <div className="portfolio-search">
        <div className="search-container" style={{ justifyContent: 'flex-start' }}>
          <form onSubmit={handleAddressChange} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              className="search-input"
              name="address"
              type="text"
              placeholder="Enter wallet address (0x...) or .nad domain"
              defaultValue={address}
              style={{ maxWidth: '600px', minWidth: '500px' }}
            />
            <button 
              className="search-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>
        </div>
      </div>

      {/* 4 Dashboard Cards */}
      <div className="stats-grid">
        {/* Total Portfolio Value */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}>
              📊
            </div>
            <div className="stat-card-title">Total Portfolio Value</div>
          </div>
          <div className="stat-card-value">{formatCurrency(totalValue)}</div>
          <div className="stat-card-subtitle">Last updated: {new Date().toLocaleTimeString()}</div>
          <div className="stat-card-progress">
            <div className="progress-bar-full" style={{ backgroundColor: '#8b5cf6' }}></div>
          </div>
        </div>

        {/* Tokens */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              🪙
            </div>
            <div className="stat-card-title">Tokens</div>
          </div>
          <div className="stat-card-value">{formatCurrency(tokensValue)}</div>
          <div className="stat-card-subtitle">{tokens.length} tokens • {tokensPercent.toFixed(1)}% of Portfolio</div>
          <div className="stat-card-progress">
            <div 
              className="progress-bar-partial" 
              style={{ width: `${tokensPercent}%`, backgroundColor: '#f59e0b' }}
            ></div>
          </div>
        </div>

        {/* NFTs */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              🖼️
            </div>
            <div className="stat-card-title">NFTs</div>
          </div>
          <div className="stat-card-value">{formatCurrency(nftsValue)}</div>
          <div className="stat-card-subtitle">
            {totalNFTCount} NFTs in {nfts.length} collections • {nftsPercent.toFixed(1)}% of Portfolio
          </div>
          <div className="stat-card-progress">
            <div 
              className="progress-bar-partial" 
              style={{ width: `${nftsPercent}%`, backgroundColor: '#10b981' }}
            ></div>
          </div>
        </div>

        {/* DeFi Positions */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              🏦
            </div>
            <div className="stat-card-title">DeFi Positions</div>
          </div>
          <div className="stat-card-value">{formatCurrency(defiValue)}</div>
          <div className="stat-card-subtitle">0 protocols • {defiPercent.toFixed(1)}% of Portfolio</div>
          <div className="stat-card-progress">
            <div 
              className="progress-bar-partial" 
              style={{ width: `${defiPercent}%`, backgroundColor: '#3b82f6' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading">
          Fetching data from Monad Testnet...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span>⚠️ Error: {error}</span>
            <button onClick={() => fetchPortfolioData(address)} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Sections */}
      {!loading && (
        <>
          <PortfolioOverview 
            tokensValue={tokensValue}
            nftsValue={nftsValue}
            defiValue={defiValue}
            totalValue={totalValue}
            tokens={tokens}
            nfts={nfts}
          />
          
          <AssetComposition 
            tokens={tokens}
            nfts={nfts}
            tokensValue={tokensValue}
            nftsValue={nftsValue}
            totalValue={totalValue}
          />
          
          <DeFiPositions 
            address={address}
            tokens={tokens}
            defiValue={defiValue}
          />
        </>
      )}
    </div>
  );
};

export default Portfolio;