// src/services/evm/priceServiceImproved.js
// Service hybride avec Kuru Finance + CoinGecko + Fallbacks

import { publicClient, getWorkingClient } from './client.js';

// Prix de fallback basés sur ta tokenlist
const FALLBACK_PRICES = {
  'MON': 3.8275,
  'sMON': 3.825,    // MON * 1.05
  'gMON': 3.854,    // MON * 0.95  
  'aprMON': 3.832,  // MON * 0.98
  'WMON': 3.827,    // Same as MON
  'fMON': 3.61,    // MON * 0.85
  'USDC': 1.0,
  'wSOL': 205.50,
  'WBTC': 108714,
  'MOYAKI': 0.032,
  'CHOG': 0.185,
  'DAK': 0.095,
  'PINGU': 0.068
};

// Contrats Kuru officiels sur Monad Testnet
const KURU_CONTRACTS = {
  ROUTER: '0xc816865f172d640d93712C68a7E1F83F3fA63235',
  MARGIN_ACCOUNT: '0x4B186949F31FCA0aD08497Df9169a6bEbF0e26ef'
};

// Mapping des tokens avec tes adresses exactes
const TOKEN_ADDRESSES = {
  'MON': '0x0000000000000000000000000000000000000000', // Native
  'sMON': '0xe1d2439b75fb9746e7bc6cb777ae10aa7f7ef9c5',
  'gMON': '0xaeef2f6b429cb59c9b2d7bb2141ada993e8571c3', 
  'aprMON': '0xb2f82d0f38dc453d596ad40a37799446cc89274a',
  'WMON': '0x760afe86e5de5fa0ee542fc7b7b713e1c5425701',
  'USDC': '0xf817257fed379853cde0fa4f97ab987181b1e5ea',
  'wSOL': '0x5387C85A4965769f6B0Df430638a1388493486F1',
  'WBTC': '0xcf5a6076cfa32686c0Df13aBaDa2b40dec133F1d',
  'MOYAKI': '0xfe140e1dCe99Be9F4F15d657CD9b7BF622270C50',
  'CHOG': '0xE0590015A873bF326bd645c3E1266d4db41C4E6B',
  'DAK': '0x0F0BDEbF0F83cD1EE3974779Bcb7315f9808c714',
  'fMON': '0x89e4a70de5F2Ae468B18B6B6300B249387f9Adf0',
  'PINGU': '0xA2426cD97583939E79Cfc12aC6E9121e37D0904d'
};

