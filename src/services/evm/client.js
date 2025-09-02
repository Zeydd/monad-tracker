import { createPublicClient, http } from 'viem';
import { defineChain } from 'viem';

// Configuration du rÃ©seau Monad Testnet
export const monadTestnet = defineChain({
  id: 41454,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.ankr.com/monad_testnet',
        'https://testnet-rpc.monad.xyz',
        'https://monad-testnet.drpc.org'
      ],
      webSocket: ['wss://monad-testnet.drpc.org'],
    },
    public: {
      http: [
        'https://rpc.ankr.com/monad_testnet',
        'https://testnet-rpc.monad.xyz',
        'https://monad-testnet.drpc.org'
      ],
      webSocket: ['wss://monad-testnet.drpc.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://explorer.monad.com' },
  },
});

// Client public optimisÃ© - simple et efficace
export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http('https://rpc.ankr.com/monad_testnet', {
    timeout: 15_000,
    retryCount: 2,
    retryDelay: 500,
  }),
});

// Client de backup si Ankr ne fonctionne pas
export const backupClient = createPublicClient({
  chain: monadTestnet,
  transport: http('https://testnet-rpc.monad.xyz', {
    timeout: 15_000,
    retryCount: 2,
    retryDelay: 500,
  }),
});

// Client original en dernier recours
export const originalClient = createPublicClient({
  chain: monadTestnet,
  transport: http('https://monad-testnet.drpc.org', {
    timeout: 15_000,
    retryCount: 2,
    retryDelay: 500,
  }),
});

// Fonction pour obtenir un client qui fonctionne
export async function getWorkingClient() {
  const clients = [publicClient, backupClient, originalClient];
  
  for (const client of clients) {
    try {
      // Test rapide de connectivitÃ©
      await Promise.race([
        client.getBlockNumber(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]);
      return client;
    } catch (error) {
      console.warn(`Client failed, trying next...`);
      continue;
    }
  }
  
  throw new Error('Tous les RPC sont inaccessibles');
}

export default publicClient;