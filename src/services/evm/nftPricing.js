// Service pour récupérer les prix des NFTs via Magic Eden API
const MAGIC_EDEN_API_BASE = 'https://api-mainnet.magiceden.dev/v3';
const MAGIC_EDEN_V2_BASE = 'https://api-mainnet.magiceden.dev/v2';

// Headers pour les requêtes Magic Eden
const getMagicEdenHeaders = () => ({
  'Authorization': `Bearer 54f647db-55e7-4de8-89aa-6e903388dc68`,
  'Content-Type': 'application/json',
  'User-Agent': 'Nadfolio/1.0'
});

// Cache pour éviter trop de requêtes API
const floorPriceCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fonction pour récupérer le floor price via Magic Eden V3 API
export const getFloorPriceFromMagicEden = async (collectionAddress) => {
  try {
    // Vérifier le cache
    const cacheKey = collectionAddress.toLowerCase();
    const cached = floorPriceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.floorPrice;
    }

    // D'abord essayer l'API V3 pour Monad
    try {
      const v3Response = await fetch(`${MAGIC_EDEN_API_BASE}/collections/${collectionAddress}/stats`, {
        headers: getMagicEdenHeaders()
      });

      if (v3Response.ok) {
        const v3Data = await v3Response.json();
        const floorPrice = v3Data.floorPrice || v3Data.floor_price || 0;
        
        if (floorPrice > 0) {
          floorPriceCache.set(cacheKey, {
            floorPrice,
            timestamp: Date.now()
          });
          return floorPrice;
        }
      }
    } catch (v3Error) {
      console.log(`V3 API failed for ${collectionAddress}, trying V2...`);
    }

    // Fallback vers V2 API
    const v2Response = await fetch(`${MAGIC_EDEN_V2_BASE}/collections/${collectionAddress}/stats`, {
      headers: getMagicEdenHeaders()
    });

    if (!v2Response.ok) {
      console.warn(`Magic Eden V2 API error for ${collectionAddress}: ${v2Response.status}`);
      return null;
    }

    const v2Data = await v2Response.json();
    const floorPrice = v2Data.floorPrice || v2Data.floor_price || 0;

    // Mettre en cache
    floorPriceCache.set(cacheKey, {
      floorPrice,
      timestamp: Date.now()
    });

    return floorPrice;
  } catch (error) {
    console.error(`Erreur Magic Eden API pour ${collectionAddress}:`, error);
    return null;
  }
};

// Fonction alternative : récupérer via les listings (plus fiable)
export const getFloorPriceFromListings = async (collectionAddress) => {
  try {
    const response = await fetch(`${MAGIC_EDEN_V2_BASE}/collections/${collectionAddress}/listings?offset=0&limit=1`, {
      headers: getMagicEdenHeaders()
    });

    if (!response.ok) {
      return null;
    }

    const listings = await response.json();
    if (listings && listings.length > 0) {
      // Prendre le prix du listing le moins cher
      const prices = listings.map(listing => listing.price || listing.priceInfo?.price || 0);
      return Math.min(...prices.filter(p => p > 0));
    }

    return 0;
  } catch (error) {
    console.error(`Erreur listings pour ${collectionAddress}:`, error);
    return null;
  }
};

// Fallback : estimation du floor price via les dernières ventes on-chain
export const estimateFloorPriceOnChain = async (collectionAddress) => {
  try {
    // Pour l'instant, on utilise une estimation basique
    // En production, on pourrait parser les events Transfer des marketplaces
    console.log(`Estimation on-chain non implémentée pour ${collectionAddress}`);
    return 0.001; // Valeur par défaut très faible
  } catch (error) {
    console.error(`Erreur estimation floor price on-chain ${collectionAddress}:`, error);
    return 0;
  }
};

// Fonction principale pour obtenir le floor price (avec plusieurs fallbacks)
export const getCollectionFloorPrice = async (collectionAddress) => {
  try {
    // Méthode 1 : Stats API
    let floorPrice = await getFloorPriceFromMagicEden(collectionAddress);
    
    // Méthode 2 : Listings API si stats échoue
    if (floorPrice === null || floorPrice === 0) {
      floorPrice = await getFloorPriceFromListings(collectionAddress);
    }
    
    // Méthode 3 : Estimation on-chain en dernier recours
    if (floorPrice === null || floorPrice === 0) {
      floorPrice = await estimateFloorPriceOnChain(collectionAddress);
    }
    
    return floorPrice || 0;
  } catch (error) {
    console.error(`Erreur getCollectionFloorPrice ${collectionAddress}:`, error);
    return 0;
  }
};

