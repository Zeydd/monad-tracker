// src/services/evm/tokenlist.js
export const MONAD_TESTNET_TOKENS = [
  {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'MON',
    name: 'Monad',
    decimals: 18,
    isNative: true,
    logoURI: '/monad.svg'
  },
  {
    address: '0xe1d2439b75fb9746e7bc6cb777ae10aa7f7ef9c5',
    symbol: 'sMON',
    name: 'Staked Monad',
    decimals: 18,
    isNative: false,
    logoURI: ''
  },
  {
    address: '0xaeef2f6b429cb59c9b2d7bb2141ada993e8571c3',
    symbol: 'gMON',
    name: 'Governance Monad',
    decimals: 18,
    isNative: false,
    logoURI: ''
  },
  {
    address: '0xb2f82d0f38dc453d596ad40a37799446cc89274a',
    symbol: 'aprMON',
    name: 'Apricot Monad',
    decimals: 18,
    isNative: false,
    logoURI: ''
  },
  {
    address: '0x760afe86e5de5fa0ee542fc7b7b713e1c5425701',
    symbol: 'WMON',
    name: 'Wrapped Monad',
    decimals: 18,
    isNative: false,
    logoURI: ''
  },
  {
    address: '0xf817257fed379853cde0fa4f97ab987181b1e5ea',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    isNative: false,
    logoURI: ''
  },
  {
    address: '0x5387C85A4965769f6B0Df430638a1388493486F1',
    symbol: 'wSOL',
    name: 'Wrapped SOL',
    decimals: 9,
    isNative: false,
    logoURI: ''
  },
  {
    address: '0xcf5a6076cfa32686c0Df13aBaDa2b40dec133F1d',
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    decimals: 8,
    isNative: false,
    logoURI: ''
  },
  {
    address: '0xfe140e1dCe99Be9F4F15d657CD9b7BF622270C50',
    symbol: 'MOYAKI',
    name: 'Moyaki Token',
    decimals: 18,
    isNative: false,
    logoURI: ''
  },
  {
    address: '0xE0590015A873bF326bd645c3E1266d4db41C4E6B',
    symbol: 'CHOG',
    name: 'Chog Token',
    decimals: 18,
    isNative: false,
    logoURI: ''
  },
  {
    address: '0x0F0BDEbF0F83cD1EE3974779Bcb7315f9808c714',
    symbol: 'DAK',
    name: 'Dak Token',
    decimals: 18,
    isNative: false,
    logoURI: ''
  },
  {
    address: '0x89e4a70de5F2Ae468B18B6B6300B249387f9Adf0',
    symbol: 'fMON',
    name: 'Fractional MON',
    decimals: 18,
    isNative: false,
    logoURI: ''
  },
  {
    address: '0xA2426cD97583939E79Cfc12aC6E9121e37D0904d',
    symbol: 'PINGU',
    name: 'Pingu Token',
    decimals: 18,
    isNative: false,
    logoURI: ''
  }
];

// Fonction pour obtenir les infos d'un token par son adresse
export const getTokenInfo = (address) => {
  return MONAD_TESTNET_TOKENS.find(
    token => token.address.toLowerCase() === address.toLowerCase()
  );
};

// Fonction pour obtenir tous les tokens non-natifs (ERC-20)
export const getERC20Tokens = () => {
  return MONAD_TESTNET_TOKENS.filter(token => !token.isNative);
};

// Alias pour compatibilité
export const MONAD_TOKENS = MONAD_TESTNET_TOKENS;

export default MONAD_TESTNET_TOKENS;