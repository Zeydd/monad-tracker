// src/services/evm/abis/pyth.js
// ABI complet pour l'interface IPyth des contrats Pyth Network

/**
 * ABI de l'interface IPyth
 * Basé sur @pythnetwork/pyth-sdk-solidity
 */
export const PYTH_ABI = [
  // Fonctions de lecture des prix
  {
    name: 'getPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'id', type: 'bytes32' }
    ],
    outputs: [
      { 
        name: 'price', 
        type: 'tuple',
        components: [
          { name: 'price', type: 'int64' },
          { name: 'conf', type: 'uint64' },
          { name: 'expo', type: 'int32' },
          { name: 'publishTime', type: 'uint256' }
        ]
      }
    ]
  },
  {
    name: 'getPriceUnsafe',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'id', type: 'bytes32' }
    ],
    outputs: [
      { 
        name: 'price', 
        type: 'tuple',
        components: [
          { name: 'price', type: 'int64' },
          { name: 'conf', type: 'uint64' },
          { name: 'expo', type: 'int32' },
          { name: 'publishTime', type: 'uint256' }
        ]
      }
    ]
  },
  {
    name: 'getPriceNoOlderThan',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'id', type: 'bytes32' },
      { name: 'age', type: 'uint256' }
    ],
    outputs: [
      { 
        name: 'price', 
        type: 'tuple',
        components: [
          { name: 'price', type: 'int64' },
          { name: 'conf', type: 'uint64' },
          { name: 'expo', type: 'int32' },
          { name: 'publishTime', type: 'uint256' }
        ]
      }
    ]
  },
  {
    name: 'getEmaPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'id', type: 'bytes32' }
    ],
    outputs: [
      { 
        name: 'price', 
        type: 'tuple',
        components: [
          { name: 'price', type: 'int64' },
          { name: 'conf', type: 'uint64' },
          { name: 'expo', type: 'int32' },
          { name: 'publishTime', type: 'uint256' }
        ]
      }
    ]
  },
  {
    name: 'getEmaPriceUnsafe',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'id', type: 'bytes32' }
    ],
    outputs: [
      { 
        name: 'price', 
        type: 'tuple',
        components: [
          { name: 'price', type: 'int64' },
          { name: 'conf', type: 'uint64' },
          { name: 'expo', type: 'int32' },
          { name: 'publishTime', type: 'uint256' }
        ]
      }
    ]
  },
  {
    name: 'getEmaPriceNoOlderThan',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'id', type: 'bytes32' },
      { name: 'age', type: 'uint256' }
    ],
    outputs: [
      { 
        name: 'price', 
        type: 'tuple',
        components: [
          { name: 'price', type: 'int64' },
          { name: 'conf', type: 'uint64' },
          { name: 'expo', type: 'int32' },
          { name: 'publishTime', type: 'uint256' }
        ]
      }
    ]
  },

  // Fonctions de mise à jour
  {
    name: 'updatePriceFeeds',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'updateData', type: 'bytes[]' }
    ],
    outputs: []
  },
  {
    name: 'updatePriceFeedsIfNecessary',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'updateData', type: 'bytes[]' },
      { name: 'priceIds', type: 'bytes32[]' },
      { name: 'publishTimes', type: 'uint64[]' }
    ],
    outputs: []
  },

  // Fonctions de frais
  {
    name: 'getUpdateFee',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'updateData', type: 'bytes[]' }
    ],
    outputs: [
      { name: 'feeAmount', type: 'uint256' }
    ]
  },

  // Fonctions de validation
  {
    name: 'getValidTimePeriod',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'validTimePeriod', type: 'uint256' }
    ]
  },

  // Événements
  {
    name: 'PriceFeedUpdate',
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', type: 'bytes32', indexed: true },
      { name: 'publishTime', type: 'uint64', indexed: false },
      { name: 'price', type: 'int64', indexed: false },
      { name: 'conf', type: 'uint64', indexed: false }
    ]
  },
  {
    name: 'BatchPriceFeedUpdate',
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'chainId', type: 'uint16', indexed: false },
      { name: 'sequenceNumber', type: 'uint64', indexed: false }
    ]
  }
];

/**
 * Structure des données de prix Pyth
 */
export const PYTH_PRICE_STRUCT = {
  components: [
    { name: 'price', type: 'int64' },
    { name: 'conf', type: 'uint64' },
    { name: 'expo', type: 'int32' },
    { name: 'publishTime', type: 'uint256' }
  ],
  name: 'PythStructs.Price',
  type: 'tuple'
};

/**
 * Fonctions utilitaires pour formater les données Pyth
 */
