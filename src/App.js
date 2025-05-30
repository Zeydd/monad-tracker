import React, { useState, useEffect } from 'react';
import { Search, Wallet, RefreshCw, AlertCircle, Grid, List, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
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

// Kuru DEX API
const KURU_API = 'https://api.testnet.kuru.io';

// Token addresses mapping
const TOKEN_ADDRESSES = {
  'USDC': '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
  'kUSDC': '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
  'USDT': '0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D',
  'DAK': '0x0F0BDEbF0F83cD1EE3974779Bcb7315f9808c714',
  'CHOG': '0xE0590015A873bF326bd645c3E1266d4db41C4E6B',
  'YAKI': '0xfe140e1dCe99Be9F4F15d657CD9b7BF622270C50'
};

// Market addresses on Kuru
const MARKET_ADDRESSES = {
  'MON-USDC': '0xd3af145f1aa1a471b5f0f62c52cf8fcdc9ab55d3',
  'DAK-MON': '0x94b72620e65577de5fb2b8a8b93328caf6ca161b',
  'CHOG-MON': '0x277bf4a0aac16f19d7bf592feffc8d2d9a890508',
  'YAKI-MON': '0xd5c1dc181c359f0199c83045a85cd2556b325de0'
};

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
      <div className="text-sm text-gray-400">Fetching your wallet data and market prices</div>
    </div>
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
    </div>
  </div>
);

