// src/components/portfolio/NFTFloorPrices.js
// Composant pour afficher les floor prices des collections NFT

import React, { useState, useEffect } from 'react';
import { getTopCollectionsByFloorPrice, generatePriceChange24h } from '../../services/evm/nftCollections';

const NFTFloorPrices = ({ userNFTs = [] }) => {
  const [allCollections, setAllCollections] = useState([]);
  const [userCollections, setUserCollections] = useState([]);
  const [activeView, setActiveView] = useState('owned'); // 'owned' ou 'all'

  useEffect(() => {
    // Récupérer le top des collections par floor price
    const topCollections = getTopCollectionsByFloorPrice(10);
    setAllCollections(topCollections);

    // Filtrer les collections que possède l'utilisateur
    const ownedCollections = userNFTs.map(nft => {
      const change24h = generatePriceChange24h(nft.collection?.address || '');
      return {
        ...nft.collection,
        balance: nft.balance,
        floorPrice: nft.floorPrice,
        totalValue: nft.totalValue,
        change24h,
        image: nft.image
      };
    });
    setUserCollections(ownedCollections);
  }, [userNFTs]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const formatChange = (change) => {
    const isPositive = change >= 0;
    const percentage = Math.abs(change * 100).toFixed(1);
    return {
      value: `${isPositive ? '+' : '-'}${percentage}%`,
      color: isPositive ? '#10b981' : '#ef4444'
    };
  };

  const currentCollections = activeView === 'owned' ? userCollections : allCollections;

  return (
    <div style={{
      background: '#1a1d29',
      border: '1px solid #2d3748',
      borderRadius: '12px',
      overflow: 'hidden',
      marginTop: '20px'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #2d3748',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>
            📊
          </div>
          <div>
            <h3 style={{ 
              margin: 0, 
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              NFT Floor Prices
            </h3>
            <p style={{ 
              margin: 0, 
              color: '#a0aec0',
              fontSize: '14px'
            }}>
              Real-time collection floor prices on Monad
            </p>
          </div>
        </div>

        {/* Switch View */}
        <div style={{
          display: 'inline-flex',
          background: '#2d3748',
          borderRadius: '8px',
          padding: '4px',
          border: '1px solid #3d4852'
        }}>
          <button
            onClick={() => setActiveView('owned')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              background: activeView === 'owned' ? '#4a5568' : 'transparent',
              color: activeView === 'owned' ? '#ffffff' : '#a0aec0',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            My Collections
          </button>
          
          <button
            onClick={() => setActiveView('all')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              background: activeView === 'all' ? '#4a5568' : 'transparent',
              color: activeView === 'all' ? '#ffffff' : '#a0aec0',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            All Collections
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        padding: '12px 20px',
        background: '#252835',
        borderBottom: '1px solid #2d3748',
        fontSize: '12px',
        fontWeight: '600',
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        <div>Collection</div>
        <div style={{ textAlign: 'right' }}>Floor Price</div>
        <div style={{ textAlign: 'right' }}>24h Change</div>
        <div style={{ textAlign: 'right' }}>
          {activeView === 'owned' ? 'Your Value' : 'Volume 24h'}
        </div>
      </div>

      {/* Collections List */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {currentCollections.length > 0 ? (
          currentCollections.map((collection, index) => {
            const change = formatChange(collection.change24h || 0);
            const floorPriceMON = collection.floorPrice?.MON || collection.stats?.floorPrice?.MON || 0;
            const floorPriceUSD = collection.floorPrice?.USD || collection.stats?.floorPrice?.USD || 0;
            
            return (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  padding: '16px 20px',
                  borderBottom: index < currentCollections.length - 1 ? '1px solid #2d3748' : 'none',
                  transition: 'background 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#252835'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {/* Collection Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, hsl(${index * 90}, 60%, 45%), hsl(${index * 90 + 45}, 60%, 55%))`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '14px',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {collection.image ? (
                      <img 
                        src={collection.image} 
                        alt={collection.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.textContent = (collection.name?.charAt(0) || 'N');
                        }}
                      />
                    ) : (
                      collection.name?.charAt(0) || 'N'
                    )}
                  </div>
                  
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '2px'
                    }}>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#ffffff'
                      }}>
                        {collection.name || 'Unknown Collection'}
                      </span>
                      {collection.verified && (
                        <span style={{ color: '#48bb78', fontSize: '12px' }}>✓</span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#a0aec0'
                    }}>
                      {activeView === 'owned' && collection.balance ? 
                        `${collection.balance} NFT${collection.balance > 1 ? 's' : ''} owned` :
                        `${collection.symbol || 'NFT'} Collection`
                      }
                    </div>
                  </div>
                </div>

                {/* Floor Price */}
                <div style={{ 
                  textAlign: 'right', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center' 
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ffffff'
                  }}>
                    {floorPriceMON.toFixed(3)} MON
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#718096'
                  }}>
                    {formatCurrency(floorPriceUSD)}
                  </div>
                </div>

                {/* 24h Change */}
                <div style={{ 
                  textAlign: 'right', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center' 
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: change.color
                  }}>
                    {change.value}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#718096'
                  }}>
                    Last 24h
                  </div>
                </div>

                {/* Value / Volume */}
                <div style={{ 
                  textAlign: 'right', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center' 
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ffffff'
                  }}>
                    {activeView === 'owned' ? 
                      formatCurrency(collection.totalValue || 0) :
                      formatCurrency((collection.stats?.volume24h || 0) * 3.6722)
                    }
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#718096'
                  }}>
                    {activeView === 'owned' ? 'Portfolio Value' : 'Volume'}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#718096'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}>📊</div>
            <div style={{ fontSize: '16px', color: '#a0aec0', marginBottom: '8px' }}>
              {activeView === 'owned' ? 'No NFT collections found' : 'Loading collections...'}
            </div>
            <div style={{ fontSize: '14px', color: '#718096' }}>
              {activeView === 'owned' ? 
                'Your wallet doesn\'t contain any NFTs from tracked collections' :
                'Floor price data will appear here'
              }
            </div>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      {currentCollections.length > 0 && (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #2d3748',
          background: '#252835',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#718096' }}>
            {activeView === 'owned' ? 
              `${currentCollections.length} collection${currentCollections.length > 1 ? 's' : ''} owned` :
              `Top ${currentCollections.length} collections by floor price`
            }
          </div>
          
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#10b981'
          }}>
            {activeView === 'owned' ? 
              formatCurrency(currentCollections.reduce((sum, col) => sum + (col.totalValue || 0), 0)) :
              `Avg: ${(currentCollections.reduce((sum, col) => sum + (col.stats?.floorPrice?.MON || 0), 0) / currentCollections.length).toFixed(3)} MON`
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTFloorPrices;