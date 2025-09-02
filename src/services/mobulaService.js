// src/services/mobulaService.js
// Service pour l'intégration avec l'API Mobula
// Documentation: https://docs.mobula.io/

class MobulaService {
  constructor() {
    this.baseURL = 'https://api.mobula.io/api/1';
    // TODO: Remplacer par votre clé API Mobula
    this.apiKey = 'YOUR_MOBULA_API_KEY_HERE';
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  // Méthode utilitaire pour les appels API
  async makeRequest(endpoint, params = {}) {
    try {
      const url = new URL(`${this.baseURL}${endpoint}`);
      
      // Ajouter les paramètres à l'URL
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

      console.log(`🔍 Mobula API Call: ${url.toString()}`);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Mobula Response:`, data);
      
      return data;
    } catch (error) {
      console.error(`❌ Mobula API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Obtenir le portfolio d'un wallet
  async getWalletPortfolio(address) {
    try {
      return await this.makeRequest('/wallet/portfolio', {
        wallet: address
      });
    } catch (error) {
      console.error('Error fetching wallet portfolio:', error);
      return { data: { assets: [], nfts: [] } };
    }
  }

  // Obtenir les positions DeFi d'un wallet
  async getDefiPositions(address) {
    try {
      return await this.makeRequest('/wallet/defi', {
        wallet: address
      });
    } catch (error) {
      console.error('Error fetching DeFi positions:', error);
      return { data: { protocols: [] } };
    }
  }

  // Obtenir les transactions d'un wallet
  async getWalletTransactions(address, limit = 50) {
    try {
      return await this.makeRequest('/wallet/transactions', {
        wallet: address,
        limit: limit
      });
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      return { data: { transactions: [] } };
    }
  }

  // Obtenir l'historique d'un wallet
  async getWalletHistory(address, from, to) {
    try {
      return await this.makeRequest('/wallet/history', {
        wallet: address,
        from: from,
        to: to
      });
    } catch (error) {
      console.error('Error fetching wallet history:', error);
      return { data: { history: [] } };
    }
  }

  // Obtenir les NFTs d'un wallet
  async getWalletNFTs(address) {
    try {
      return await this.makeRequest('/wallet/nfts', {
        wallet: address
      });
    } catch (error) {
      console.error('Error fetching wallet NFTs:', error);
      return { data: { nfts: [] } };
    }
  }

  // Obtenir les données d'un token spécifique
  async getTokenData(tokenAddress) {
    try {
      return await this.makeRequest('/market/data', {
        asset: tokenAddress
      });
    } catch (error) {
      console.error('Error fetching token data:', error);
      return { data: null };
    }
  }

  // Obtenir les prix de plusieurs tokens
  async getMultipleTokenPrices(tokenAddresses) {
    try {
      return await this.makeRequest('/market/multi-data', {
        assets: tokenAddresses.join(',')
      });
    } catch (error) {
      console.error('Error fetching multiple token prices:', error);
      return { data: {} };
    }
  }

  // Obtenir les métriques d'un protocole DeFi
  async getProtocolMetrics(protocolName) {
    try {
      return await this.makeRequest('/defi/protocol', {
        name: protocolName
      });
    } catch (error) {
      console.error('Error fetching protocol metrics:', error);
      return { data: null };
    }
  }
}

// Formatters pour traiter les données de l'API Mobula
export const formatters = {
  // Formater les positions DeFi
  formatDefiPositions: (apiResponse) => {
    if (!apiResponse?.data?.protocols) {
      return {
        protocolCount: 0,
        positionCount: 0,
        totalValue: 0,
        positions: []
      };
    }

    const protocols = apiResponse.data.protocols;
    let totalValue = 0;
    let positionCount = 0;
    const positions = [];

    protocols.forEach(protocol => {
      if (protocol.positions) {
        protocol.positions.forEach(position => {
          totalValue += position.value || 0;
          positionCount++;
          
          positions.push({
            protocol: protocol.name || 'Unknown',
            type: position.type || 'Position',
            value: position.value || 0,
            apy: position.apy || 0,
            tokens: position.tokens || [],
            status: position.active ? 'active' : 'inactive'
          });
        });
      }
    });

    return {
      protocolCount: protocols.length,
      positionCount: positionCount,
      totalValue: totalValue,
      positions: positions.sort((a, b) => (b.value || 0) - (a.value || 0))
    };
  },

  // Formater les transactions
  formatTransactions: (apiResponse) => {
    if (!apiResponse?.data?.transactions) {
      return [];
    }

    return apiResponse.data.transactions.map(tx => ({
      hash: tx.hash,
      type: tx.type || 'Transaction',
      value: tx.value || 0,
      blockNumber: tx.block_number,
      timestamp: tx.timestamp,
      from: tx.from,
      to: tx.to,
      gasUsed: tx.gas_used,
      gasPrice: tx.gas_price
    }));
  },

  // Formater les activités du portfolio
  formatActivities: (apiResponse) => {
    if (!apiResponse?.data?.activities) {
      return [];
    }

    return apiResponse.data.activities.map(activity => ({
      type: activity.type || 'Activity',
      hash: activity.transaction_hash,
      timestamp: activity.timestamp,
      amount: activity.amount || 0,
      token: activity.token?.symbol || 'Unknown',
      protocol: activity.protocol?.name || null,
      action: activity.action || 'Unknown'
    }));
  },

  // Formater les données de tokens
  formatTokens: (apiResponse) => {
    if (!apiResponse?.data?.assets) {
      return [];
    }

    return apiResponse.data.assets.map(asset => ({
      symbol: asset.symbol,
      name: asset.name,
      balance: asset.balance,
      readableBalance: parseFloat(asset.balance) / Math.pow(10, asset.decimals || 18),
      price: asset.price || 0,
      value: asset.value || 0,
      contractAddress: asset.contract,
      decimal: asset.decimals || 18,
      imageURL: asset.logo || `https://via.placeholder.com/40/8B5CF6/FFFFFF?text=${asset.symbol?.substring(0, 1) || 'T'}`,
      verified: asset.verified || false,
      change24h: asset.price_change_24h || 0
    }));
  },

  // Formater les NFTs
  formatNFTs: (apiResponse) => {
    if (!apiResponse?.data?.nfts) {
      return [];
    }

    return apiResponse.data.nfts.map(nft => ({
      name: nft.name || `NFT #${nft.token_id}`,
      collection: nft.collection?.name || 'Unknown Collection',
      value: nft.value || 0,
      imageURL: nft.image_url || 'https://via.placeholder.com/150/8B5CF6/FFFFFF?text=NFT',
      tokenId: nft.token_id,
      contractAddress: nft.contract,
      rarity: nft.rarity || null,
      traits: nft.traits || []
    }));
  }
};

// Instance singleton du service
const mobulaService = new MobulaService();

export { mobulaService };
export default mobulaService;