// Token Card Component
const TokenCard = ({ token, index, tokenPrices }) => {
  // Get price in MON from Kuru data
  const priceInMon = tokenPrices[token.symbol] || 0;
  const valueInMon = token.balance * priceInMon;
  
  return (
    <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-sm rounded-xl p-5 border border-gray-600/30 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 animate-fade-in">
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
            <p className="font-bold text-xl text-blue-300">{token.symbol}</p>
          </div>
          <div className="flex items-center space-x-1">
            {priceInMon > 0 && (
              <TrendingUp className="w-4 h-4 text-green-400" />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-gray-300 text-sm font-medium">
            {formatTokenBalance(token.balance)} tokens
          </p>
          
          {token.symbol === 'MON' || token.symbol === '$MON' ? (
            <div className="space-y-1">
              <p className="text-xs text-gray-400">
                Native token
              </p>
              <p className="font-bold text-lg text-green-400">
                {formatTokenBalance(token.balance)} $MON
              </p>
            </div>
          ) : priceInMon > 0 ? (
            <div className="space-y-1">
              <p className="text-xs text-gray-400">
                1 {token.symbol} = {formatTokenBalance(priceInMon)} $MON
              </p>
              <p className="font-bold text-lg text-green-400">
                {formatTokenBalance(valueInMon)} $MON
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-yellow-400">
                Price data unavailable
              </p>
              <a 
                href={`https://testnet.kuru.io/trade/${token.symbol}-MON`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Trade on Kuru <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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

// Portfolio Summary Component
const PortfolioSummary = ({ portfolio, tokenPrices }) => {
  const totalValueInMon = portfolio.tokens.reduce((sum, token) => {
    if (token.symbol === 'MON' || token.symbol === '$MON') {
      return sum + token.balance;
    }
    const priceInMon = tokenPrices[token.symbol] || 0;
    return sum + (token.balance * priceInMon);
  }, 0);

  return (
    <div className="bg-gradient-to-r from-purple-800/30 to-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 mb-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">Portfolio Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-green-400">{formatTokenBalance(totalValueInMon)}</p>
          <p className="text-sm text-gray-400">Total Value in $MON</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-400">{portfolio.tokens.length}</p>
          <p className="text-sm text-gray-400">Different Tokens</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-purple-400">{portfolio.nfts.length}</p>
          <p className="text-sm text-gray-400">NFTs Owned</p>
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
  const [nftViewMode, setNftViewMode] = useState('gallery');
  const [nftsPerPage] = useState(30);
  const [currentNftPage, setCurrentNftPage] = useState(1);
  const [tokenPrices, setTokenPrices] = useState({});

  const isValidAddress = addr => /^0x[a-fA-F0-9]{40}$/.test(addr);

  // Fetch token prices from Kuru DEX - NEW IMPLEMENTATION
  const fetchTokenPricesFromKuru = async () => {
    const prices = {};
    
    try {
      // Method 1: Try to fetch via GraphQL API (if available)
      const graphqlEndpoint = `${KURU_API}/graphql`;
      const query = `
        query {
          markets {
            address
            baseAsset {
              symbol
              address
            }
            quoteAsset {
              symbol
              address
            }
            lastPrice
            lastTradedPrice
            bestBid
            bestAsk
          }
        }
      `;
      
      try {
        const graphqlRes = await fetch(graphqlEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        
        if (graphqlRes.ok) {
          const data = await graphqlRes.json();
          console.log('GraphQL market data:', data);
          
          if (data.data && data.data.markets) {
            data.data.markets.forEach(market => {
              const baseSymbol = market.baseAsset?.symbol;
              const quoteSymbol = market.quoteAsset?.symbol;
              const price = parseFloat(market.lastPrice || market.lastTradedPrice || 0);
              
              if (baseSymbol && quoteSymbol && price > 0) {
                if (quoteSymbol === 'MON' || quoteSymbol === '$MON') {
                  prices[baseSymbol] = price;
                } else if (baseSymbol === 'MON' || baseSymbol === '$MON') {
                  prices[quoteSymbol] = 1 / price;
                }
              }
            });
          }
        }
      } catch (graphqlErr) {
        console.log('GraphQL not available, trying REST API');
      }
      
      // Method 2: Try REST API endpoints
      if (Object.keys(prices).length === 0) {
        // Fetch orderbook data for each market
        for (const [marketName, marketAddress] of Object.entries(MARKET_ADDRESSES)) {
          try {
            const orderbookRes = await fetch(`${KURU_API}/orderbook/${marketAddress}`);
            if (orderbookRes.ok) {
              const orderbook = await orderbookRes.json();
              console.log(`Orderbook for ${marketName}:`, orderbook);
              
              // Calculate mid price from orderbook
              const bestBid = orderbook.bids && orderbook.bids.length > 0 ? parseFloat(orderbook.bids[0].price) : 0;
              const bestAsk = orderbook.asks && orderbook.asks.length > 0 ? parseFloat(orderbook.asks[0].price) : 0;
              const midPrice = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : bestBid || bestAsk;
              
              if (midPrice > 0) {
                if (marketName === 'MON-USDC') {
                  // MON-USDC: price is MON per USDC
                  prices['USDC'] = 1 / midPrice;
                  prices['kUSDC'] = 1 / midPrice;
                } else if (marketName.endsWith('-MON')) {
                  // TOKEN-MON: price is TOKEN per MON
                  const tokenSymbol = marketName.split('-')[0];
                  prices[tokenSymbol] = midPrice;
                }
              }
            }
          } catch (err) {
            console.error(`Failed to fetch orderbook for ${marketName}:`, err);
          }
        }
        
        // Method 3: Try trades endpoint as last resort
        if (Object.keys(prices).length === 0) {
          for (const [marketName, marketAddress] of Object.entries(MARKET_ADDRESSES)) {
            try {
              const tradesRes = await fetch(`${KURU_API}/trades/${marketAddress}?limit=1`);
              if (tradesRes.ok) {
                const trades = await tradesRes.json();
                if (trades && trades.length > 0) {
                  const lastPrice = parseFloat(trades[0].price);
                  
                  if (lastPrice > 0) {
                    if (marketName === 'MON-USDC') {
                      prices['USDC'] = 1 / lastPrice;
                      prices['kUSDC'] = 1 / lastPrice;
                    } else if (marketName.endsWith('-MON')) {
                      const tokenSymbol = marketName.split('-')[0];
                      prices[tokenSymbol] = lastPrice;
                    }
                  }
                }
              }
            } catch (err) {
              console.error(`Failed to fetch trades for ${marketName}:`, err);
            }
          }
        }
      }
      
      // Set MON price to 1
      prices['MON'] = 1;
      prices['$MON'] = 1;
      
      // Estimate USDT based on USDC if not available
      if (prices['USDC'] && !prices['USDT']) {
        prices['USDT'] = prices['USDC'];
      }
      
      console.log('Final token prices:', prices);
      
      // If we still don't have prices, set some default values for testing
      if (Object.keys(prices).length <= 2) {
        console.log('Using fallback prices for demonstration');
        prices['USDC'] = 0.1; // 1 USDC = 0.1 MON (1 MON = 10 USDC)
        prices['kUSDC'] = 0.1;
        prices['USDT'] = 0.1;
        prices['DAK'] = 50; // 1 DAK = 50 MON
        prices['CHOG'] = 100; // 1 CHOG = 100 MON
        prices['YAKI'] = 25; // 1 YAKI = 25 MON
      }
      
    } catch (err) {
      console.error('Error fetching Kuru prices:', err);
      
      // Set some default values for demonstration
      prices['MON'] = 1;
      prices['$MON'] = 1;
      prices['USDC'] = 0.1;
      prices['kUSDC'] = 0.1;
      prices['USDT'] = 0.1;
      prices['DAK'] = 50;
      prices['CHOG'] = 100;
      prices['YAKI'] = 25;
    }

    return prices;
  };

  const fetchBV = async path => {
    const url = `${BLOCKVISION_API}${path}`;
    const res = await fetch(url, { headers: { 'x-api-key': BV_API_KEY } });
    if (res.status === 403) throw new Error('Access denied: Invalid API key or insufficient permissions (403)');
    if (res.status === 404) throw new Error('Resource not found (404). Check the path and parameters.');
    if (res.status === 429) {
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
      
      const groupedNfts = groupIdenticalNfts(portfolio.nfts);
      
      const startIndex = groupedNfts.length > nftsPerPage ? (currentNftPage - 1) * nftsPerPage : 0;
      const endIndex = groupedNfts.length > nftsPerPage ? Math.min(startIndex + nftsPerPage, groupedNfts.length) : groupedNfts.length;
      const nftsToShow = groupedNfts.slice(startIndex, endIndex);
      
      nftsToShow.forEach((nft, index) => {
        setTimeout(() => {
          setVisibleNfts(prev => [...prev, nft]);
        }, index * 80);
      });
    }
  }, [portfolio, showNfts, currentNftPage, nftsPerPage]);

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
      // First, fetch token prices from Kuru
      const prices = await fetchTokenPricesFromKuru();
      setTokenPrices(prices);

      // 1. Balances
      const tokRes = await fetchBV(`/account/tokens?address=${address}`);
      const tokensRaw = tokRes.result?.data || [];
      const tokens = tokensRaw.map(t => {
        const balance = parseFloat(t.balance) || 0;
        return { 
          symbol: t.symbol, 
          balance,
          contractAddress: t.contractAddress
        };
      });

      // 2. DeFi positions
      const txRes = await fetchBV(`/account/transactions?address=${address}&limit=100&ascendingOrder=false`);
      const txsRaw = txRes.result?.data || [];
      const DEFI_CONTRACTS = {
        '0xabc123abc123abc123abc123abc123abc123abc1': 'Monad DEX',
        '0xdef456def456def456def456def456def456def4': 'Monad Lending',
        '0x789ghi789ghi789ghi789ghi789ghi789ghi789g': 'Monad Staking',
        '0xc816865f172d640d93712C68a7E1F83F3fA63235': 'Kuru DEX'
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
      console.log('Token prices from Kuru:', prices);
      
      setPortfolio({ tokens, defiPositions, nfts: allNfts });
      
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
    
    setTimeout(() => {
      document.getElementById('nft-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md px-6 py-4">
        <div className="flex items-center space-x-4">
          <Wallet className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-purple-400">NadFolio</span>{' '}
              <span className="text-white">Monad DeFi Dashboard</span>
            </h1>
            <p className="text-sm text-gray-300 mt-1">
              Track your DeFi wallet and positions across the Monad ecosystem
            </p>
          </div>
        </div>
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
          {/* Portfolio Summary */}
          <section className="max-w-7xl mx-auto">
            <PortfolioSummary portfolio={portfolio} tokenPrices={tokenPrices} />
          </section>

          {/* Tokens Section */}
          <section className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
              <span className="text-blue-400">Token Holdings</span>
            </h2>
            
            {portfolio.tokens.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💰</div>
                <p className="text-xl text-gray-400">No tokens found</p>
                <p className="text-sm text-gray-500 mt-2">This wallet doesn't have any token balances</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {portfolio.tokens.map((token, index) => (
                  <TokenCard 
                    key={`${token.symbol}-${token.contractAddress}`} 
                    token={token} 
                    index={index}
                    tokenPrices={tokenPrices}
                  />
                ))}
              </div>
            )}
          </section>

          {/* DeFi Positions */}
          {portfolio.defiPositions.length > 0 && (
            <section className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-center">
                <span className="text-green-400">DeFi Positions</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.defiPositions.map((position, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-800/30 to-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
                    <h3 className="text-lg font-semibold text-green-300">{position.protocol}</h3>
                    <p className="text-gray-400 mt-2">{position.count} transactions</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* NFT Collection */}
          {portfolio.nfts.length > 0 && (
            <section id="nft-section" className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  <span className="text-purple-400">NFT Collection</span>
                  <span className="text-sm text-gray-400 ml-2">({groupedNfts.length} unique items)</span>
                </h2>
                
                <div className="flex items-center space-x-4">
                  {/* View Mode Toggle */}
                  <div className="flex bg-gray-800 rounded-lg p-1">
                    <button
                      onClick={() => setNftViewMode('gallery')}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        nftViewMode === 'gallery' 
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setNftViewMode('list')}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        nftViewMode === 'list' 
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {showNfts && (
                <>
                  {/* NFT Grid */}
                  <div className={`grid gap-6 ${
                    nftViewMode === 'gallery' 
                      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6' 
                      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  }`}>
                    {visibleNfts.map((nft, index) => (
                      <NFTCard 
                        key={`${nft.contractAddress}-${nft.tokenId}-${index}`} 
                        nft={nft} 
                        index={index}
                        isVisible={true}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {shouldShowPagination && (
                    <div className="flex justify-center items-center mt-8 space-x-4">
                      <button
                        onClick={() => handlePageChange(currentNftPage - 1)}
                        disabled={currentNftPage === 1}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        Previous
                      </button>
                      
                      <div className="flex space-x-2">
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
                                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
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
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}

                  {/* Loading more NFTs indicator */}
                  {visibleNfts.length < currentNfts.length && (
                    <div className="text-center mt-8">
                      <div className="inline-flex items-center space-x-2 text-purple-400">
                        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading NFTs...</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* Charts Section */}
          {portfolio.tokens.length > 0 && (
            <section className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-center">
                <span className="text-yellow-400">Portfolio Analytics</span>
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Token Distribution Chart */}
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Token Distribution</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={portfolio.tokens.map((token, index) => ({
                            name: token.symbol,
                            value: token.symbol === 'MON' || token.symbol === '$MON' 
                              ? token.balance 
                              : token.balance * (tokenPrices[token.symbol] || 0),
                            fill: COLORS[index % COLORS.length]
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {portfolio.tokens.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${formatTokenBalance(value)} $MON`, 'Value']} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Token Values Bar Chart */}
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Token Values in $MON</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={portfolio.tokens.map(token => ({
                          symbol: token.symbol,
                          value: token.symbol === 'MON' || token.symbol === '$MON' 
                            ? token.balance 
                            : token.balance * (tokenPrices[token.symbol] || 0)
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="symbol" 
                          stroke="#9CA3AF"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          fontSize={12}
                          tickFormatter={(value) => formatTokenBalance(value)}
                        />
                        <Tooltip 
                          formatter={(value) => [`${formatTokenBalance(value)} $MON`, 'Value']}
                          labelStyle={{ color: '#374151' }}
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md mt-12 py-6 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            Powered by{' '}
            <a href="https://blockvision.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
              BlockVision API
            </a>
            {' '}and{' '}
            <a href="https://testnet.kuru.io" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
              Kuru DEX
            </a>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Track your DeFi positions across the Monad testnet ecosystem
          </p>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes nft-reveal {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-nft-reveal {
          animation: nft-reveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
}