// ABI minimal pour Kuru Router
const KURU_ROUTER_ABI = [
  {
    "inputs": [
      {"name": "tokenA", "type": "address"},
      {"name": "tokenB", "type": "address"},
      {"name": "amountIn", "type": "uint256"}
    ],
    "name": "getAmountsOut",
    "outputs": [{"name": "amounts", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
];

/**
 * Récupère le prix d'un token via Kuru Finance
 */
async function getKuruTokenPrice(tokenSymbol, tokenAddress = null) {
  try {
    console.log(`Fetching ${tokenSymbol} price from Kuru...`);
    
    const targetAddress = tokenAddress || TOKEN_ADDRESSES[tokenSymbol];
    const usdcAddress = TOKEN_ADDRESSES.USDC;
    
    if (!targetAddress || !usdcAddress) {
      throw new Error(`Missing address for ${tokenSymbol} or USDC`);
    }

    if (targetAddress === usdcAddress) {
      // USDC = $1
      return {
        price: 1.0,
        source: 'Kuru Finance (USDC)',
        timestamp: Date.now(),
        confidence: 1.0
      };
    }
    
    // Montant test : 1 token (1e18 en string pour éviter BigInt)
    const testAmount = '1000000000000000000'; // 1e18
    
    try {
      const amounts = await publicClient.readContract({
        address: KURU_CONTRACTS.ROUTER,
        abi: KURU_ROUTER_ABI,
        functionName: 'getAmountsOut',
        args: [targetAddress, usdcAddress, testAmount],
      });
      
      if (!amounts || amounts.length < 2) {
        throw new Error('Invalid response from Kuru router');
      }
      
      // USDC a 6 decimals
      const outputAmount = Number(amounts[1]);
      const price = outputAmount / 1e6;
      
      if (price <= 0) {
        throw new Error('Invalid price returned');
      }
      
      console.log(`${tokenSymbol} price from Kuru: $${price.toFixed(4)}`);
      
      return {
        price: price,
        source: 'Kuru Finance',
        timestamp: Date.now(),
        confidence: 0.9
      };
      
    } catch (contractError) {
      console.warn(`Kuru contract call failed for ${tokenSymbol}:`, contractError.message);
      throw contractError;
    }
    
  } catch (error) {
    console.warn(`Kuru price failed for ${tokenSymbol}:`, error.message);
    return null;
  }
}

/**
 * CoinGecko pour les tokens majeurs
 */
async function getCoinGeckoPrice(tokenSymbol) {
  const coinGeckoIds = {
    'BTC': 'bitcoin',
    'WBTC': 'wrapped-bitcoin', 
    'ETH': 'ethereum',
    'SOL': 'solana',
    'wSOL': 'solana',
    'USDC': 'usd-coin'
  };

  const coinId = coinGeckoIds[tokenSymbol];
  if (!coinId) return null;

  try {
    console.log(`Fetching ${tokenSymbol} from CoinGecko...`);
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      {
        signal: AbortSignal.timeout(3000),
        headers: { 'Accept': 'application/json' }
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const priceData = data[coinId];

    if (!priceData || !priceData.usd) {
      throw new Error('No price data available');
    }

    console.log(`${tokenSymbol} from CoinGecko: $${priceData.usd}`);

    return {
      price: priceData.usd,
      source: 'CoinGecko API',
      timestamp: Date.now(),
      confidence: 0.85
    };

  } catch (error) {
    console.warn(`CoinGecko failed for ${tokenSymbol}:`, error.message);
    return null;
  }
}

/**
 * Service hybride principal
 */
export async function getHybridTokenPrice(tokenSymbol, tokenAddress = null) {
  console.log(`Getting price for ${tokenSymbol}...`);
  
  // 1. Essayer Kuru Finance d'abord
  try {
    const kuruResult = await getKuruTokenPrice(tokenSymbol, tokenAddress);
    if (kuruResult && kuruResult.price > 0) {
      return kuruResult;
    }
  } catch (error) {
    console.warn(`Kuru failed for ${tokenSymbol}:`, error.message);
  }

  // 2. Essayer CoinGecko pour les tokens majeurs
  try {
    const cgResult = await getCoinGeckoPrice(tokenSymbol);
    if (cgResult && cgResult.price > 0) {
      return cgResult;
    }
  } catch (error) {
    console.warn(`CoinGecko failed for ${tokenSymbol}:`, error.message);
  }

  // 3. Fallback final
  const fallbackPrice = FALLBACK_PRICES[tokenSymbol] || 0;
  console.warn(`Using fallback price for ${tokenSymbol}: $${fallbackPrice}`);
  
  return {
    price: fallbackPrice,
    source: 'Emergency Fallback',
    timestamp: Date.now(),
    confidence: 0.1
  };
}

/**
 * Version batch pour récupérer plusieurs prix
 */
export async function getAllHybridTokenPrices(tokens) {
  console.log(`Batch fetching prices for ${tokens.length} tokens...`);
  
  const results = [];
  const batchSize = 3;
  
  // Traitement par batch pour éviter la surcharge
  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);
    console.log(`Processing batch: ${batch.map(t => t.symbol).join(', ')}`);
    
    const batchPromises = batch.map(async (token) => {
      const result = await getHybridTokenPrice(token.symbol, token.address);
      return {
        symbol: token.symbol,
        ...result
      };
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    });
    
    // Pause entre batches
    if (i + batchSize < tokens.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log(`Batch completed: ${results.length} prices retrieved`);
  return results;
}

/**
 * Test de connectivité des services
 */
export async function testPricingServices() {
  console.log('Testing pricing services...');
  
  const testTokens = ['MON', 'DAK', 'CHOG', 'USDC'];
  const results = {};
  
  for (const symbol of testTokens) {
    try {
      const startTime = Date.now();
      const priceData = await getHybridTokenPrice(symbol);
      const elapsed = Date.now() - startTime;
      
      results[symbol] = {
        success: priceData?.price > 0,
        price: priceData?.price || 0,
        source: priceData?.source || 'None',
        responseTime: elapsed
      };
      
    } catch (error) {
      results[symbol] = {
        success: false,
        error: error.message,
        responseTime: 0
      };
    }
  }
  
  console.log('Pricing Services Test Results:');
  Object.entries(results).forEach(([token, result]) => {
    const status = result.success ? 'OK' : 'FAIL';
    const info = result.success 
      ? `$${result.price.toFixed(4)} via ${result.source} (${result.responseTime}ms)`
      : `Error: ${result.error}`;
    console.log(`${status} ${token}: ${info}`);
  });
  
  return results;
}

/**
 * Health check complet
 */
export async function healthCheckPriceServices() {
  console.log('Running price services health check...');
  
  const healthReport = {
    timestamp: new Date().toISOString(),
    services: {},
    overallHealth: 'unknown'
  };

  // Test Kuru
  try {
    const kuruResult = await getKuruTokenPrice('MON');
    healthReport.services.kuru = {
      status: kuruResult?.price > 0 ? 'healthy' : 'unhealthy',
      latency: kuruResult?.timestamp ? Date.now() - kuruResult.timestamp : 0
    };
  } catch (error) {
    healthReport.services.kuru = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Test CoinGecko
  try {
    const cgResult = await getCoinGeckoPrice('WBTC');
    healthReport.services.coingecko = {
      status: cgResult?.price > 0 ? 'healthy' : 'unhealthy',
      latency: cgResult?.timestamp ? Date.now() - cgResult.timestamp : 0
    };
  } catch (error) {
    healthReport.services.coingecko = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Déterminer la santé globale
  const healthyServices = Object.values(healthReport.services)
    .filter(service => service.status === 'healthy').length;
  const totalServices = Object.keys(healthReport.services).length;
  
  if (healthyServices === totalServices) {
    healthReport.overallHealth = 'excellent';
  } else if (healthyServices >= totalServices * 0.5) {
    healthReport.overallHealth = 'good';
  } else {
    healthReport.overallHealth = 'degraded';
  }

  console.log(`Health check completed: ${healthReport.overallHealth}`);
  return healthReport;
}

export default {
  getHybridTokenPrice,
  getAllHybridTokenPrices,
  testPricingServices,
  healthCheckPriceServices
};