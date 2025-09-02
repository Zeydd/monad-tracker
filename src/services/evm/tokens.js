// src/services/evm/tokens.js
// Version complÃ¨te avec intÃ©gration des prix live via service hybride

import { publicClient } from './client.js';
import { ERC20_ABI } from './abis/erc20.js';
import { MONAD_TOKENS, getERC20Tokens } from './tokenlist.js';

// Import du service hybride amÃ©liorÃ© avec OctoSwap
import { getHybridTokenPrice, getAllHybridTokenPrices } from './priceServiceImproved.js';

/**
 * Prix de fallback en cas d'Ã©chec total des services
 * Garde les mÃªmes valeurs que ton systÃ¨me actuel
 */
const EMERGENCY_FALLBACK_PRICES = {
  'MON': 3.6722,
  'sMON': 3.8558, // MON * 1.05
  'gMON': 3.4886, // MON * 0.95
  'aprMON': 3.5988, // MON * 0.98
  'WMON': 3.6722,
  'fMON': 3.1214, // MON * 0.85
  'USDC': 1.0,
  'USDT': 1.0,
  'wSOL': 180.50,
  'WBTC': 95000,
  'MOYAKI': 0.025,
  'CHOG': 0.15,
  'DAK': 0.08,
  'PINGU': 0.045,
  'AVAX': 40.50,
  'MATIC': 0.85
};

/**
 * Configuration optimisÃ©e des retry et timeouts
 */
const RETRY_CONFIG = {
  maxRetries: 2,     // RÃ©duit de 3 Ã  2
  baseDelay: 500,    // RÃ©duit de 1000 Ã  500ms
  maxDelay: 2000,    // RÃ©duit de 5000 Ã  2000ms
  backoffMultiplier: 1.5  // RÃ©duit de 2 Ã  1.5
};

const TIMEOUT_CONFIG = {
  balance: 5000,     // RÃ©duit de 8000 Ã  5000ms
  price: 3000,       // RÃ©duit de 12000 Ã  3000ms
  batch: 10000       // RÃ©duit de 30000 Ã  10000ms
};

/**
 * Utilitaire pour retry automatique avec backoff exponentiel
 */
