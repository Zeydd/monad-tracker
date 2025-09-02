import React from 'react';

const DeFiPositions = ({ address, tokens }) => {
  // Detect potential DeFi tokens
  const detectDeFiTokens = () => {
    if (!tokens || tokens.length === 0) return [];
    
    return tokens.filter(token => {
      const symbol = token.symbol?.toLowerCase() || '';
      return symbol.startsWith('s') || symbol.startsWith('g') || symbol.includes('lp');
    }).slice(0, 4);
  };

  const potentialDeFiTokens = detectDeFiTokens();

  return (
    <div style={{
      background: '#1a1d29',
      border: '1px solid #2d3748',
      borderRadius: '12px',
      overflow: 'hidden',
      marginTop: '24px' // Espace avec la section précédente
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #2d3748',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            🏦
          </div>
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#ffffff',
              margin: 0,
              marginBottom: '2px'
            }}>
              DeFi Positions
            </h2>
            <p style={{
              fontSize: '13px',
              color: '#a0aec0',
              margin: 0
            }}>
              Advanced tracking coming soon
            </p>
          </div>
        </div>
        
        <div style={{
          background: '#374151',
          color: '#9ca3af',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          Beta
        </div>
      </div>

      {/* Compact Content */}
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#ffffff',
              margin: 0,
              marginBottom: '4px'
            }}>
              DeFi Position Tracking
            </h3>
            <p style={{
              fontSize: '13px',
              color: '#718096',
              margin: 0
            }}>
              Staking, liquidity pools, and lending positions will be tracked here
            </p>
          </div>
          <div style={{
            fontSize: '28px',
            opacity: '0.5'
          }}>
            🚧
          </div>
        </div>

        {/* Potential DeFi Tokens - Inline */}
        {potentialDeFiTokens.length > 0 && (
          <div style={{
            background: '#252835',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#ffffff'
              }}>
                Potential DeFi Tokens
              </span>
              <span style={{
                fontSize: '12px',
                color: '#718096'
              }}>
                {potentialDeFiTokens.length} detected
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '6px' 
            }}>
              {potentialDeFiTokens.map((token, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  background: '#1a1d29',
                  borderRadius: '4px',
                  border: '1px solid #374151'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '3px',
                    background: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    fontWeight: '700',
                    color: '#9ca3af'
                  }}>
                    {token.symbol?.charAt(0)}
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#ffffff'
                  }}>
                    {token.symbol}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Development Status - Minimal */}
        <div style={{
          background: '#1a1d29',
          border: '1px solid #2d3748',
          borderRadius: '6px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '2px',
            background: '#3b82f6'
          }}></div>
          <span style={{
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            Integration with Monad DeFi protocols in development
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeFiPositions;