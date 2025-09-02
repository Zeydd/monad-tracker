// src/services/evm/nftCollections.js
// Collections NFT spécifiques à surveiller sur Monad Testnet

export const nftCollections = [
  {
    name: 'Lil Chogstarr',
    address: '0xD20EF03E432208af083C0fb4e401049F4F29949F',
    symbol: 'CHOG',
    verified: true,
    description: 'Lil Chogstarr NFT Collection',
    website: null,
    twitter: null,
    discord: null,
  },
  {
    name: 'The Daks',
    address: '0x78eD9A576519024357aB06D9834266a04c9634b7',
    symbol: 'DAKS',
    verified: true,
    description: 'The Daks NFT Collection',
    website: null,
    twitter: null,
    discord: null,
  },
  {
    name: 'Molandaks',
    address: '0x66e40F67Afd710386379A6BB24D00308F81c183f',
    symbol: 'MOLA',
    verified: true,
    description: 'Molandaks NFT Collection',
    website: null,
    twitter: null,
    discord: null,
  },
  {
    name: 'SLMND NFT',
    address: '0xF7B984C089534Ff656097e8c6838b04C5652c947',
    symbol: 'SLMND',
    verified: true,
    description: 'SLMND NFT Collection',
    website: null,
    twitter: null,
    discord: null,
  },
  {
    name: 'Spiky',
    address: '0x87E1F1824C9356733A25d6beD6b9c87A3b31E107',
    symbol: 'SPIKY',
    verified: true,
    description: 'Spiky NFT Collection',
    website: null,
    twitter: null,
    discord: null,
  },
  {
    name: 'LamouchNFT',
    address: '0x5A21b0F4a4f9B54e16282b6ed5AD014B3C77186F',
    symbol: 'LAMOUCH',
    verified: true,
    description: 'LamouchNFT Collection',
    website: null,
    twitter: null,
    discord: null,
  },
  {
    name: 'OneMillion NFT',
    address: '0x340AffAeA0899Fe1Ae9E1118C529D462039cE18d',
    symbol: 'ONEM',
    verified: true,
    description: 'OneMillion NFT Collection',
    website: null,
    twitter: null,
    discord: null,
  },
  {
    name: 'Moyaking Pass',
    address: '0xF105209830EbcaEf5f1b85fB3e7F44256D1aF2e3',
    symbol: 'MOYA',
    verified: true,
    description: 'Moyaking Pass Collection',
    website: null,
    twitter: null,
    discord: null,
  },
  {
    name: 'Lil Monks',
    address: '0x4eEC5AD52C7F382bBb7906805B96A7eB29DE0747',
    symbol: 'MONKS',
    verified: true,
    description: 'Lil Monks NFT Collection',
    website: null,
    twitter: null,
    discord: null,
  },
  {
    name: 'Bandit',
    address: '0xC82f152Ba13e4bB1a41BEf7E1e8Fbe67d5403c9f',
    symbol: 'BANDIT',
    verified: true,
    description: 'Bandit NFT Collection',
    website: null,
    twitter: null,
    discord: null,
  },
  {
    name: 'Gold Teeth Gang',
    address: '0xbf1b09D5e642bC5326B7D3bD69Ac0F0e658b85B2',
    symbol: 'GTG',
    verified: true,
    description: 'Gold Teeth Gang NFT Collection',
    website: null,
    twitter: null,
    discord: null,
  },
  {
    name: 'Beholdak',
    address: '0xAd44B80aeC3a122a8E0561F5c9C1CaE9Ba062113',
    symbol: 'BEHOLDAK',
    verified: true,
    description: 'Beholdak NFT Collection',
    website: null,
    twitter: null,
    discord: null,
  },
  {
    name: 'Monshape Hopium',
    address: '0x69f2688aBE5DCdE0E2413f77B80eFCC16361a56E',
    symbol: 'MONSHAPE',
    verified: true,
    description: 'Monshape Hopium NFT Collection',
    website: null,
    twitter: null,
    discord: null,
  },
  {
    name: 'Foggy',
    address: '0x0f2F2Da004aCC38F05858F9dBc0320db64C1b6C9',
    symbol: 'FOGGY',
    verified: true,
    description: 'Foggy NFT Collection',
    website: null,
    twitter: null,
    discord: null,
  }
];

// Fonction pour récupérer une collection par adresse
export function getCollectionByAddress(address) {
  return nftCollections.find(
    collection => collection.address.toLowerCase() === address.toLowerCase()
  );
}

// Fonction pour obtenir toutes les adresses des collections
export function getAllCollectionAddresses() {
  return nftCollections.map(collection => collection.address);
}

// Fonction pour calculer un floor price réaliste basé sur l'adresse et le nom
export function generateFloorPrice(collectionAddress, collectionName) {
  // Hash simple basé sur l'adresse pour avoir des prix cohérents
  let hash = 0;
  const addr = collectionAddress.toLowerCase();
  for (let i = 0; i < addr.length; i++) {
    const char = addr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convertir en nombre entre 0 et 1
  const normalized = Math.abs(hash) / 2147483647;
  
  // Prix de base différents selon les collections (en MON)
  const basePrices = {
    'lil chogstarr': 0.15,
    'the daks': 0.08,
    'molandaks': 0.12,
    'slmnd nft': 0.06,
    'spiky': 0.04,
    'lamouchnft': 0.03,
    'onemillion nft': 0.25,     // Collection premium
    'moyaking pass': 0.18,      // Pass utilitaire
    'lil monks': 0.09,
    'bandit': 0.07,
    'gold teeth gang': 0.20,    // Collection populaire
    'beholdak': 0.14,
    'monshape hopium': 0.11,
    'foggy': 0.05,
  };
  
  const nameKey = collectionName.toLowerCase();
  const basePrice = basePrices[nameKey] || 0.05; // Prix par défaut: 0.05 MON
  
  // Ajouter une variation de ±20% basée sur l'adresse pour simuler les fluctuations
  const variation = (normalized - 0.5) * 0.4; // -20% à +20%
  const finalPrice = basePrice * (1 + variation);
  
  return Math.max(0.01, finalPrice); // Prix minimum: 0.01 MON
}

// Fonction pour simuler l'évolution du prix sur 24h
export function generatePriceChange24h(collectionAddress) {
  // Hash différent pour les changements de prix
  let hash = 0;
  const addr = collectionAddress.toLowerCase() + 'change';
  for (let i = 0; i < addr.length; i++) {
    const char = addr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const normalized = Math.abs(hash) / 2147483647;
  // Changement entre -30% et +30%
  const change = (normalized - 0.5) * 0.6;
  
  return change;
}

// Fonction pour obtenir les stats d'une collection
export function getCollectionStats(collection) {
  const floorPrice = generateFloorPrice(collection.address, collection.name);
  const priceChange = generatePriceChange24h(collection.address);
  
  return {
    floorPrice: {
      MON: floorPrice,
      USD: floorPrice * 3.6722 // Prix MON en USD
    },
    change24h: priceChange,
    volume24h: floorPrice * (5 + Math.random() * 20), // Volume simulé
    holders: Math.floor(100 + Math.random() * 500), // Nombre de holders simulé
  };
}

// Fonction pour obtenir le top des collections par floor price
export function getTopCollectionsByFloorPrice(limit = 5) {
  return nftCollections
    .map(collection => ({
      ...collection,
      stats: getCollectionStats(collection)
    }))
    .sort((a, b) => b.stats.floorPrice.MON - a.stats.floorPrice.MON)
    .slice(0, limit);
}

export default nftCollections;