async function withRetry(fn, config = RETRY_CONFIG) {
  const { maxRetries, baseDelay, backoffMultiplier } = config;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      const delay = Math.min(baseDelay * Math.pow(backoffMultiplier, attempt - 1), config.maxDelay);
      console.warn(`ðŸ”„ Retry attempt ${attempt}/${maxRetries} in ${delay}ms: ${error.message}`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Utilitaire pour timeout des opÃ©rations
 */
function withTimeout(promise, timeoutMs, operationName = 'operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`${operationName} timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

/**
 * RÃ©cupÃ¨re le balance natif MON avec retry et prix live
 */
async function getNativeBalanceWithLivePricing(userAddress) {
  try {
    console.log('ðŸ¦ Fetching native MON balance...');
    
    // RÃ©cupÃ©rer le balance avec retry
    const balance = await withTimeout(
      withRetry(async () => {
        return await publicClient.getBalance({ address: userAddress });
      }),
      TIMEOUT_CONFIG.balance,
      'Native balance fetch'
    );
    
    const balanceInMON = Number(balance) / 1e18;
    
    // RÃ©cupÃ©rer le prix live via service hybride
    let price = 0;
    let priceSource = 'Emergency Fallback';
    
    try {
      const livePrice = await withTimeout(
        getHybridTokenPrice('MON'),
        TIMEOUT_CONFIG.price,
        'MON price fetch'
      );
      
      if (livePrice && livePrice.price > 0) {
        price = livePrice.price;
        priceSource = livePrice.source;
      } else {
        throw new Error('No live price available');
      }
    } catch (priceError) {
      console.warn('âš ï¸  Live price failed, using fallback:', priceError.message);
      price = EMERGENCY_FALLBACK_PRICES.MON;
      priceSource = 'Emergency Fallback';
    }
    
    const value = balanceInMON * price;
    
    console.log(`âœ… MON Balance: ${balanceInMON.toFixed(6)} ($${value.toFixed(2)} via ${priceSource})`);
    
    return {
      symbol: 'MON',
      name: 'Monad',
      address: '0x0000000000000000000000000000000000000000',
      balance: balanceInMON,
      decimals: 18,
      isNative: true,
      price: price,
      value: value,
      source: `Native + ${priceSource}`,
      priceSource: priceSource,
      logo: '/monad.svg',
      lastUpdate: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('âŒ Critical error getting native balance:', error);
    
    // Fallback d'urgence avec balance 0
    const fallbackPrice = EMERGENCY_FALLBACK_PRICES.MON;
    return {
      symbol: 'MON',
      name: 'Monad',
      address: '0x0000000000000000000000000000000000000000',
      balance: 0,
      decimals: 18,
      isNative: true,
      price: fallbackPrice,
      value: 0,
      source: 'Critical Error Fallback',
      priceSource: 'Emergency',
      logo: '/monad.svg',
      error: error.message,
      lastUpdate: new Date().toISOString()
    };
  }
}

/**
 * RÃ©cupÃ¨re le balance d'un token ERC-20 avec prix live
 */
async function getERC20BalanceWithLivePricing(userAddress, token) {
  try {
    console.log(`ðŸ” Checking ${token.symbol} balance and price...`);
    
    // RÃ©cupÃ©rer le balance avec retry et timeout
    const balance = await withTimeout(
      withRetry(async () => {
        return await publicClient.readContract({
          address: token.address,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [userAddress],
        });
      }, { ...RETRY_CONFIG, maxRetries: 2 }), // Moins de retries pour ERC-20
      TIMEOUT_CONFIG.balance,
      `${token.symbol} balance`
    );
    
    const balanceFormatted = Number(balance) / Math.pow(10, token.decimals || 18);
    
    // Skip si balance = 0
    if (balanceFormatted <= 0) {
      console.log(`â­ï¸  ${token.symbol}: Zero balance, skipping`);
      return null;
    }
    
    // RÃ©cupÃ©rer le prix live
    let price = 0;
    let priceSource = 'Emergency Fallback';
    
    try {
      const livePrice = await withTimeout(
        getHybridTokenPrice(token.symbol, token.address),
        TIMEOUT_CONFIG.price,
        `${token.symbol} price`
      );
      
      if (livePrice && livePrice.price > 0) {
        price = livePrice.price;
        priceSource = livePrice.source;
      } else {
        throw new Error('No live price available');
      }
    } catch (priceError) {
      console.warn(`âš ï¸  Live price failed for ${token.symbol}, using fallback`);
      price = EMERGENCY_FALLBACK_PRICES[token.symbol] || 0;
      priceSource = 'Emergency Fallback';
    }
    
    const value = balanceFormatted * price;
    
    console.log(`âœ… ${token.symbol}: ${balanceFormatted.toFixed(6)} ($${value.toFixed(2)} via ${priceSource})`);
    
    return {
      symbol: token.symbol,
      name: token.name,
      address: token.address,
      balance: balanceFormatted,
      decimals: token.decimals,
      isNative: false,
      price: price,
      value: value,
      source: `ERC-20 + ${priceSource}`,
      priceSource: priceSource,
      logo: token.logoURI,
      lastUpdate: new Date().toISOString()
    };
    
  } catch (error) {
    console.warn(`âš ï¸  Failed to process ${token.symbol}:`, error.message);
    return null; // Skip ce token
  }
}

/**
 * Version optimisÃ©e avec prix live via service hybride
 */
export async function getAllTokenBalances(userAddress) {
  console.log('ðŸš€ === STARTING LIVE PRICING TOKEN FETCH ===');
  console.log(`ðŸ‘¤ Address: ${userAddress}`);
  console.log(`â° Started at: ${new Date().toISOString()}`);
  
  const startTime = Date.now();
  const allTokens = [];
  let processedTokens = 0;
  let errorCount = 0;

  try {
    // ðŸ¦ Ã‰TAPE 1: RÃ©cupÃ©rer MON natif (prioritÃ© absolue)
    console.log('\nðŸ“ Step 1: Fetching native MON with live pricing...');
    const nativeToken = await getNativeBalanceWithLivePricing(userAddress);
    allTokens.push(nativeToken);
    processedTokens++;
    
    // ðŸŽ¯ Ã‰TAPE 2: RÃ©cupÃ©rer les tokens ERC-20 avec prix live
    console.log('\nðŸ“ Step 2: Processing ERC-20 tokens with live pricing...');
    const erc20Tokens = getERC20Tokens();
    console.log(`ðŸ”¢ Will process ${erc20Tokens.length} ERC-20 tokens`);
    
    // Traitement en batch pour optimiser les performances
    const batchSize = 4; // 4 tokens par batch pour Ã©quilibrer vitesse/stabilitÃ©
    
    for (let i = 0; i < erc20Tokens.length; i += batchSize) {
      const batch = erc20Tokens.slice(i, i + batchSize);
      console.log(`\nðŸ”„ Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(erc20Tokens.length/batchSize)}: ${batch.map(t => t.symbol).join(', ')}`);
      
      // Traiter le batch en parallÃ¨le
      const batchPromises = batch.map(async (token) => {
        try {
          const result = await getERC20BalanceWithLivePricing(userAddress, token);
          processedTokens++;
          return result;
        } catch (error) {
          console.error(`ðŸ’¥ Batch error for ${token.symbol}:`, error.message);
          errorCount++;
          return null;
        }
      });
      
      // Attendre que le batch soit terminÃ©
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Ajouter les rÃ©sultats valides
      batchResults.forEach((result, batchIndex) => {
        if (result.status === 'fulfilled' && result.value !== null) {
          allTokens.push(result.value);
        } else if (result.status === 'rejected') {
          const token = batch[batchIndex];
          console.warn(`âŒ Batch ${Math.floor(i/batchSize) + 1} failed for ${token.symbol}`);
          errorCount++;
        }
      });
      
      // Pause entre batches pour Ã©viter la surcharge
      if (i + batchSize < erc20Tokens.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    // ðŸ“Š Ã‰TAPE 3: Trier et calculer les statistiques
    console.log('\nðŸ“ Step 3: Processing results...');
    
    // Trier par valeur dÃ©croissante
    allTokens.sort((a, b) => (b.value || 0) - (a.value || 0));
    
    // Calculer statistiques
    const totalValue = allTokens.reduce((sum, token) => sum + (token.value || 0), 0);
    const elapsed = Date.now() - startTime;
    
    // Analyser les sources de prix
    const sourceStats = {};
    const priceSourceStats = {};
    
    allTokens.forEach(token => {
      sourceStats[token.source] = (sourceStats[token.source] || 0) + 1;
      priceSourceStats[token.priceSource] = (priceSourceStats[token.priceSource] || 0) + 1;
    });
    
    // ðŸ“‹ Ã‰TAPE 4: Logging dÃ©taillÃ© des rÃ©sultats
    console.log('\nðŸŽ‰ === FETCH COMPLETED SUCCESSFULLY ===');
    console.log(`â±ï¸  Total execution time: ${elapsed}ms (${(elapsed / processedTokens).toFixed(0)}ms avg per token)`);
    console.log(`âœ… Tokens found: ${allTokens.length}/${processedTokens} processed`);
    console.log(`âŒ Errors encountered: ${errorCount}`);
    console.log(`ðŸ’° Total portfolio value: ${totalValue.toFixed(2)}`);
    
    console.log('\nðŸ“Š Source Distribution:');
    Object.entries(sourceStats).forEach(([source, count]) => {
      console.log(`   ðŸ”— ${source}: ${count} tokens`);
    });
    
    console.log('\nðŸ’Ž Price Source Quality:');
    Object.entries(priceSourceStats).forEach(([priceSource, count]) => {
      console.log(`   ðŸ’° ${priceSource}: ${count} tokens`);
    });
    
    console.log('\nðŸ’¼ Portfolio Breakdown:');
    allTokens.forEach((token, index) => {
      const percentage = totalValue > 0 ? ((token.value / totalValue) * 100).toFixed(1) : '0.0';
      console.log(`   ${index + 1}. ${token.symbol}: ${token.balance.toFixed(6)} = ${token.value.toFixed(2)} (${percentage}%)`);
    });
    
    return allTokens;
    
  } catch (criticalError) {
    console.error('ðŸ’¥ CRITICAL ERROR in getAllTokenBalances:', criticalError);
    
    // En cas d'erreur critique, retourner au moins le token natif en fallback
    if (allTokens.length === 0) {
      console.log('ðŸ†˜ Emergency fallback: returning basic MON token only');
      return [{
        symbol: 'MON',
        name: 'Monad',
        address: '0x0000000000000000000000000000000000000000',
        balance: 0,
        decimals: 18,
        isNative: true,
        price: EMERGENCY_FALLBACK_PRICES.MON,
        value: 0,
        source: 'Critical Emergency Fallback',
        priceSource: 'Emergency',
        logo: '/monad.svg',
        error: criticalError.message,
        lastUpdate: new Date().toISOString()
      }];
    }
    
    // Retourner ce qu'on a pu rÃ©cupÃ©rer
    console.log(`âš ï¸  Partial recovery: returning ${allTokens.length} tokens despite critical error`);
    return allTokens;
  }
}

/**
 * Version optimisÃ©e avec service hybride pour batch pricing
 */
export async function getAllTokenBalancesOptimized(userAddress) {
  console.log('âš¡ === OPTIMIZED BATCH PRICING MODE ===');
  console.log(`ðŸ‘¤ Address: ${userAddress}`);
  
  const startTime = Date.now();
  const allTokens = [];
  
  try {
    // RÃ©cupÃ©rer MON natif d'abord
    const nativeToken = await getNativeBalanceWithLivePricing(userAddress);
    allTokens.push(nativeToken);
    
    // RÃ©cupÃ©rer les balances de tous les ERC-20
    console.log('ðŸ”„ Batch fetching ERC-20 balances...');
    const erc20Tokens = getERC20Tokens();
    const balancePromises = erc20Tokens.map(async (token) => {
      try {
        const balance = await publicClient.readContract({
          address: token.address,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [userAddress],
        });
        
        const balanceFormatted = Number(balance) / Math.pow(10, token.decimals || 18);
        return balanceFormatted > 0 ? { ...token, balance: balanceFormatted } : null;
      } catch {
        return null;
      }
    });
    
    const balanceResults = await Promise.allSettled(balancePromises);
    const tokensWithBalance = balanceResults
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value);
    
    console.log(`ðŸ“Š Found ${tokensWithBalance.length} tokens with balance > 0`);
    
    // RÃ©cupÃ©rer tous les prix en une seule fois via le service hybride
    if (tokensWithBalance.length > 0) {
      console.log('ðŸ’° Batch fetching live prices...');
      try {
        const pricesResult = await withTimeout(
          getAllHybridTokenPrices(tokensWithBalance),
          TIMEOUT_CONFIG.batch,
          'Batch price fetch'
        );
        
        // Combiner balances et prix
        tokensWithBalance.forEach((token, index) => {
          const priceData = pricesResult.find(p => p.symbol === token.symbol);
          const price = priceData?.price || EMERGENCY_FALLBACK_PRICES[token.symbol] || 0;
          const priceSource = priceData?.source || 'Emergency Fallback';
          
          allTokens.push({
            symbol: token.symbol,
            name: token.name,
            address: token.address,
            balance: token.balance,
            decimals: token.decimals,
            isNative: false,
            price: price,
            value: token.balance * price,
            source: `Batch + ${priceSource}`,
            priceSource: priceSource,
            logo: token.logoURI,
            lastUpdate: new Date().toISOString()
          });
        });
        
      } catch (priceError) {
        console.error('âŒ Batch pricing failed, falling back to individual pricing:', priceError);
        // Fallback vers le mode standard
        return await getAllTokenBalances(userAddress);
      }
    }
    
    // Trier par valeur
    allTokens.sort((a, b) => (b.value || 0) - (a.value || 0));
    
    const elapsed = Date.now() - startTime;
    const totalValue = allTokens.reduce((sum, t) => sum + t.value, 0);
    
    console.log('âš¡ OPTIMIZED FETCH COMPLETED:');
    console.log(`â±ï¸  Time: ${elapsed}ms (${allTokens.length} tokens)`);
    console.log(`ðŸ’° Total: ${totalValue.toFixed(2)}`);
    
    return allTokens;
    
  } catch (error) {
    console.error('ðŸ’¥ Optimized mode failed, falling back to standard mode:', error);
    return await getAllTokenBalances(userAddress);
  }
}

/**
 * Version simple pour debug et tests rapides
 */
export async function getAllTokenBalancesSimple(userAddress) {
  console.log('ðŸ§ª === SIMPLE DEBUG MODE ===');
  console.log(`ðŸ‘¤ Address: ${userAddress}`);
  
  const tokens = [];
  
  try {
    // MON natif seulement avec prix fixe
    const nativeBalance = await publicClient.getBalance({ address: userAddress });
    const balanceInMON = Number(nativeBalance) / 1e18;
    
    tokens.push({
      symbol: 'MON',
      name: 'Monad',
      address: '0x0000000000000000000000000000000000000000',
      balance: balanceInMON,
      decimals: 18,
      isNative: true,
      price: EMERGENCY_FALLBACK_PRICES.MON,
      value: balanceInMON * EMERGENCY_FALLBACK_PRICES.MON,
      source: 'Simple Debug Mode',
      priceSource: 'Fixed Price',
      lastUpdate: new Date().toISOString()
    });
    
    // Test avec 3 premiers ERC-20 seulement
    const testTokens = getERC20Tokens().slice(0, 3);
    
    for (const token of testTokens) {
      try {
        const balance = await publicClient.readContract({
          address: token.address,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [userAddress],
        });
        
        const formatted = Number(balance) / Math.pow(10, token.decimals || 18);
        
        if (formatted > 0) {
          const price = EMERGENCY_FALLBACK_PRICES[token.symbol] || 0;
          tokens.push({
            symbol: token.symbol,
            name: token.name,
            address: token.address,
            balance: formatted,
            decimals: token.decimals,
            isNative: false,
            price: price,
            value: formatted * price,
            source: 'Simple Debug Mode',
            priceSource: 'Fixed Price',
            lastUpdate: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn(`âš ï¸  Simple mode: skipped ${token.symbol} (${err.message})`);
      }
    }
    
    console.log(`ðŸ§ª Simple mode completed: ${tokens.length} tokens found`);
    return tokens;
    
  } catch (error) {
    console.error('ðŸ’¥ Simple mode failed:', error);
    return [];
  }
}

/**
 * Calcule la valeur totale et statistiques du portfolio
 */
export function calculateTokensValue(tokens) {
  if (!tokens || tokens.length === 0) return 0;
  return tokens.reduce((total, token) => total + (token.value || 0), 0);
}

export function calculatePortfolioMetrics(tokens) {
  if (!tokens || tokens.length === 0) {
    return {
      totalValue: 0,
      totalTokens: 0,
      nativeValue: 0,
      erc20Value: 0,
      priceSourceStats: {},
      topTokens: [],
      lastUpdate: new Date().toISOString()
    };
  }
  
  const totalValue = tokens.reduce((total, token) => total + (token.value || 0), 0);
  const nativeTokens = tokens.filter(t => t.isNative);
  const erc20Tokens = tokens.filter(t => !t.isNative);
  
  const nativeValue = nativeTokens.reduce((sum, t) => sum + t.value, 0);
  const erc20Value = erc20Tokens.reduce((sum, t) => sum + t.value, 0);
  
  // Statistiques des sources de prix
  const priceSourceStats = {};
  tokens.forEach(token => {
    const source = token.priceSource || 'Unknown';
    priceSourceStats[source] = (priceSourceStats[source] || 0) + 1;
  });
  
  // Top 5 tokens par valeur
  const topTokens = tokens
    .filter(t => t.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map(t => ({
      symbol: t.symbol,
      value: t.value,
      percentage: totalValue > 0 ? ((t.value / totalValue) * 100).toFixed(1) : '0.0'
    }));
  
  return {
    totalValue,
    totalTokens: tokens.length,
    nativeValue,
    erc20Value,
    nativePercentage: totalValue > 0 ? ((nativeValue / totalValue) * 100).toFixed(1) : '0.0',
    erc20Percentage: totalValue > 0 ? ((erc20Value / totalValue) * 100).toFixed(1) : '0.0',
    priceSourceStats,
    topTokens,
    lastUpdate: new Date().toISOString()
  };
}

/**
 * Balance natif seulement (pour compatibilitÃ©)
 */
export async function getNativeBalance(userAddress) {
  try {
    const balance = await publicClient.getBalance({ address: userAddress });
    return Number(balance) / 1e18;
  } catch (error) {
    console.error('âŒ Error fetching native balance:', error);
    return 0;
  }
}

/**
 * Prix d'un seul token (pour compatibilitÃ©)
 */
export async function getTokenPrice(tokenSymbol) {
  try {
    const priceData = await getHybridTokenPrice(tokenSymbol);
    return priceData?.price || EMERGENCY_FALLBACK_PRICES[tokenSymbol] || 0;
  } catch (error) {
    console.error(`âŒ Error getting price for ${tokenSymbol}:`, error);
    return EMERGENCY_FALLBACK_PRICES[tokenSymbol] || 0;
  }
}

/**
 * Test de connectivitÃ© des services de prix
 */
export async function testPricingServices() {
  console.log('ðŸ” Testing all pricing services...');
  
  const testTokens = ['MON', 'WBTC', 'USDC', 'wSOL'];
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
  
  console.log('ðŸ’° Pricing Services Test Results:');
  Object.entries(results).forEach(([token, result]) => {
    const status = result.success ? 'âœ…' : 'âŒ';
    const info = result.success 
      ? `${result.price.toFixed(4)} via ${result.source} (${result.responseTime}ms)`
      : `Error: ${result.error}`;
    console.log(`${status} ${token}: ${info}`);
  });
  
  return results;
}

// Export de toutes les fonctions
export default {
  getAllTokenBalances,
  getAllTokenBalancesOptimized,
  getAllTokenBalancesSimple,
  calculateTokensValue,
  calculatePortfolioMetrics,
  getNativeBalance,
  getTokenPrice,
  testPricingServices
};