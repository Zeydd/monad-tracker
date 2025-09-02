// src/services/evm/magicEdenService.js
// Service pour récupérer les floor prices NFT depuis Magic Eden API Monad

const MAGIC_EDEN_API_BASE = 'https://api-mainnet.magiceden.dev/v3/rtp/monad-testnet';
const API_KEY = '54f647db-55e7-4de8-89aa-6e903388dc68';

// Headers corrects selon ton exemple
const getMagicEdenHeaders = () => ({
  'accept': '*/*',
  'Authorization': API_KEY // Pas de "Bearer" selon ton exemple
});

// Cache pour éviter trop de requêtes API
const floorPriceCache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

/**
 * Récupère les collections d'un utilisateur avec leurs floor prices
 */
export const getUserCollections = async (userAddress) => {
  try {
    // Vérifier le cache
    const cacheKey = userAddress.toLowerCase();
    const cached = floorPriceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached Magic Eden data');
      return cached.collections;
    }

    console.log(`🔍 Fetching Magic Eden collections for ${userAddress}...`);

    // URL selon la vraie doc
    const url = `${MAGIC_EDEN_API_BASE}/users/${userAddress}/collections/v3?includeTopBid=false&includeLiquidCount=false&offset=0&limit=20`;
    console.log('Magic Eden URL:', url);

    const options = {
      method: 'GET',
      headers: getMagicEdenHeaders()
    };

    console.log('Magic Eden Headers:', options.headers);

    const response = await fetch(url, options);

    console.log(`📡 Magic Eden API Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Magic Eden API Error: ${response.status} - ${errorText}`);
      return {};
    }

    const data = await response.json();
    console.log('📊 Magic Eden Response:', JSON.stringify(data, null, 2));

    // Traiter la réponse - structure flexible pour différents formats
    const collectionsMap = {};
    
    if (data && data.collections && Array.isArray(data.collections)) {
      console.log(`Found ${data.collections.length} collections in Magic Eden response`);
      
      data.collections.forEach((item, index) => {
        console.log(`Processing collection ${index + 1}:`, item);
        
        // Essayer différentes structures possibles
        const collection = item.collection || item;
        const contractAddress = collection.id || collection.contract || collection.address;
        
        if (contractAddress) {
          const floorPrice = parseFloat(item.floorAsk?.price?.amount?.decimal || item.floorPrice || 0);
          
          collectionsMap[contractAddress.toLowerCase()] = {
            name: collection.name || 'Unknown Collection',
            floorPrice: floorPrice,
            floorPriceCurrency: item.floorAsk?.price?.currency?.symbol || 'MON',
            tokenCount: item.ownership?.tokenCount || item.tokenCount || 0,
            ownerCount: collection.ownerCount || 0,
            onSaleCount: item.ownership?.onSaleCount || item.onSaleCount || 0,
            volume24h: collection.volume?.['1day'] || 0,
            volumeAll: collection.volume?.allTime || 0,
            image: collection.image || item.image,
            verified: collection.safelistRequestStatus === 'verified' || collection.verified || false
          };
          
          console.log(`✅ Processed ${collection.name}: ${floorPrice} ${item.floorAsk?.price?.currency?.symbol || 'MON'}`);
        } else {
          console.warn('⚠️ No contract address found for collection:', item);
        }
      });
    } else {
      console.warn('⚠️ No collections array found in Magic Eden response');
    }

    // Mettre en cache
    floorPriceCache.set(cacheKey, {
      collections: collectionsMap,
      timestamp: Date.now()
    });

    console.log(`✅ Magic Eden processing complete: ${Object.keys(collectionsMap).length} collections mapped`);
    return collectionsMap;

  } catch (error) {
    console.error(`❌ Magic Eden API Error:`, error);
    return {};
  }
};

/**
 * Convertit le prix en USD si nécessaire
 */
export const convertPriceToUSD = (price, currency, monPriceUSD = 3.6722) => {
  if (!price || price === 0) return 0;
  
  switch (currency?.toLowerCase()) {
    case 'mon':
    case 'monad':
      return price * monPriceUSD;
    case 'eth':
      return price * 2400; // Prix ETH approximatif
    case 'usdc':
    case 'usdt':
    case 'usd':
      return price;
    default:
      // Si on ne connaît pas la devise, on assume que c'est du MON
      return price * monPriceUSD;
  }
};

/**
 * Test de l'API avec logging détaillé
 */
export const testMagicEdenAPI = async (userAddress) => {
  console.log(`🧪 Testing Magic Eden API for user ${userAddress}...`);
  
  try {
    const url = `${MAGIC_EDEN_API_BASE}/users/${userAddress}/collections/v3?includeTopBid=false&includeLiquidCount=false&offset=0&limit=20`;
    console.log(`🔗 URL: ${url}`);
    
    const options = {
      method: 'GET',
      headers: getMagicEdenHeaders()
    };
    
    console.log(`📋 Headers:`, options.headers);
    
    const response = await fetch(url, options);
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Response data:', JSON.stringify(data, null, 2));
      return data;
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return null;
    }

  } catch (error) {
    console.error('💥 Test error:', error);
    return null;
  }
};

export default {
  getUserCollections,
  convertPriceToUSD,
  testMagicEdenAPI
};