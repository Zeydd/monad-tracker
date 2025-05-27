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

export default function MonadPortfolioTracker() {
  const [address, setAddress] = useState('');
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const fetchBV = async path => {
    const url = `${BLOCKVISION_API}${path}`;
    const res = await fetch(url, { headers: { 'x-api-key': BV_API_KEY } });
    if (res.status === 403) throw new Error('Accès refusé : clé API invalide ou permissions insuffisantes (403)');
    if (res.status === 404) throw new Error('Ressource non trouvée (404). Vérifiez le chemin et les paramètres.');
    if (res.status === 429) {
      // retry once
      const retryAfter = parseInt(res.headers.get('Retry-After'), 10) || 1;
      await new Promise(r => setTimeout(r, retryAfter * 1000));
      const retryRes = await fetch(url, { headers: { 'x-api-key': BV_API_KEY } });
      if (!retryRes.ok) throw new Error('Limite de requêtes dépassée (429) après retry');
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
      // 1. Balances
      const tokRes = await fetchBV(`/account/tokens?address=${address}`);
      const tokensRaw = tokRes.result?.data || [];
      if (!tokensRaw.length) throw new Error('Aucun token trouvé');
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
          `/account/nfts?address=${address}&pageIndex=${pageIndex}&verified=false&unknown=false`
        );
        const batch = nftRes.result?.data || [];
        if (!batch.length) break;
        allNfts = allNfts.concat(batch);
        const next = nftRes.result.nextPageIndex;
        if (!next || next <= pageIndex) break;
        pageIndex = next;
      }

      setPortfolio({ tokens, defiPositions, nfts: allNfts });
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
      <header className="bg-black/20 backdrop-blur-md px-6 py-4 flex items-center space-x-4">
        <Wallet className="w-8 h-8 text-purple-400" />
        <h1 className="text-2xl font-bold">Portfolio Tracker</h1>
      </header>

      {/* Search */}
      <section className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex gap-4">
          <input
            type="text"
            className="flex-1 p-3 bg-gray-800 rounded-lg focus:outline-none"
            placeholder="Enter 0x... address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && loadPortfolio()}
          />
          <button
            onClick={loadPortfolio}
            disabled={loading}
            className="px-6 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
            <span>{loading ? 'Loading...' : 'Fetch'}</span>
          </button>
        </div>
        {error && (
          <p className="mt-2 text-center text-red-400 flex items-center justify-center">
            <AlertCircle className="mr-2" /> {error}
          </p>
        )}
      </section>

      {/* Results */}
      {portfolio && (
        <main className="px-6 pb-8 space-y-8">
          {/* Balances */}
          <section className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Balances</h2>
            <div className="grid grid-cols-2 gap-x-8">
              {portfolio.tokens.map((t, i) => (
                <React.Fragment key={i}>
                  <span className="text-gray-200">{t.symbol}</span>
                  <span className="text-right">{t.balance.toFixed(4)} ({formatCurrency(t.value)})</span>
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* DeFi */}
          <section className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">DeFi Positions</h2>
            {portfolio.defiPositions.length === 0 ? (
              <p className="text-gray-400">No DeFi interactions detected.</p>
            ) : (
              <ul className="space-y-2">
                {portfolio.defiPositions.map((p, i) => (
                  <li
                    key={i}
                    className="flex justify-between bg-gray-800/30 p-3 rounded-lg"
                  >
                    <span>{p.protocol}</span>
                    <span>{p.count} txs</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* NFTs Gallery */}
          <section className="max-w-5xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">NFTs Held</h2>
            {portfolio.nfts.length === 0 ? (
              <p className="text-gray-400">No NFTs detected.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {portfolio.nfts.map((nft, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800/30 p-4 rounded-lg flex flex-col items-center"
                  >
                    {nft.image ? (
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-32 h-32 object-cover rounded-md mb-3"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-700 rounded-md mb-3 flex items-center justify-center">
                        ?
                      </div>
                    )}
                    <p className="font-semibold text-center">{nft.name || nft.contractAddress}</p>
                    <p className="text-sm text-gray-400">Standard: {nft.ercStandard}</p>
                    <p className="text-sm text-gray-400">
                      Qty: {nft.items?.reduce((sum, it) => sum + parseInt(it.qty, 10), 0)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}
