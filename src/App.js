import React, { useState, useEffect } from 'react';
import { Search, Wallet, RefreshCw, AlertCircle, Grid, List } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

// BlockVision Monad Indexing API (Testnet)
const BLOCKVISION_API = 'https://api.blockvision.org/v2/monad';
// Your BlockVision API Key
const BV_API_KEY = '2xdGHjON0TpF5ecWeRFbzfH5KE1';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

// Loading Animation
const LoadingAnimation = () => (
  <div className="flex flex-col items-center justify-center py-16 space-y-6">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-purple-400/30 rounded-full animate-spin">
        <div className="absolute inset-0 border-4 border-transparent border-t-purple-400 rounded-full animate-spin"></div>
      </div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
    </div>
    <div className="text-center space-y-2">
      <div className="text-lg font-semibold text-white">Analysis in progress...</div>
      <div className="text-sm text-gray-400">Fetching your wallet data</div>
    </div>
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
    </div>
  </div>
);

// NFT Card Component with animation
const NFTCard = ({ nft, index, isVisible }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div
      className={`bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-700/50 hover:border-purple-400/50 group transform transition-all duration-500 ${
        isVisible ? 'animate-nft-reveal' : 'opacity-0 translate-y-8'
      }`}
      style={{ 
        animationDelay: `${index * 80}ms`,
        animationFillMode: 'forwards'
      }}
    >
      {/* Image Container */}
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        {!imageError && nft.image ? (
          <img
            src={nft.image}
            alt={nft.name || `NFT #${nft.tokenId}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <div className="text-4xl mb-2">🎨</div>
            <div className="text-xs text-center px-2">NFT Image</div>
          </div>
        )}
        
        {/* Overlay with info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex justify-between items-end">
              <div className="bg-black/50 backdrop-blur-sm text-white text-sm px-2 py-1 rounded-full font-medium">
                #{nft.tokenId}
              </div>
              {nft.verified && (
                <div className="bg-green-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  ✓ Verified
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Info Section */}
      <div className="p-4 space-y-3">
        <h4 className="font-bold text-sm text-white truncate group-hover:text-purple-300 transition-colors">
          {nft.name || `Token #${nft.tokenId}`}
        </h4>
        
        <div className="space-y-2">
          {/* Collection Name */}
          {nft.collectionName && (
            <div className="text-sm text-cyan-300 truncate font-medium">
              📁 {nft.collectionName}
            </div>
          )}
          
          {/* ERC Standard and Quantity */}
          <div className="flex justify-between items-center">
            <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-sm font-medium">
              {nft.ercStandard || 'NFT'}
            </span>
            <span className="text-orange-300 font-bold text-sm">
              Qty: {nft.totalQuantity || nft.qty || 1}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MonadPortfolioTracker() {
  const [address, setAddress] = useState('');
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNfts, setShowNfts] = useState(false);
  const [visibleNfts, setVisibleNfts] = useState([]);
  const [nftViewMode, setNftViewMode] = useState('gallery'); // 'gallery' or 'list'
  const [nftsPerPage] = useState(30);
  const [currentNftPage, setCurrentNftPage] = useState(1);

  const isValidAddress = addr => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const formatCurrency = amt => {
    const num = parseFloat(amt);
    if (!isFinite(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(num);
  };

  // Format token balance with 3 decimals and comma separators
  const formatTokenBalance = (balance) => {
    const num = parseFloat(balance);
    if (!isFinite(num)) return '0.000';
    
    // Round to 3 decimal places
    const rounded = Math.round(num * 1000) / 1000;
    
    // Format with comma separators
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(rounded);
  };

  const fetchBV = async path => {
    const url = `${BLOCKVISION_API}${path}`;
    const res = await fetch(url, { headers: { 'x-api-key': BV_API_KEY } });
    if (res.status === 403) throw new Error('Access denied: Invalid API key or insufficient permissions (403)');
    if (res.status === 404) throw new Error('Resource not found (404). Check the path and parameters.');
    if (res.status === 429) {
      // retry once
      const retryAfter = parseInt(res.headers.get('Retry-After'), 10) || 1;
      await new Promise(r => setTimeout(r, retryAfter * 1000));
      const retryRes = await fetch(url, { headers: { 'x-api-key': BV_API_KEY } });
      if (!retryRes.ok) throw new Error('Rate limit exceeded (429) after retry');
      return retryRes.json();
    }
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  };

  // Function to group identical NFTs
  const groupIdenticalNfts = (nfts) => {
    const grouped = {};
    
    nfts.forEach(nft => {
      // Create unique key based on contract + name + collection
      const key = `${nft.contractAddress}-${nft.name || nft.tokenId}-${nft.collectionName || 'unknown'}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          ...nft,
          totalQuantity: parseInt(nft.qty) || 1,
          tokenIds: [nft.tokenId]
        };
      } else {
        grouped[key].totalQuantity += parseInt(nft.qty) || 1;
        grouped[key].tokenIds.push(nft.tokenId);
      }
    });
    
    return Object.values(grouped);
  };

  // Progressive NFT display animation
  useEffect(() => {
    if (portfolio && portfolio.nfts.length > 0 && showNfts) {
      setVisibleNfts([]);
      
      // Group identical NFTs
      const groupedNfts = groupIdenticalNfts(portfolio.nfts);
      
      // Pagination only if more than 30 NFTs
      const startIndex = groupedNfts.length > nftsPerPage ? (currentNftPage - 1) * nftsPerPage : 0;
      const endIndex = groupedNfts.length > nftsPerPage ? Math.min(startIndex + nftsPerPage, groupedNfts.length) : groupedNfts.length;
      const nftsToShow = groupedNfts.slice(startIndex, endIndex);
      
      // Show NFTs progressively
      nftsToShow.forEach((nft, index) => {
        setTimeout(() => {
          setVisibleNfts(prev => [...prev, nft]);
        }, index * 80);
      });
    }
  }, [portfolio, showNfts, currentNftPage]);

  const loadPortfolio = async () => {
    setError('');
    if (!isValidAddress(address)) {
      setError('Please enter a valid address (0x...)');
      return;
    }
    setLoading(true);
    setShowNfts(false);
    setVisibleNfts([]);
    setCurrentNftPage(1);
    
    try {
      // 1. Balances
      const tokRes = await fetchBV(`/account/tokens?address=${address}`);
      const tokensRaw = tokRes.result?.data || [];
      const tokens = tokensRaw.map(t => {
        const balance = parseFloat(t.balance) || 0;
        const price   = parseFloat(t.price)   || 0;
        return { symbol: t.symbol, balance, value: balance * price };
      });

      // 2. DeFi positions
      const txRes = await fetchBV(`/account/transactions?address=${address}&limit=100&ascendingOrder=false`);
      const txsRaw = txRes.result?.data || [];
      const DEFI_CONTRACTS = {
        '0xabc123abc123abc123abc123abc123abc123abc1': 'Monad DEX',
        '0xdef456def456def456def456def456def456def4': 'Monad Lending',
        '0x789ghi789ghi789ghi789ghi789ghi789ghi789g': 'Monad Staking'
      };
      const positionsMap = {};
      txsRaw.forEach(tx => {
        const to = tx.to?.toLowerCase();
        if (DEFI_CONTRACTS[to]) {
          positionsMap[to] = positionsMap[to] || { protocol: DEFI_CONTRACTS[to], count: 0 };
          positionsMap[to].count++;
        }
      });
      const defiPositions = Object.values(positionsMap);

      // 3. NFTs (paginated)
      let pageIndex = 1, allNfts = [];
      while (true) {
        const nftRes = await fetchBV(
          `/account/nfts?address=${address}&pageIndex=${pageIndex}&verified=true&unknown=true`
        );
        const collections = nftRes.result?.data || [];
        if (!collections.length) break;
        
        // Extract all individual NFTs from all collections
        collections.forEach(collection => {
          if (collection.items && collection.items.length > 0) {
            collection.items.forEach(item => {
              allNfts.push({
                ...item,
                collectionName: collection.name,
                collectionImage: collection.image,
                ercStandard: collection.ercStandard,
                verified: collection.verified
              });
            });
          }
        });
        
        const next = nftRes.result?.nextPageIndex;
        if (!next || next <= pageIndex) break;
        pageIndex = next;
      }

      console.log('NFTs found:', allNfts);
      setPortfolio({ tokens, defiPositions, nfts: allNfts });
      
      // Wait a bit before showing NFTs
      setTimeout(() => {
        setShowNfts(true);
      }, 800);
      
    } catch (e) {
      console.error('Error:', e);
      setError(e.message);
      setPortfolio(null);
    } finally {
      setLoading(false);
    }
  };

  // Calculate data for pagination
  const groupedNfts = portfolio ? groupIdenticalNfts(portfolio.nfts) : [];
  const totalNftPages = groupedNfts.length > nftsPerPage ? Math.ceil(groupedNfts.length / nftsPerPage) : 1;
  const shouldShowPagination = groupedNfts.length > nftsPerPage;
  const startIndex = shouldShowPagination ? (currentNftPage - 1) * nftsPerPage : 0;
  const endIndex = shouldShowPagination ? Math.min(startIndex + nftsPerPage, groupedNfts.length) : groupedNfts.length;
  const currentNfts = groupedNfts.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (!shouldShowPagination) return;
    
    setCurrentNftPage(newPage);
    setVisibleNfts([]);
    
    // Scroll to top of NFTs section
    setTimeout(() => {
      document.getElementById('nft-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md px-6 py-4 flex items-center space-x-4">
        <Wallet className="w-8 h-8 text-purple-400" />
        <h1 className="text-2xl font-bold">Monad Portfolio Tracker</h1>
      </header>

      {/* Search */}
      <section className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex gap-4">
          <input
            type="text"
            className="flex-1 p-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your Monad address (0x...)"
            value={address}
            onChange={e => setAddress(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && loadPortfolio()}
          />
          <button
            onClick={loadPortfolio}
            disabled={loading}
            className="px-6 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2 disabled:opacity-50 transition-colors"
          >
            {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
            <span>{loading ? 'Analyzing...' : 'Analyze'}</span>
          </button>
        </div>
        {error && (
          <div className="mt-4 max-w-3xl mx-auto">
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
              <p className="text-red-400 flex items-center">
                <AlertCircle className="mr-2 w-5 h-5" /> {error}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Loading Animation */}
      {loading && <LoadingAnimation />}

      {/* Results */}
      {portfolio && !loading && (
        <main className="px-6 pb-8 space-y-8">
          {/* Token Balances */}
          {portfolio.tokens.length > 0 && (
            <section className="max-w-4xl mx-auto animate-fade-in">
              <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <span className="w-2 h-8 bg-blue-500 rounded mr-3"></span>
                  Token Balances
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.tokens.map((t, i) => (
                    <div key={i} className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-sm rounded-xl p-5 border border-gray-600/30 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
                            <p className="font-bold text-xl text-blue-300">{t.symbol}</p>
                          </div>
                          <p className="text-gray-300 text-sm font-medium">
                            {formatTokenBalance(t.balance)} tokens
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-400">{formatCurrency(t.value)}</p>
                          <div className="w-2 h-2 rounded-full bg-green-400 ml-auto mt-1"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* DeFi Positions */}
          {portfolio.defiPositions.length > 0 && (
            <section className="max-w-4xl mx-auto animate-fade-in">
              <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <span className="w-2 h-8 bg-purple-500 rounded mr-3"></span>
                  DeFi Positions
                </h2>
                <div className="space-y-3">
                  {portfolio.defiPositions.map((p, i) => (
                    <div
                      key={i}
                      className="bg-gray-700/50 rounded-lg p-4 flex justify-between items-center"
                    >
                      <span className="font-semibold">{p.protocol}</span>
                      <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                        {p.count} transactions
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* NFTs Gallery */}
          {showNfts && (
            <section id="nft-section" className="max-w-7xl mx-auto">
              <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6">
                {/* Header with controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                  <h2 className="text-2xl font-semibold flex items-center">
                    <span className="w-2 h-8 bg-pink-500 rounded mr-3"></span>
                    NFT Collection ({groupedNfts.length} unique)
                  </h2>
                  
                  <div className="flex items-center space-x-4">
                    {/* Pagination info only if necessary */}
                    {shouldShowPagination && (
                      <span className="text-sm text-gray-400">
                        {startIndex + 1}-{endIndex} of {groupedNfts.length}
                      </span>
                    )}
                  </div>
                </div>

                {groupedNfts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-gray-400 text-lg">No NFTs detected in this wallet.</p>
                  </div>
                ) : (
                  <>
                    {/* NFT Gallery */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mb-8">
                      {currentNfts.map((nft, index) => (
                        <NFTCard
                          key={`${nft.contractAddress}-${nft.tokenIds?.[0] || nft.tokenId}`}
                          nft={nft}
                          index={index}
                          isVisible={visibleNfts.some(visibleNft => 
                            visibleNft.contractAddress === nft.contractAddress && 
                            (visibleNft.tokenIds?.[0] === nft.tokenIds?.[0] || visibleNft.tokenId === nft.tokenId)
                          )}
                        />
                      ))}
                    </div>

                    {/* Pagination only if more than 30 NFTs */}
                    {shouldShowPagination && (
                      <div className="flex justify-center items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentNftPage - 1)}
                          disabled={currentNftPage === 1}
                          className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                        >
                          Previous
                        </button>
                        
                        <div className="flex space-x-1">
                          {Array.from({ length: Math.min(5, totalNftPages) }, (_, i) => {
                            let pageNum;
                            if (totalNftPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentNftPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentNftPage >= totalNftPages - 2) {
                              pageNum = totalNftPages - 4 + i;
                            } else {
                              pageNum = currentNftPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-2 rounded-lg transition-colors ${
                                  currentNftPage === pageNum
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => handlePageChange(currentNftPage + 1)}
                          disabled={currentNftPage === totalNftPages}
                          className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          )}
        </main>
      )}
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes nft-reveal {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.8); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-nft-reveal {
          animation: nft-reveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}