export class PythDataUtils {
  /**
   * Formate un prix Pyth raw en nombre lisible
   */
  static formatPrice(rawPrice) {
    const { price, conf, expo, publishTime } = rawPrice;
    
    const formattedPrice = Number(price) * Math.pow(10, expo);
    const formattedConf = Number(conf) * Math.pow(10, expo);
    
    return {
      price: formattedPrice,
      confidence: formattedConf,
      expo: expo,
      publishTime: Number(publishTime),
      publishDate: new Date(Number(publishTime) * 1000),
      ageSeconds: Math.floor(Date.now() / 1000) - Number(publishTime)
    };
  }

  /**
   * Valide qu'un prix n'est pas trop ancien
   */
  static isValidPrice(rawPrice, maxAgeSeconds = 300) {
    const currentTime = Math.floor(Date.now() / 1000);
    const priceAge = currentTime - Number(rawPrice.publishTime);
    
    return {
      isValid: priceAge <= maxAgeSeconds,
      ageSeconds: priceAge,
      maxAge: maxAgeSeconds
    };
  }

  /**
   * Convertit un price feed ID string en bytes32
   */
  static toPriceId(priceIdString) {
    // Assurer que c'est un string de 66 caractères (0x + 64 hex chars)
    if (typeof priceIdString !== 'string') {
      throw new Error('Price ID must be a string');
    }
    
    if (!priceIdString.startsWith('0x')) {
      priceIdString = '0x' + priceIdString;
    }
    
    if (priceIdString.length !== 66) {
      throw new Error(`Invalid price ID length: ${priceIdString.length}, expected 66`);
    }
    
    return priceIdString;
  }