// Fonction pour obtenir les floor prices de plusieurs collections
export const getMultipleFloorPrices = async (collectionAddresses) => {
  try {
    // Traiter par batch de 3 pour éviter le rate limiting
    const batchSize = 3;
    const results = {};
    
    for (let i = 0; i < collectionAddresses.length; i += batchSize) {
      const batch = collectionAddresses.slice(i, i + batchSize);
      
      const promises = batch.map(async address => {
        const floorPrice = await getCollectionFloorPrice(address);
        return { address, floorPrice };
      });

      const batchResults = await Promise.allSettled(promises);
      
      batchResults.forEach((result, index) => {
        const address = batch[index];
        if (result.status === 'fulfilled') {
          results[address.toLowerCase()] = result.value.floorPrice;
        } else {
          results[address.toLowerCase()] = 0;
        }
      });

      // Pause entre les batches
      if (i + batchSize < collectionAddresses.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return results;
  } catch (error) {
    console.error('Erreur getMultipleFloorPrices:', error);
    return {};
  }
};

// Fonction pour calculer la valeur estimée d'une collection NFT
export const calculateCollectionValue = (collection, floorPrice) => {
  if (!collection || !collection.balance || floorPrice <= 0) {
    return 0;
  }
  
  return collection.balance * floorPrice;
};

// Fonction pour formater les prix en ETH/MON
export const formatPrice = (price, currency = 'MON') => {
  if (!price || price === 0) return `0 ${currency}`;
  
  if (price < 0.0001) {
    return `< 0.0001 ${currency}`;
  }
  
  return `${price.toFixed(4)} ${currency}`;
};

// Fonction pour convertir le prix en USD (nécessite un taux de change MON/USD)
export const convertToUSD = (priceInMON, monToUsdRate = 1) => {
  return priceInMON * monToUsdRate;
};

// Fonction pour débugger et tester l'API
export const testMagicEdenAPI = async (collectionAddress) => {
  console.log(`🔍 Testing Magic Eden API for ${collectionAddress}...`);
  
  try {
    // Test V3
    const v3Url = `${MAGIC_EDEN_API_BASE}/collections/${collectionAddress}/stats`;
    console.log(`Trying V3: ${v3Url}`);
    
    const v3Response = await fetch(v3Url, {
      headers: getMagicEdenHeaders()
    });
    
    console.log(`V3 Status: ${v3Response.status}`);
    if (v3Response.ok) {
      const v3Data = await v3Response.json();
      console.log('V3 Data:', v3Data);
    }

    // Test V2
    const v2Url = `${MAGIC_EDEN_V2_BASE}/collections/${collectionAddress}/stats`;
    console.log(`Trying V2: ${v2Url}`);
    
    const v2Response = await fetch(v2Url, {
      headers: getMagicEdenHeaders()
    });
    
    console.log(`V2 Status: ${v2Response.status}`);
    if (v2Response.ok) {
      const v2Data = await v2Response.json();
      console.log('V2 Data:', v2Data);
    }

    // Test Listings
    const listingsUrl = `${MAGIC_EDEN_V2_BASE}/collections/${collectionAddress}/listings?offset=0&limit=5`;
    console.log(`Trying Listings: ${listingsUrl}`);
    
    const listingsResponse = await fetch(listingsUrl, {
      headers: getMagicEdenHeaders()
    });
    
    console.log(`Listings Status: ${listingsResponse.status}`);
    if (listingsResponse.ok) {
      const listingsData = await listingsResponse.json();
      console.log('Listings Data:', listingsData);
    }

  } catch (error) {
    console.error('Test Error:', error);
  }
};

export default {
  getCollectionFloorPrice,
  getMultipleFloorPrices,
  calculateCollectionValue,
  formatPrice,
  convertToUSD,
  testMagicEdenAPI
};