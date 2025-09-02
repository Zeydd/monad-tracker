// src/components/Header.js
// NadFolio Portfolio Tracker - Header with Specific Tokens

import React, { useState, useEffect } from 'react';
import './header.css';

const Header = ({ isDark, setIsDark, isConnected, walletAddress }) => {
  // Core states
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cryptoPrices, setCryptoPrices] = useState({});
  
  // Configuration des tokens spécifiques
  const tokenList = [
    { symbol: 'btc', name: 'BTC', icon: '🟠', coingeckoId: 'bitcoin' },
    { symbol: 'eth', name: 'ETH', icon: '🔵', coingeckoId: 'ethereum' },
    { symbol: 'mon', name: 'MON', icon: '🟣', coingeckoId: null }, // Simulé
    { symbol: 'sol', name: 'SOL', icon: '🟢', coingeckoId: 'solana' },
    { symbol: 'bnb', name: 'BNB', icon: '🟡', coingeckoId: 'binancecoin' },
    { symbol: 'hype', name: 'HYPE', icon: '🚀', coingeckoId: 'hyperliquid' },
    { symbol: 'xrp', name: 'XRP', icon: '🔷', coingeckoId: 'ripple' },
    { symbol: 'sui', name: 'SUI', icon: '💧', coingeckoId: 'sui' },
    { symbol: 'ada', name: 'ADA', icon: '💙', coingeckoId: 'cardano' }
  ];
  
  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch specific crypto prices
  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        // Récupérer les IDs CoinGecko des tokens réels
        const coingeckoIds = tokenList
          .filter(token => token.coingeckoId)
          .map(token => token.coingeckoId)
          .join(',');
        
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoIds}&vs_currencies=usd&include_24hr_change=true`
        );
        const data = await response.json();
        
        // Créer l'objet des prix
        const prices = {};
        
        tokenList.forEach(token => {
          if (token.coingeckoId && data[token.coingeckoId]) {
            prices[token.symbol] = {
              price: data[token.coingeckoId].usd,
              change: data[token.coingeckoId].usd_24h_change || 0,
              name: token.name,
              icon: token.icon
            };
          } else if (token.symbol === 'mon') {
            // Prix simulé pour MON
            prices[token.symbol] = {
              price: 2.85 + (Math.random() - 0.5) * 0.2,
              change: (Math.random() - 0.5) * 15,
              name: token.name,
              icon: token.icon
            };
          }
        });
        
        setCryptoPrices(prices);
        
      } catch (error) {
        console.error('Erreur récupération prix crypto:', error);
        
        // Fallback avec prix réalistes
        const fallbackPrices = {
          btc: { price: 97845, change: 2.1, name: 'BTC', icon: '🟠' },
          eth: { price: 3542, change: 1.8, name: 'ETH', icon: '🔵' },
          mon: { price: 2.85, change: 4.2, name: 'MON', icon: '🟣' },
          sol: { price: 245, change: -1.2, name: 'SOL', icon: '🟢' },
          bnb: { price: 658, change: 0.9, name: 'BNB', icon: '🟡' },
          hype: { price: 32.5, change: 8.5, name: 'HYPE', icon: '🚀' },
          xrp: { price: 0.58, change: 2.3, name: 'XRP', icon: '🔷' },
          sui: { price: 4.2, change: -0.8, name: 'SUI', icon: '💧' },
          ada: { price: 0.45, change: 1.5, name: 'ADA', icon: '💙' }
        };
        
        setCryptoPrices(fallbackPrices);
      }
    };

    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 45000); // Mise à jour toutes les 45s
    
    return () => clearInterval(interval);
  }, []);

  // Fonction de formatage des prix
  const formatPrice = (price) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      });
    } else if (price >= 1) {
      return price.toFixed(2);
    } else {
      return price.toFixed(4);
    }
  };

  const formatChange = (change) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Left section - Branding */}
        <div className="header-left">
          <div className="brand-container">
            <div className="logo">
              <span className="logo-text">N</span>
              <div className="logo-pulse"></div>
            </div>
            
            <div className="brand-content">
              <h1 className="brand-title">
                NadFolio
                <span className="version">v2.1</span>
              </h1>
              <div className="brand-subtitle">
                Monad Portfolio Tracker
              </div>
            </div>
          </div>
        </div>

        {/* Center section - Prix défilants des tokens spécifiques */}
        <div className="header-center">
          <div className="price-ticker-container">
            <div className="price-ticker">
              <div className="ticker-content">
                {/* Génération des tokens spécifiés */}
                {tokenList.map((token, index) => {
                  const tokenData = cryptoPrices[token.symbol];
                  if (!tokenData) return null;
                  
                  return (
                    <React.Fragment key={`${token.symbol}-${index}`}>
                      <div className="ticker-item">
                        <span className="token-icon">{token.icon}</span>
                        <span className="token-symbol">{token.name}</span>
                        <span className="token-price">
                          ${formatPrice(tokenData.price)}
                        </span>
                        <span className={`token-change ${
                          tokenData.change >= 0 ? 'positive' : 'negative'
                        }`}>
                          {formatChange(tokenData.change)}
                        </span>
                      </div>
                      
                      {index < tokenList.length - 1 && (
                        <div className="ticker-separator">•</div>
                      )}
                    </React.Fragment>
                  );
                })}
                
                {/* Duplication pour effet de défilement continu */}
                {Object.keys(cryptoPrices).length > 0 && (
                  <>
                    <div className="ticker-separator">•</div>
                    
                    {tokenList.map((token, index) => {
                      const tokenData = cryptoPrices[token.symbol];
                      if (!tokenData) return null;
                      
                      return (
                        <React.Fragment key={`${token.symbol}-duplicate-${index}`}>
                          <div className="ticker-item">
                            <span className="token-icon">{token.icon}</span>
                            <span className="token-symbol">{token.name}</span>
                            <span className="token-price">
                              ${formatPrice(tokenData.price)}
                            </span>
                            <span className={`token-change ${
                              tokenData.change >= 0 ? 'positive' : 'negative'
                            }`}>
                              {formatChange(tokenData.change)}
                            </span>
                          </div>
                          
                          {index < tokenList.length - 1 && (
                            <div className="ticker-separator">•</div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right section - Controls épurés */}
        <div className="header-right">
          {/* Wallet connection */}
          {isConnected && walletAddress && (
            <div className="wallet-indicator">
              <div className="wallet-dot connected"></div>
              <span className="wallet-address">
                {formatAddress(walletAddress)}
              </span>
            </div>
          )}

          {/* Time display */}
          <div className="time-display">
            <span className="current-time">{formatTime(currentTime)}</span>
            <span className="time-separator">•</span>
            <span className="current-date">{formatDate(currentTime)}</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="theme-toggle"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2"/>
                <path d="M12 20v2"/>
                <path d="M4.93 4.93l1.41 1.41"/>
                <path d="M17.66 17.66l1.41 1.41"/>
                <path d="M2 12h2"/>
                <path d="M20 12h2"/>
                <path d="M6.34 17.66l-1.41 1.41"/>
                <path d="M19.07 4.93l-1.41 1.41"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;