  /**
   * Valide le format d'un price feed ID
   */
  static isValidPriceId(priceId) {
    try {
      PythDataUtils.toPriceId(priceId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Calcule la confiance en pourcentage du prix
   */
  static calculateConfidencePercent(price, confidence) {
    if (price === 0) return 100;
    return (Math.abs(confidence) / Math.abs(price)) * 100;
  }

  /**
   * Détermine si un prix est stable basé sur sa confiance
   */
  static isPriceStable(price, confidence, maxConfidencePercent = 1.0) {
    const confidencePercent = PythDataUtils.calculateConfidencePercent(price, confidence);
    return confidencePercent <= maxConfidencePercent;
  }
}

/**
 * Codes d'erreur Pyth communs
 */
export const PYTH_ERRORS = {
  STALE_PRICE: 'StalePrice',
  PRICE_FEED_NOT_FOUND: 'PriceFeedNotFound',
  INSUFFICIENT_FEE: 'InsufficientFee',
  INVALID_UPDATE_DATA: 'InvalidUpdateData',
  INVALID_WORMHOLE_VAA: 'InvalidWormholeVAA',
  INVALID_PRICE_ID: 'InvalidPriceId'
};

/**
 * Messages d'erreur lisibles
 */
export const PYTH_ERROR_MESSAGES = {
  [PYTH_ERRORS.STALE_PRICE]: 'Le prix est trop ancien. Essayez de mettre à jour les feeds.',
  [PYTH_ERRORS.PRICE_FEED_NOT_FOUND]: 'Feed de prix non trouvé ou jamais mis à jour.',
  [PYTH_ERRORS.INSUFFICIENT_FEE]: 'Frais insuffisants pour la mise à jour des prix.',
  [PYTH_ERRORS.INVALID_UPDATE_DATA]: 'Données de mise à jour invalides.',
  [PYTH_ERRORS.INVALID_WORMHOLE_VAA]: 'Signature Wormhole VAA invalide.',
  [PYTH_ERRORS.INVALID_PRICE_ID]: 'ID de price feed invalide.'
};

/**
 * Gestionnaire d'erreurs Pyth
 */
export class PythErrorHandler {
  /**
   * Parse une erreur de contrat Pyth et retourne un message lisible
   */
  static parseError(error) {
    const errorMessage = error.message || error.toString();
    
    // Chercher les erreurs Pyth connues
    for (const [errorCode, friendlyMessage] of Object.entries(PYTH_ERROR_MESSAGES)) {
      if (errorMessage.includes(errorCode)) {
        return {
          code: errorCode,
          message: friendlyMessage,
          originalError: errorMessage
        };
      }
    }
    
    // Erreurs de revert génériques
    if (errorMessage.includes('execution reverted')) {
      return {
        code: 'EXECUTION_REVERTED',
        message: 'Transaction a échoué lors de l\'exécution.',
        originalError: errorMessage
      };
    }
    
    // Erreurs de réseau
    if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Erreur de réseau. Vérifiez votre connexion.',
        originalError: errorMessage
      };
    }
    
    // Erreur inconnue
    return {
      code: 'UNKNOWN_ERROR',
      message: 'Erreur inconnue lors de l\'appel Pyth.',
      originalError: errorMessage
    };
  }

  /**
   * Vérifie si une erreur est récupérable (peut être retentée)
   */
  static isRetryableError(error) {
    const parsedError = PythErrorHandler.parseError(error);
    
    const retryableCodes = [
      'NETWORK_ERROR',
      'EXECUTION_REVERTED',
      PYTH_ERRORS.STALE_PRICE
    ];
    
    return retryableCodes.includes(parsedError.code);
  }

  /**
   * Suggestions d'actions basées sur l'erreur
   */
  static getSuggestion(error) {
    const parsedError = PythErrorHandler.parseError(error);
    
    const suggestions = {
      [PYTH_ERRORS.STALE_PRICE]: 'Essayez d\'appeler updatePriceFeeds() avec les dernières données Hermes.',
      [PYTH_ERRORS.PRICE_FEED_NOT_FOUND]: 'Vérifiez que le price feed ID est correct et supporté sur ce réseau.',
      [PYTH_ERRORS.INSUFFICIENT_FEE]: 'Augmentez les frais en appelant getUpdateFee() d\'abord.',
      [PYTH_ERRORS.INVALID_UPDATE_DATA]: 'Récupérez de nouvelles données depuis l\'API Hermes.',
      'NETWORK_ERROR': 'Vérifiez votre connexion réseau et réessayez.',
      'EXECUTION_REVERTED': 'Vérifiez les paramètres de votre appel de fonction.'
    };
    
    return suggestions[parsedError.code] || 'Consultez la documentation Pyth pour plus d\'aide.';
  }
}

/**
 * Constantes de configuration Pyth
 */
export const PYTH_CONFIG = {
  // Périodes de validité par défaut (en secondes)
  DEFAULT_MAX_AGE: 300,        // 5 minutes
  STRICT_MAX_AGE: 60,          // 1 minute
  RELAXED_MAX_AGE: 3600,       // 1 heure
  
  // Seuils de confiance (en pourcentage)
  HIGH_CONFIDENCE: 0.1,        // 0.1%
  MEDIUM_CONFIDENCE: 1.0,      // 1.0%
  LOW_CONFIDENCE: 5.0,         // 5.0%
  
  // Timeouts pour les appels
  PRICE_FETCH_TIMEOUT: 10000,  // 10 secondes
  UPDATE_TIMEOUT: 30000,       // 30 secondes
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,           // 1 seconde
  
  // Limites de batch
  MAX_BATCH_SIZE: 20,          // Maximum de feeds par batch
  BATCH_DELAY: 100             // Délai entre batches (ms)
};

/**
 * Validateur de données Pyth
 */
export class PythValidator {
  /**
   * Valide une structure de prix Pyth
   */
  static validatePriceStruct(priceStruct) {
    const errors = [];
    
    if (typeof priceStruct !== 'object' || priceStruct === null) {
      errors.push('Price struct must be an object');
      return { valid: false, errors };
    }
    
    // Vérifier les champs requis
    const requiredFields = ['price', 'conf', 'expo', 'publishTime'];
    for (const field of requiredFields) {
      if (!(field in priceStruct)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Vérifier les types
    if ('price' in priceStruct && typeof priceStruct.price !== 'bigint' && typeof priceStruct.price !== 'number') {
      errors.push('Price must be a number or bigint');
    }
    
    if ('conf' in priceStruct && typeof priceStruct.conf !== 'bigint' && typeof priceStruct.conf !== 'number') {
      errors.push('Confidence must be a number or bigint');
    }
    
    if ('expo' in priceStruct && typeof priceStruct.expo !== 'number') {
      errors.push('Exponent must be a number');
    }
    
    if ('publishTime' in priceStruct && typeof priceStruct.publishTime !== 'bigint' && typeof priceStruct.publishTime !== 'number') {
      errors.push('Publish time must be a number or bigint');
    }
    
    // Vérifier les valeurs logiques
    if ('publishTime' in priceStruct) {
      const publishTime = Number(priceStruct.publishTime);
      const now = Math.floor(Date.now() / 1000);
      
      if (publishTime > now + 60) { // 1 minute dans le futur max
        errors.push('Publish time is too far in the future');
      }
      
      if (publishTime < now - 86400) { // Plus de 24h dans le passé
        errors.push('Publish time is too old (>24h)');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide un tableau de price feed IDs
   */
  static validatePriceIds(priceIds) {
    if (!Array.isArray(priceIds)) {
      return { valid: false, errors: ['Price IDs must be an array'] };
    }
    
    const errors = [];
    
    priceIds.forEach((id, index) => {
      if (!PythDataUtils.isValidPriceId(id)) {
        errors.push(`Invalid price ID at index ${index}: ${id}`);
      }
    });
    
    if (priceIds.length > PYTH_CONFIG.MAX_BATCH_SIZE) {
      errors.push(`Too many price IDs: ${priceIds.length}, max is ${PYTH_CONFIG.MAX_BATCH_SIZE}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide des données de mise à jour
   */
  static validateUpdateData(updateData) {
    if (!Array.isArray(updateData)) {
      return { valid: false, errors: ['Update data must be an array'] };
    }
    
    const errors = [];
    
    updateData.forEach((data, index) => {
      if (typeof data !== 'string') {
        errors.push(`Update data at index ${index} must be a string`);
        return;
      }
      
      if (!data.startsWith('0x')) {
        errors.push(`Update data at index ${index} must start with 0x`);
        return;
      }
      
      if (data.length < 10) { // Minimum viable length
        errors.push(`Update data at index ${index} is too short`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Helper pour construire les appels de contrat Pyth
 */
export class PythContractHelper {
  constructor(contractAddress, publicClient) {
    this.contractAddress = contractAddress;
    this.publicClient = publicClient;
  }

  /**
   * Appel sécurisé à getPrice avec validation
   */
  async getPrice(priceId, options = {}) {
    try {
      // Valider l'ID
      if (!PythDataUtils.isValidPriceId(priceId)) {
        throw new Error(`Invalid price ID: ${priceId}`);
      }

      const formattedPriceId = PythDataUtils.toPriceId(priceId);
      
      const rawPrice = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: PYTH_ABI,
        functionName: 'getPrice',
        args: [formattedPriceId],
        ...options
      });

      // Valider la réponse
      const validation = PythValidator.validatePriceStruct(rawPrice);
      if (!validation.valid) {
        throw new Error(`Invalid price data: ${validation.errors.join(', ')}`);
      }

      return PythDataUtils.formatPrice(rawPrice);

    } catch (error) {
      const parsedError = PythErrorHandler.parseError(error);
      throw new Error(`getPrice failed: ${parsedError.message}`);
    }
  }

  /**
   * Appel sécurisé à getPriceNoOlderThan
   */
  async getPriceNoOlderThan(priceId, maxAge = PYTH_CONFIG.DEFAULT_MAX_AGE, options = {}) {
    try {
      if (!PythDataUtils.isValidPriceId(priceId)) {
        throw new Error(`Invalid price ID: ${priceId}`);
      }

      const formattedPriceId = PythDataUtils.toPriceId(priceId);
      
      const rawPrice = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: PYTH_ABI,
        functionName: 'getPriceNoOlderThan',
        args: [formattedPriceId, BigInt(maxAge)],
        ...options
      });

      const validation = PythValidator.validatePriceStruct(rawPrice);
      if (!validation.valid) {
        throw new Error(`Invalid price data: ${validation.errors.join(', ')}`);
      }

      return PythDataUtils.formatPrice(rawPrice);

    } catch (error) {
      const parsedError = PythErrorHandler.parseError(error);
      throw new Error(`getPriceNoOlderThan failed: ${parsedError.message}`);
    }
  }

  /**
   * Récupère les frais de mise à jour
   */
  async getUpdateFee(updateData, options = {}) {
    try {
      const validation = PythValidator.validateUpdateData(updateData);
      if (!validation.valid) {
        throw new Error(`Invalid update data: ${validation.errors.join(', ')}`);
      }

      const fee = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: PYTH_ABI,
        functionName: 'getUpdateFee',
        args: [updateData],
        ...options
      });

      return fee;

    } catch (error) {
      const parsedError = PythErrorHandler.parseError(error);
      throw new Error(`getUpdateFee failed: ${parsedError.message}`);
    }
  }

  /**
   * Récupère la période de validité
   */
  async getValidTimePeriod(options = {}) {
    try {
      const period = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: PYTH_ABI,
        functionName: 'getValidTimePeriod',
        args: [],
        ...options
      });

      return Number(period);

    } catch (error) {
      const parsedError = PythErrorHandler.parseError(error);
      throw new Error(`getValidTimePeriod failed: ${parsedError.message}`);
    }
  }
}

// Export par défaut
export default {
  PYTH_ABI,
  PYTH_PRICE_STRUCT,
  PYTH_ERRORS,
  PYTH_ERROR_MESSAGES,
  PYTH_CONFIG,
  PythDataUtils,
  PythErrorHandler,
  PythValidator,
  PythContractHelper
};