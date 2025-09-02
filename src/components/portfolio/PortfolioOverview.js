import React from 'react';

const PortfolioOverview = ({ tokensValue, nftsValue, defiValue, totalValue }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  return (
    <div className="portfolio-overview">
      <div className="overview-header">
        <div className="overview-icon">📊</div>
        <div>
          <h2 className="overview-title">Portfolio Overview</h2>
          <p className="overview-subtitle">Asset distribution and allocation</p>
        </div>
      </div>

      <div className="overview-content">
        {/* Left side - Asset Distribution */}
        <div className="overview-distribution">
          <div className="distribution-item">
            <div className="distribution-label">● Tokens</div>
            <div className="distribution-value">{formatCurrency(tokensValue)}</div>
          </div>
          
          <div className="distribution-item">
            <div className="distribution-label">● NFTs</div>
            <div className="distribution-value">{formatCurrency(nftsValue)}</div>
          </div>
          
          <div className="distribution-item">
            <div className="distribution-label">● DeFi</div>
            <div className="distribution-value">{formatCurrency(defiValue)}</div>
          </div>
        </div>

        {/* Right side - Chart placeholder */}
        <div className="overview-chart">
          <div>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>Asset Allocation</div>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📈</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Chart visualization coming soon</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview;