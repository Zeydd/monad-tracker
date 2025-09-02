import React, { useState } from 'react';

const AssetComposition = ({ tokens, nfts, tokensValue, nftsValue, defiValue, totalValue }) => {
  const [activeTab, setActiveTab] = useState('tokens');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const formatNumber = (num) => {
    if (num === 0) return '0';
    if (num < 0.001) return '< 0.001';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 3 
    }).format(num);
  };

  // Fonction pour formater le comptage des NFTs
  const formatNFTCount = (count) => {
    if (count <= 100) return count.toString();
    if (count <= 1000) return `${Math.floor(count / 100) * 100}+`;
    if (count <= 10000) return `${Math.floor(count / 1000)}K+`;
    return "10K+";
  };

  const totalNFTCount = nfts.reduce((sum, nft) => sum + (nft.balance || 1), 0);
  const realNFTsValue = nfts.reduce((sum, nft) => sum + (nft.totalValue || 0), 0);

  return (
    <div style={{
      background: '#1a1d29',
      border: '1px solid #2d3748',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Header avec titre Asset Composition */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #2d3748',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Titre à gauche comme Portfolio Overview */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            📊
          </div>
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#ffffff',
              margin: 0,
              marginBottom: '2px'
            }}>
              Asset Composition
            </h2>
            <p style={{
              fontSize: '13px',
              color: '#a0aec0',
              margin: 0
            }}>
              Detailed breakdown of your holdings
            </p>
          </div>
        </div>

        {/* Switch button à droite */}
        <div style={{
          display: 'inline-flex',
          background: '#2d3748',
          borderRadius: '8px',
          padding: '4px',
          border: '1px solid #3d4852'
        }}>
          <button
            onClick={() => setActiveTab('tokens')}
            style={{
              padding: '8px 24px',
              border: 'none',
              borderRadius: '4px',
              background: activeTab === 'tokens' ? '#4a5568' : 'transparent',
              color: activeTab === 'tokens' ? '#ffffff' : '#a0aec0',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '80px'
            }}
          >
            Tokens
          </button>
          
          <button
            onClick={() => setActiveTab('nfts')}
            style={{
              padding: '8px 24px',
              border: 'none',
              borderRadius: '4px',
              background: activeTab === 'nfts' ? '#4a5568' : 'transparent',
              color: activeTab === 'nfts' ? '#ffffff' : '#a0aec0',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '80px'
            }}
          >
            NFTs
          </button>
        </div>
      </div>

      {/* Content avec concept table/grid */}
      <div style={{ padding: '0' }}>
        {activeTab === 'tokens' && (
          <>
            {tokens.length > 0 ? (
              <div>
                {/* Header table */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr',
                  padding: '12px 20px',
                  background: '#252835',
                  borderBottom: '1px solid #2d3748',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#718096',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div>Asset</div>
                  <div style={{ textAlign: 'right' }}>Balance</div>
                  <div style={{ textAlign: 'right' }}>Value</div>
                </div>

                {/* Table content */}
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {tokens.map((token, index) => {
                    const balance = parseFloat(token.balance || 0);
                    const value = token.value || 0;

                    return (
                      <div
                        key={index}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr',
                          padding: '16px 20px',
                          borderBottom: '1px solid #2d3748',
                          transition: 'background 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#252835'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Asset info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: token.isNative 
                              ? 'linear-gradient(135deg, #8b5cf6, #a855f7)'
                              : `linear-gradient(135deg, hsl(${index * 60}, 65%, 55%), hsl(${index * 60 + 30}, 65%, 65%))`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '12px',
                            flexShrink: 0
                          }}>
                            {token.symbol?.charAt(0) || '?'}
                          </div>
                          
                          <div style={{ minWidth: 0 }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginBottom: '2px'
                            }}>
                              <span style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#ffffff'
                              }}>
                                {token.symbol || 'UNKNOWN'}
                              </span>
                              {token.isNative && (
                                <span style={{
                                  background: '#8b5cf6',
                                  color: 'white',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: '600'
                                }}>
                                  NATIVE
                                </span>
                              )}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#a0aec0'
                            }}>
                              {token.name || 'Unknown Token'}
                            </div>
                          </div>
                        </div>

                        {/* Balance */}
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
                            {formatNumber(balance)}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#718096'
                          }}>
                            {token.symbol}
                          </div>
                        </div>

                        {/* Value */}
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
                            {formatCurrency(value)}
                          </div>
                          {token.price && (
                            <div style={{
                              fontSize: '12px',
                              color: '#718096'
                            }}>
                              ${token.price.toFixed(3)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#718096'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '12px', opacity: 0.5 }}>💰</div>
                <div style={{ fontSize: '14px', color: '#a0aec0' }}>No tokens found</div>
              </div>
            )}
          </>
        )}

        {activeTab === 'nfts' && (
          <>
            {nfts.length > 0 ? (
              <div>
                {/* Header table avec Floor Price */}
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
                  <div style={{ textAlign: 'right' }}>Items</div>
                  <div style={{ textAlign: 'right' }}>Floor Price</div>
                  <div style={{ textAlign: 'right' }}>Total Value</div>
                </div>

                {/* Table content */}
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {nfts.map((nft, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr',
                        padding: '16px 20px',
                        borderBottom: '1px solid #2d3748',
                        transition: 'background 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#252835'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Collection info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: `linear-gradient(135deg, hsl(${index * 90}, 60%, 45%), hsl(${index * 90 + 45}, 60%, 55%))`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '12px',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          {nft.image ? (
                            <img 
                              src={nft.image} 
                              alt={nft.collection?.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.textContent = (nft.collection?.name?.charAt(0) || 'N');
                              }}
                            />
                          ) : (
                            nft.collection?.name?.charAt(0) || 'N'
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
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#ffffff'
                            }}>
                              {nft.collection?.name || 'Unknown Collection'}
                            </span>
                            {nft.collection?.verified && (
                              <span style={{ color: '#48bb78', fontSize: '12px' }}>✓</span>
                            )}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#a0aec0'
                          }}>
                            {nft.marketStats?.owners > 0 ? `${nft.marketStats.owners} owners` : 'Collection'}
                          </div>
                        </div>
                      </div>

                      {/* Items Count */}
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
                          {nft.balance || 1}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#718096'
                        }}>
                          NFT{(nft.balance || 1) > 1 ? 's' : ''}
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
                          {nft.floorPrice?.MON?.toFixed(4) || '0.000'} MON
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: nft.floorPrice?.currency === 'MON' ? '#8b5cf6' : '#718096'
                        }}>
                          {formatCurrency(nft.floorPrice?.USD || 0)}
                        </div>
                      </div>

                      {/* Total Value */}
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
                          {formatCurrency(nft.totalValue || 0)}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#718096'
                        }}>
                          {nft.marketStats?.listedCount > 0 ? `${nft.marketStats.listedCount} listed` : 'Portfolio'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#718096'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '12px', opacity: 0.5 }}>🖼️</div>
                <div style={{ fontSize: '14px', color: '#a0aec0' }}>No NFTs found</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer summary avec formatage intelligent pour les NFTs */}
      {(tokens.length > 0 || nfts.length > 0) && (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #2d3748',
          background: '#252835',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#718096' }}>
            {activeTab === 'tokens' ? 
              `${tokens.length} tokens` : 
              `${formatNFTCount(totalNFTCount)} NFTs in ${nfts.length} collections`
            }
          </div>
          
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#8b5cf6'
          }}>
            {formatCurrency(activeTab === 'tokens' ? tokensValue : realNFTsValue)}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetComposition;