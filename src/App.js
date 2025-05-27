import React, { useState } from 'react';
import { Search, Wallet, RefreshCw, AlertCircle } from 'lucide-react';
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
// Votre clé API BlockVision
const BV_API_KEY = '2xdGHjON0TpF5ecWeRFbzfH5KE1';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const MonadPortfolioTracker = () => {
  const [address, setAddress] = useState('');
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidAddress = addr => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const formatCurrency = amt => {
    const num = parseFloat(amt);
    if (!isFinite(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(num);
  };

  const fetchBV = async (path) => {
    const url = `${BLOCKVISION_API}${path}`;
    const res = await fetch(url, { headers: { 'x-api-key': BV_API_KEY } });
    if (res.status === 403) throw new Error('Accès refusé : clé API invalide ou permissions insuffisantes (403)');
    if (res.status === 404) throw new Error('Ressource non trouvée (404). Vérifiez le chemin et les paramètres.');
    if (res.status === 429) {
      // Rate limit - retry once after delay
      const retryAfter = parseInt(res.headers.get('Retry-After'), 10) || 1;
      await new Promise(r => setTimeout(r, retryAfter * 1000));
      const retryRes = await fetch(url, { headers: { 'x-api-key': BV_API_KEY } });
      if (!retryRes.ok) throw new Error('Limite de requêtes dépassée (429) après tentative de retry');
      return retryRes.json();
    }
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  };

  const loadPortfolio = async () => {
    setError('');
    if (!isValidAddress(address)) {
      setError('Veuillez entrer une adresse valide (0x...)');
      return;
    }
    setLoading(true);
    try {
      // 1. Fetch token balances
      const tokRes = await fetchBV(`/account/tokens?address=${address}`);
      const tokensRaw = tokRes.result?.data || [];
      if (tokensRaw.length === 0) throw new Error('Aucun token trouvé');
      const tokens = tokensRaw.map(t => {
        const balance = parseFloat(t.balance) || 0;
        const price = parseFloat(t.price) || 0;
        return { symbol: t.symbol, balance, price, value: balance * price };
      });

      // 2. Fetch transactions for DeFi positions
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
          if (!positionsMap[to]) positionsMap[to] = { protocol: DEFI_CONTRACTS[to], count: 0 };
          positionsMap[to].count += 1;
        }
      });
      const defiPositions = Object.values(positionsMap);

            // 3. Fetch all NFTs (paginated)
      let pageIndex = 1;
      const allNfts = [];
      while (true) {
        const nftRes = await fetchBV(
          `/account/nfts?address=${address}&pageIndex=${pageIndex}&verified=false&unknown=false`
        );
        const batch = nftRes.result?.data || [];
        if (batch.length === 0) break;
        allNfts.push(...batch);
        const next = nftRes.result.nextPageIndex;
        if (!next || next <= pageIndex) break;
        pageIndex = next;
      }
      const nfts = allNfts;

      setPortfolio({ tokens, defiPositions, nfts });
    } catch (e) {
      setError(e.message);
      setPortfolio(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-6 flex items-center space-x-4">
        <Wallet className="w-8 h-8 text-purple-400" />
        <h1 className="text-2xl font-bold">Portfolio Tracker</h1>
      </div>

      {/* Search Section */}
      <div className="p-6">
        <div className="flex gap-4">
          <input
            className="flex-1 p-2 bg-gray-800 rounded"
            placeholder="0x..."
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
          <button
            onClick={loadPortfolio}
            disabled={loading}
            className="px-4 bg-blue-600 rounded flex items-center space-x-2"
          >
            {loading ? <RefreshCw className="animate-spin" /> : <Search />}
            <span>{loading ? 'Loading...' : 'Fetch'}</span>
          </button>
        </div>
        {error && <div className="mt-2 text-red-500 flex items-center"><AlertCircle /><span className="ml-2">{error}</span></div>}
      </div>

      {/* Results */}
      {portfolio && (
        <div className="p-6 space-y-6">
          {/* Balances */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Balances</h2>
            <ul className="space-y-1">
              {portfolio.tokens.map((t, i) => (
                <li key={i} className="flex justify-between">
                  <span>{t.symbol}</span>
                  <span>{t.balance} ({formatCurrency(t.value)})</span>
                </li>
              ))}
            </ul>
          </div>

          {/* DeFi Positions */}
          <div>
            <h2 className="text-xl font-semibold mb-2">DeFi Positions</h2>
            {portfolio.defiPositions.length === 0 ? (
              <p>No DeFi interactions detected.</p>
            ) : (
              <ul className="space-y-1">
                {portfolio.defiPositions.map((p, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{p.protocol}</span>
                    <span>{p.count} txs</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* NFTs */}
          <div>
            <h2 className="text-xl font-semibold mb-2">NFTs Held</h2>
            {portfolio.nfts.length === 0 ? (
              <p>No NFTs detected.</p>
            ) : (
              <ul className="space-y-4">
                {portfolio.nfts.map((nft, idx) => (
                  <li key={idx} className="bg-gray-800/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {nft.image ? (
                        <img src={nft.image} alt={nft.name} className="w-12 h-12 rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">?</div>
                      )}
                      <div>
                        <p className="font-semibold">{nft.name || `Contract ${nft.contractAddress}`}</p>
                        <p className="text-sm text-gray-400">Standard: {nft.ercStandard}</p>
                        <p className="text-sm text-gray-400">Qty: {nft.items?.reduce((sum, item) => sum + parseInt(item.qty, 10), 0)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonadPortfolioTracker;
