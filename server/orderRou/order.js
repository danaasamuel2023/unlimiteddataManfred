const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { User, DataPurchase, Transaction, DataInventory } = require('../schema/schema');
const dotenv = require('dotenv');

dotenv.config();

// ========== DATAMART API CONFIGURATION ==========
const DATAMART_BASE_URL = 'https://api.datamartgh.shop';
const DATAMART_API_KEY = process.env.DATAMART_API_KEY || '3d9e75c8d1fd6ad6a0f52e340b5c325b864c50c72523fcc4452f506453515285';

// Create DataMart client
const datamartClient = axios.create({
  baseURL: DATAMART_BASE_URL,
  headers: {
    'x-api-key': DATAMART_API_KEY,
    'Content-Type': 'application/json'
  }
});

// ========== GEONETTECH API CONFIGURATION (KEPT FOR REFERENCE) ==========
const GEONETTECH_BASE_URL = 'https://testhub.geonettech.site/api/v1';
const GEONETTECH_API_KEY = '42|tjhxBxaWWe4mPUpxXN1uIk0KTxypvlSqOIOQWz6K162aa0d6';

// Create Geonettech client (kept for potential future use)
const geonetClient = axios.create({
  baseURL: GEONETTECH_BASE_URL,
  headers: {
    'Authorization': `Bearer ${GEONETTECH_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// ========== TELECEL API CONFIGURATION ==========
const TELECEL_API_URL = 'https://iget.onrender.com/api/developer/orders/place';
const TELECEL_API_KEY = '76013fa9c8bf774ac7fb35db5e586fb7852a618cbf57b9ddb072fc2c465e5fe8';

// Enhanced logging function
const logOperation = (operation, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${operation}]`, JSON.stringify(data, null, 2));
};

// ========== NETWORK MAPPING FOR DATAMART ==========
const mapNetworkToDatamart = (networkType) => {
  const network = networkType.toUpperCase();
  
  const networkMap = {
    'TELECEL': 'TELECEL',
    'MTN': 'YELLO',
    'YELLO': 'YELLO',
    'AIRTEL': 'at',
    'AT': 'at',
    'AT_PREMIUM': 'at', // AT_PREMIUM maps to 'at' in DataMart
    'AIRTELTIGO': 'at',
    'TIGO': 'at'
  };
  
  return networkMap[network] || network.toLowerCase();
};

// ===== OFFICIAL PRICING STRUCTURES =====
const OFFICIAL_PRICING = {
  'YELLO': { // MTN pricing structure
    '1': 4.50,
    '2': 9.20,
    '3': 13.50,
    '4': 18.50,
    '5': 24.50,
    '6': 28.00,
    '8': 38.50,
    '10': 46.50,
    '15': 66.50,
    '20': 88.00,
    '25': 112.00,
    '30': 137.00,
    '40': 169.00,
    '50': 210.00,
    '100': 420.00
  },
  'at': { // AirtelTigo pricing structure
    '1': 3.95,
    '2': 8.35,
    '3': 13.25,
    '4': 16.50,
    '5': 19.50,
    '6': 23.50,
    '8': 30.50,
    '10': 38.50,
    '12': 45.50,
    '15': 57.50,
    '25': 95.00,
    '30': 115.00,
    '40': 151.00,
    '50': 190.00
  },
  'AT_PREMIUM': { // AirtelTigo Premium pricing structure (same as regular AT)
    '1': 3.95,
    '2': 8.35,
    '3': 13.25,
    '4': 16.50,
    '5': 19.50,
    '6': 23.50,
    '8': 30.50,
    '10': 38.50,
    '12': 45.50,
    '15': 57.50,
    '25': 95.00,
    '30': 115.00,
    '40': 151.00,
    '50': 190.00
  },
  'TELECEL': { // Telecel pricing structure
    '5': 19.50,
    '8': 34.64,
    '10': 37.50,
    '12': 44.70,
    '15': 55.85,
    '20': 72.80,
    '25': 89.75,
    '30': 109.70,
    '35': 129.65,
    '40': 139.60,
    '45': 159.55,
    '50': 179.50,
    '100': 349.00
  }
};

// ===== PRICE VALIDATION FUNCTION =====
const validatePrice = (network, capacity, submittedPrice, userId, phoneNumber) => {
  const capacityStr = capacity.toString();
  
  if (!OFFICIAL_PRICING[network]) {
    logOperation('PRICE_VALIDATION_INVALID_NETWORK', {
      network,
      availableNetworks: Object.keys(OFFICIAL_PRICING),
      userId
    });
    return {
      isValid: false,
      message: 'Invalid network selected',
      code: 'INVALID_NETWORK'
    };
  }

  const officialPrice = OFFICIAL_PRICING[network][capacityStr];
  
  if (officialPrice === undefined) {
    logOperation('PRICE_VALIDATION_INVALID_CAPACITY', {
      network,
      capacity: capacityStr,
      availableCapacities: Object.keys(OFFICIAL_PRICING[network]),
      userId
    });
    return {
      isValid: false,
      message: `Invalid data capacity for ${network}. Available options: ${Object.keys(OFFICIAL_PRICING[network]).join(', ')}GB`,
      code: 'INVALID_CAPACITY'
    };
  }

  const submittedPriceFloat = parseFloat(submittedPrice);
  const tolerance = 0.01;
  
  if (Math.abs(submittedPriceFloat - officialPrice) > tolerance) {
    logOperation('PRICE_VALIDATION_MISMATCH', {
      network,
      capacity: capacityStr,
      submittedPrice: submittedPriceFloat,
      officialPrice,
      difference: Math.abs(submittedPriceFloat - officialPrice),
      userId,
      phoneNumber: phoneNumber.substring(0, 3) + 'XXXXXXX'
    });
    return {
      isValid: false,
      message: 'Invalid price. Please refresh the page and try again.',
      code: 'PRICE_MISMATCH'
    };
  }

  logOperation('PRICE_VALIDATION_SUCCESS', {
    network,
    capacity: capacityStr,
    validatedPrice: officialPrice,
    submittedPrice: submittedPriceFloat,
    userId
  });

  return {
    isValid: true,
    validatedPrice: officialPrice,
    message: 'Price validation successful'
  };
};

// ===== PHONE NUMBER VALIDATION FUNCTION =====
const validatePhoneNumber = (network, phoneNumber) => {
  const cleanNumber = phoneNumber.replace(/[\s-]/g, '');
  
  switch (network) {
    case 'YELLO': // MTN validation
      const mtnPrefixes = ['024', '054', '055', '059', '026', '025', '053', '027', '057', '023', '020', '050'];
      if (cleanNumber.length === 10 && cleanNumber.startsWith('0')) {
        const prefix = cleanNumber.substring(0, 3);
        if (mtnPrefixes.includes(prefix)) {
          return { isValid: true, message: '' };
        } else {
          return { isValid: false, message: 'Please enter a valid MTN number' };
        }
      } else {
        return { isValid: false, message: 'Please enter a valid 10-digit MTN number starting with 0' };
      }
      
    case 'at': // AirtelTigo validation
    case 'AT_PREMIUM': // AirtelTigo Premium uses same prefixes
      const airtelTigoPrefixes = ['026', '056', '027', '057', '023', '053'];
      if (cleanNumber.length === 10 && cleanNumber.startsWith('0')) {
        const prefix = cleanNumber.substring(0, 3);
        if (airtelTigoPrefixes.includes(prefix)) {
          return { isValid: true, message: '' };
        } else {
          return { isValid: false, message: 'Please enter a valid AirtelTigo number (026, 056, 027, 057, 023, 053)' };
        }
      } else {
        return { isValid: false, message: 'Please enter a valid 10-digit AirtelTigo number' };
      }
      
    case 'TELECEL': // Telecel validation
      const telecelPrefixes = ['020', '050'];
      if (cleanNumber.length === 10 && cleanNumber.startsWith('0')) {
        const prefix = cleanNumber.substring(0, 3);
        if (telecelPrefixes.includes(prefix)) {
          return { isValid: true, message: '' };
        } else {
          return { isValid: false, message: 'Please enter a valid Telecel number (020, 050)' };
        }
      } else {
        return { isValid: false, message: 'Please enter a valid 10-digit Telecel number' };
      }
      
    default:
      return { isValid: false, message: 'Unsupported network' };
  }
};

// Generate mixed reference function
function generateMixedReference(prefix = '') {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let reference = prefix;
  
  // Add 2 random letters
  for (let i = 0; i < 2; i++) {
    reference += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // Add 4 random numbers
  for (let i = 0; i < 4; i++) {
    reference += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  // Add 2 more random letters
  for (let i = 0; i < 2; i++) {
    reference += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  return reference;
}

// Helper function for Telecel API integration
async function processTelecelOrder(recipient, capacity, reference) {
  try {
    const capacityInMB = capacity >= 1 && capacity < 1000 ? capacity * 1000 : capacity;
    
    logOperation('TELECEL_ORDER_REQUEST_PREPARED', {
      recipient,
      capacityGB: capacity,
      capacityMB: capacityInMB,
      reference
    });
    
    const telecelPayload = {
      recipientNumber: recipient,
      capacity: capacity,
      bundleType: "Telecel-5959",
      reference: reference,
    };
    
    logOperation('TELECEL_ORDER_REQUEST', telecelPayload);
    
    const response = await axios.post(
      TELECEL_API_URL,
      telecelPayload,
      { 
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': TELECEL_API_KEY
        } 
      }
    );
    
    logOperation('TELECEL_ORDER_RESPONSE', {
      status: response.status,
      data: response.data,
      fullResponse: JSON.stringify(response.data, null, 2)
    });
    
    // Extract the Telecel order reference from the response
    let telecelOrderReference = null;
    
    if (response.data?.data?.order?.orderReference) {
      telecelOrderReference = response.data.data.order.orderReference;
    } else if (response.data?.data?.orderReference) {
      telecelOrderReference = response.data.data.orderReference;
    } else if (response.data?.orderReference) {
      telecelOrderReference = response.data.orderReference;
    } else if (response.data?.data?.reference) {
      telecelOrderReference = response.data.data.reference;
    } else if (response.data?.reference) {
      telecelOrderReference = response.data.reference;
    } else if (response.data?.data?.order?.id) {
      telecelOrderReference = response.data.data.order.id;
    } else if (response.data?.data?.id) {
      telecelOrderReference = response.data.data.id;
    }
    
    logOperation('TELECEL_ORDER_REFERENCE_EXTRACTED', {
      telecelOrderReference,
      originalReference: reference
    });
    
    return {
      success: true,
      data: response.data,
      orderId: telecelOrderReference || reference,
      telecelReference: telecelOrderReference
    };
  } catch (error) {
    logOperation('TELECEL_ORDER_ERROR', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    return {
      success: false,
      error: {
        message: error.message,
        details: error.response?.data || 'No response details available'
      }
    };
  }
}

// Function to check Telecel order status
async function checkTelecelOrderStatus(reference) {
  try {
    logOperation('TELECEL_STATUS_CHECK_REQUEST', { reference });
    
    const response = await axios.get(
      `https://iget.onrender.com/api/developer/orders/reference/${reference}`,
      { 
        headers: { 
          'X-API-Key': TELECEL_API_KEY
        } 
      }
    );
    
    logOperation('TELECEL_STATUS_CHECK_RESPONSE', response.data);
    
    return {
      success: true,
      data: response.data.data,
      status: response.data.data?.order?.status || 'processing'
    };
  } catch (error) {
    logOperation('TELECEL_STATUS_CHECK_ERROR', {
      message: error.message,
      response: error.response ? error.response.data : null
    });
    
    return {
      success: false,
      error: {
        message: error.message,
        details: error.response?.data || 'No response details available'
      }
    };
  }
}

// Check Agent Wallet Balance (DataMart)
router.get('/agent-balance', async (req, res) => {
  try {
    logOperation('AGENT_BALANCE_REQUEST', { timestamp: new Date() });
    
    // Use DataMart API to check balance
    const response = await datamartClient.get('/api/agent-balance');
    
    logOperation('DATAMART_AGENT_BALANCE_RESPONSE', {
      status: response.status,
      data: response.data
    });
    
    res.json({
      status: 'success',
      data: {
        balance: response.data.data?.balance || 0
      }
    });
  } catch (error) {
    logOperation('AGENT_BALANCE_ERROR', {
      message: error.message,
      response: error.response ? error.response.data : null,
      stack: error.stack
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch agent balance',
      details: error.response ? error.response.data : error.message
    });
  }
});

// ===== MAIN PURCHASE DATA ROUTE WITH DATAMART INTEGRATION =====
router.post('/purchase-data', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      userId, 
      phoneNumber, 
      network, 
      capacity, 
      price 
    } = req.body;

    logOperation('DATA_PURCHASE_REQUEST', {
      userId,
      phoneNumber: phoneNumber?.substring(0, 3) + 'XXXXXXX',
      network,
      capacity,
      price,
      timestamp: new Date()
    });

    // Validate inputs
    if (!userId || !phoneNumber || !network || !capacity || !price) {
      logOperation('DATA_PURCHASE_VALIDATION_ERROR', {
        missingFields: {
          userId: !userId,
          phoneNumber: !phoneNumber,
          network: !network,
          capacity: !capacity,
          price: !price
        }
      });
      
      await session.abortTransaction();
      session.endSession();
      
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // ===== PRICE VALIDATION =====
    const priceValidation = validatePrice(network, capacity, price, userId, phoneNumber);
    if (!priceValidation.isValid) {
      await session.abortTransaction();
      session.endSession();
      
      return res.status(400).json({
        status: 'error',
        message: priceValidation.message,
        code: priceValidation.code
      });
    }

    // ===== PHONE NUMBER VALIDATION =====
    const phoneValidation = validatePhoneNumber(network, phoneNumber);
    if (!phoneValidation.isValid) {
      logOperation('PHONE_VALIDATION_FAILED', {
        network,
        phoneNumber: phoneNumber.substring(0, 3) + 'XXXXXXX',
        validationMessage: phoneValidation.message
      });
      
      await session.abortTransaction();
      session.endSession();
      
      return res.status(400).json({
        status: 'error',
        message: phoneValidation.message
      });
    }

    // Find user
    const user = await User.findById(userId).session(session);
    if (!user) {
      logOperation('DATA_PURCHASE_USER_NOT_FOUND', { userId });
      
      await session.abortTransaction();
      session.endSession();
      
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const validatedPrice = priceValidation.validatedPrice;

    // Check user wallet balance
    if (user.walletBalance < validatedPrice) {
      logOperation('DATA_PURCHASE_INSUFFICIENT_BALANCE', {
        userId,
        walletBalance: user.walletBalance,
        requiredAmount: validatedPrice,
        shortfall: validatedPrice - user.walletBalance
      });
      
      await session.abortTransaction();
      session.endSession();
      
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient wallet balance',
        currentBalance: user.walletBalance,
        requiredAmount: validatedPrice
      });
    }

    // Get the inventory record
    const inventory = await DataInventory.findOne({ network }).session(session);
    
    logOperation('DATA_INVENTORY_CHECK', {
      network,
      inventoryFound: !!inventory,
      inStock: inventory ? inventory.inStock : true,
      skipGeonettech: inventory ? inventory.skipGeonettech : false
    });
    
    // Check if in stock
    if (inventory && !inventory.inStock) {
      logOperation('DATA_INVENTORY_OUT_OF_STOCK', {
        network,
        inventoryExists: !!inventory
      });
      
      await session.abortTransaction();
      session.endSession();
      
      return res.status(400).json({
        status: 'error',
        message: `${network} data bundles are currently out of stock. Please try again later or choose another network.`
      });
    }
    
    // Generate unique references
    const transactionReference = `TRX-${uuidv4()}`;
    
    // Determine order reference prefix based on network and processing method
    let orderReferencePrefix = '';
    const shouldSkipGeonet = inventory?.skipGeonettech && network !== 'TELECEL' && network !== 'AT_PREMIUM';
    
    if (network === 'TELECEL') {
      // For Telecel, check if we're using DataMart or Telecel API
      if (inventory?.skipGeonettech) {
        orderReferencePrefix = 'TC-'; // Direct Telecel API prefix
      } else {
        orderReferencePrefix = 'DM-TC-'; // DataMart Telecel prefix
      }
    } else if (network === 'AT_PREMIUM') {
      orderReferencePrefix = 'DM-ATP-'; // DataMart AT_PREMIUM prefix
    } else if (shouldSkipGeonet) {
      orderReferencePrefix = 'MN-'; // Manual processing prefix
    } else {
      orderReferencePrefix = 'DM-'; // General DataMart prefix
    }
    
    let orderReference = generateMixedReference(orderReferencePrefix);
    const originalInternalReference = orderReference;

    // PROCESSING SECTION
    let orderResponse = null;
    let apiOrderId = null;
    let orderStatus = 'completed';
    let processingMethod = 'api';
    
    logOperation('API_PROCESSING_DECISION', {
      network,
      skipGeonettech: inventory?.skipGeonettech,
      shouldSkipGeonet,
      orderReference,
      prefix: orderReferencePrefix,
      isATPremium: network === 'AT_PREMIUM',
      isTelecel: network === 'TELECEL'
    });
    
    if (network === 'TELECEL') {
      // Check if we should use DataMart or Telecel API
      if (inventory?.skipGeonettech) {
        // Use Telecel API directly
        processingMethod = 'telecel_api';
        logOperation('USING_TELECEL_API', {
          network,
          phoneNumber: phoneNumber.substring(0, 3) + 'XXXXXXX',
          capacity,
          orderReference
        });
        
        try {
          const telecelResponse = await processTelecelOrder(phoneNumber, capacity, orderReference);
          
          if (!telecelResponse.success) {
            logOperation('TELECEL_API_ERROR', {
              error: telecelResponse.error,
              orderReference
            });
            
            await session.abortTransaction();
            session.endSession();
            
            let errorMessage = 'Could not complete your purchase. Please try again later.';
            
            if (telecelResponse.error && telecelResponse.error.message) {
              errorMessage = telecelResponse.error.message;
            }
            
            if (telecelResponse.error && telecelResponse.error.details && 
                typeof telecelResponse.error.details === 'object' && 
                telecelResponse.error.details.message) {
              errorMessage = telecelResponse.error.details.message;
            }
            
            return res.status(400).json({
              status: 'error',
              message: errorMessage
            });
          }
          
          orderResponse = telecelResponse.data;
          orderStatus = 'completed';
          
          if (telecelResponse.telecelReference) {
            apiOrderId = telecelResponse.telecelReference;
            orderReference = telecelResponse.telecelReference;
            
            logOperation('TELECEL_REFERENCE_UPDATE', {
              originalReference: originalInternalReference,
              telecelReference: telecelResponse.telecelReference,
              finalReference: orderReference
            });
          } else {
            apiOrderId = orderReference;
            logOperation('TELECEL_NO_REFERENCE_RETURNED', {
              usingOriginalReference: orderReference
            });
          }
          
          logOperation('TELECEL_ORDER_SUCCESS', {
            orderId: apiOrderId,
            orderReference: orderReference,
            telecelReference: telecelResponse.telecelReference,
            originalInternalReference: originalInternalReference,
            processingMethod
          });
        } catch (telecelError) {
          logOperation('TELECEL_API_EXCEPTION', {
            error: telecelError.message,
            stack: telecelError.stack,
            orderReference
          });
          
          await session.abortTransaction();
          session.endSession();
          
          return res.status(400).json({
            status: 'error',
            message: 'Unable to process your order. Please try again later.'
          });
        }
      } else {
        // Use DataMart API for Telecel
        processingMethod = 'datamart_api';
        try {
          const datamartNetwork = mapNetworkToDatamart('TELECEL');
          const datamartPayload = {
            phoneNumber: phoneNumber,
            network: datamartNetwork,
            capacity: capacity.toString(),
            gateway: 'wallet',
            ref: orderReference
          };
          
          logOperation('DATAMART_TELECEL_ORDER_REQUEST', {
            ...datamartPayload,
            processingMethod
          });
          
          const datamartResponse = await datamartClient.post('/api/developer/purchase', datamartPayload);
          orderResponse = datamartResponse.data;
          
          if (!orderResponse || !orderResponse.status || orderResponse.status !== 'success') {
            logOperation('DATAMART_TELECEL_API_UNSUCCESSFUL_RESPONSE', {
              response: orderResponse,
              orderReference
            });
            
            await session.abortTransaction();
            session.endSession();
            
            let errorMessage = 'Could not complete your purchase. Please try again later.';
            
            if (orderResponse && orderResponse.message) {
              const msg = orderResponse.message.toLowerCase();
              
              if (msg.includes('duplicate') || msg.includes('within 5 minutes')) {
                errorMessage = 'A similar order was recently placed. Please wait a few minutes before trying again.';
              } else if (msg.includes('invalid') || msg.includes('phone')) {
                errorMessage = 'The phone number you entered appears to be invalid. Please check and try again.';
              } else {
                errorMessage = orderResponse.message;
              }
            }
            
            return res.status(400).json({
              status: 'error',
              message: errorMessage
            });
          }
          
          apiOrderId = orderResponse.data ? orderResponse.data.purchaseId : orderReference;
          orderStatus = 'completed';
          
          logOperation('DATAMART_TELECEL_ORDER_SUCCESS', {
            orderId: apiOrderId,
            orderReference,
            processingMethod,
            responseData: orderResponse
          });
        } catch (apiError) {
          logOperation('DATAMART_TELECEL_API_ERROR', {
            error: apiError.message,
            response: apiError.response ? apiError.response.data : null,
            orderReference
          });
          
          await session.abortTransaction();
          session.endSession();
          
          let errorMessage = 'Could not complete your purchase. Please try again later.';
          
          if (apiError.response && apiError.response.data && apiError.response.data.message) {
            errorMessage = apiError.response.data.message;
          }
          
          return res.status(400).json({
            status: 'error',
            message: errorMessage
          });
        }
      }
    } else if (network === 'AT_PREMIUM') {
      // AT_PREMIUM always uses DataMart API
      processingMethod = 'datamart_api';
      try {
        const datamartNetwork = mapNetworkToDatamart('AT_PREMIUM'); // Maps to 'at'
        const datamartPayload = {
          phoneNumber: phoneNumber,
          network: datamartNetwork,
          capacity: capacity.toString(),
          gateway: 'wallet',
          ref: orderReference
        };
        
        logOperation('DATAMART_AT_PREMIUM_ORDER_REQUEST', {
          ...datamartPayload,
          processingMethod
        });
        
        const datamartResponse = await datamartClient.post('/api/developer/purchase', datamartPayload);
        orderResponse = datamartResponse.data;
        
        if (!orderResponse || !orderResponse.status || orderResponse.status !== 'success') {
          logOperation('DATAMART_AT_PREMIUM_API_UNSUCCESSFUL_RESPONSE', {
            response: orderResponse,
            orderReference
          });
          
          await session.abortTransaction();
          session.endSession();
          
          let errorMessage = 'Could not complete your purchase. Please try again later.';
          
          if (orderResponse && orderResponse.message) {
            const msg = orderResponse.message.toLowerCase();
            
            if (msg.includes('duplicate') || msg.includes('within 5 minutes')) {
              errorMessage = 'A similar order was recently placed. Please wait a few minutes before trying again.';
            } else if (msg.includes('invalid') || msg.includes('phone')) {
              errorMessage = 'The phone number you entered appears to be invalid. Please check and try again.';
            } else {
              errorMessage = orderResponse.message;
            }
          }
          
          return res.status(400).json({
            status: 'error',
            message: errorMessage
          });
        }
        
        apiOrderId = orderResponse.data ? orderResponse.data.purchaseId : orderReference;
        orderStatus = 'completed';
        
        logOperation('DATAMART_AT_PREMIUM_ORDER_SUCCESS', {
          orderId: apiOrderId,
          orderReference,
          processingMethod,
          responseData: orderResponse
        });
      } catch (apiError) {
        logOperation('DATAMART_AT_PREMIUM_API_ERROR', {
          error: apiError.message,
          response: apiError.response ? apiError.response.data : null,
          orderReference
        });
        
        await session.abortTransaction();
        session.endSession();
        
        let errorMessage = 'Could not complete your purchase. Please try again later.';
        
        if (apiError.response && apiError.response.data && apiError.response.data.message) {
          errorMessage = apiError.response.data.message;
        }
        
        return res.status(400).json({
          status: 'error',
          message: errorMessage
        });
      }
    } else if (shouldSkipGeonet) {
      // Skip DataMart API - store as pending for manual processing
      processingMethod = 'manual';
      logOperation('SKIPPING_DATAMART_API', {
        network,
        phoneNumber: phoneNumber.substring(0, 3) + 'XXXXXXX',
        capacity,
        orderReference,
        processingMethod
      });
      
      orderStatus = 'pending';
      apiOrderId = orderReference;
      orderResponse = {
        status: 'pending',
        message: 'Order stored for manual processing',
        reference: orderReference,
        processingMethod: 'manual',
        skipReason: 'API disabled for network'
      };
    } else {
      // Use DataMart API for other networks (YELLO, at)
      processingMethod = 'datamart_api';
      try {
        const datamartNetwork = mapNetworkToDatamart(network);
        const datamartPayload = {
          phoneNumber: phoneNumber,
          network: datamartNetwork,
          capacity: capacity.toString(),
          gateway: 'wallet',
          ref: orderReference
        };
        
        logOperation('DATAMART_ORDER_REQUEST', {
          ...datamartPayload,
          processingMethod
        });
        
        const datamartResponse = await datamartClient.post('/api/developer/purchase', datamartPayload);
        orderResponse = datamartResponse.data;
        
        if (!orderResponse || !orderResponse.status || orderResponse.status !== 'success') {
          logOperation('DATAMART_API_UNSUCCESSFUL_RESPONSE', {
            response: orderResponse,
            orderReference
          });
          
          await session.abortTransaction();
          session.endSession();
          
          let errorMessage = 'Could not complete your purchase. Please try again later.';
          
          if (orderResponse && orderResponse.message) {
            const msg = orderResponse.message.toLowerCase();
            
            if (msg.includes('duplicate') || msg.includes('within 5 minutes')) {
              errorMessage = 'A similar order was recently placed. Please wait a few minutes before trying again.';
            } else if (msg.includes('invalid') || msg.includes('phone')) {
              errorMessage = 'The phone number you entered appears to be invalid. Please check and try again.';
            } else {
              errorMessage = orderResponse.message;
            }
          }
          
          return res.status(400).json({
            status: 'error',
            message: errorMessage
          });
        }
        
        apiOrderId = orderResponse.data ? orderResponse.data.purchaseId : orderReference;
        orderStatus = 'completed';
        
        logOperation('DATAMART_ORDER_SUCCESS', {
          orderId: apiOrderId,
          orderReference,
          processingMethod,
          responseData: orderResponse
        });
      } catch (apiError) {
        logOperation('DATAMART_API_ERROR', {
          error: apiError.message,
          response: apiError.response ? apiError.response.data : null,
          orderReference
        });
        
        await session.abortTransaction();
        session.endSession();
        
        let errorMessage = 'Could not complete your purchase. Please try again later.';
        
        if (apiError.response && apiError.response.data && apiError.response.data.message) {
          errorMessage = apiError.response.data.message;
        }
        
        return res.status(400).json({
          status: 'error',
          message: errorMessage
        });
      }
    }

    // Create Transaction
    const transaction = new Transaction({
      userId,
      type: 'purchase',
      amount: validatedPrice,
      status: 'completed',
      reference: transactionReference,
      gateway: 'wallet',
      description: `Data purchase: ${capacity}GB ${network} for ${phoneNumber}`
    });

    // Create Data Purchase
    const dataPurchase = new DataPurchase({
      userId,
      phoneNumber,
      network,
      capacity,
      gateway: 'wallet',
      method: 'web',
      price: validatedPrice,
      status: orderStatus,
      geonetReference: orderReference, // Keep this field name for backward compatibility
      apiOrderId: apiOrderId,
      apiResponse: orderResponse,
      skipGeonettech: shouldSkipGeonet,
      processingMethod: processingMethod,
      orderReferencePrefix: orderReferencePrefix,
      originalReference: (network === 'TELECEL' && inventory?.skipGeonettech) ? originalInternalReference : null
    });

    // Update user wallet
    const previousBalance = user.walletBalance;
    user.walletBalance -= validatedPrice;

    // Link transaction to purchase
    transaction.relatedPurchaseId = dataPurchase._id;

    // Save all documents
    await transaction.save({ session });
    await dataPurchase.save({ session });
    await user.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Prepare response message
    let responseMessage = 'Data bundle purchased successfully';
    if (orderStatus === 'pending' && processingMethod === 'manual') {
      responseMessage = 'Order placed successfully. Your order will be processed manually.';
    }

    logOperation('DATA_PURCHASE_SUCCESS', {
      userId,
      orderStatus,
      orderReference,
      processingMethod,
      skipGeonettech: shouldSkipGeonet,
      previousBalance: previousBalance,
      newWalletBalance: user.walletBalance,
      amountDeducted: validatedPrice,
      validatedPrice: validatedPrice,
      telecelReference: (network === 'TELECEL' && inventory?.skipGeonettech) ? orderReference : null,
      originalInternalReference: (network === 'TELECEL' && inventory?.skipGeonettech) ? originalInternalReference : null,
      isATPremium: network === 'AT_PREMIUM',
      usedDatamart: processingMethod === 'datamart_api',
      usedTelecelAPI: processingMethod === 'telecel_api'
    });

    res.status(201).json({
      status: 'success',
      message: responseMessage,
      data: {
        transaction,
        dataPurchase,
        walletBalance: {
          previous: previousBalance,
          current: user.walletBalance,
          deducted: validatedPrice
        },
        orderStatus: orderStatus,
        orderReference: orderReference,
        processingMethod: processingMethod,
        orderPrefix: orderReferencePrefix,
        validatedPrice: validatedPrice,
        usedDatamart: processingMethod === 'datamart_api',
        usedTelecelAPI: processingMethod === 'telecel_api'
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    logOperation('DATA_PURCHASE_ERROR', {
      message: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : null
    });

    res.status(500).json({
      status: 'error',
      message: 'Could not complete your purchase. Please try again later.'
    });
  }
});

// Check Order Status (Updated to handle DataMart API)
router.get('/order-status/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    logOperation('ORDER_STATUS_CHECK_REQUEST', { 
      orderId,
      timestamp: new Date() 
    });

    // Find local order
    const localOrder = await DataPurchase.findOne({ 
      orderId: orderId 
    });

    if (!localOrder) {
      logOperation('ORDER_STATUS_CHECK_NOT_FOUND', { orderId });
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    logOperation('ORDER_STATUS_LOCAL_ORDER_FOUND', {
      orderId,
      localStatus: localOrder.status,
      geonetReference: localOrder.geonetReference,
      network: localOrder.network,
      processingMethod: localOrder.processingMethod
    });

    // Check status based on network and processing method
    if (localOrder.network === 'TELECEL' && localOrder.processingMethod === 'telecel_api') {
      // Check status with Telecel API
      logOperation('TELECEL_STATUS_CHECK_REQUEST', {
        geonetReference: localOrder.geonetReference
      });
      
      const telecelStatusResponse = await checkTelecelOrderStatus(localOrder.geonetReference);
      
      if (telecelStatusResponse.success) {
        // Update local order status if needed
        const apiStatus = telecelStatusResponse.status;
        if (apiStatus && localOrder.status !== apiStatus) {
          logOperation('ORDER_STATUS_UPDATE_REQUIRED', {
            oldStatus: localOrder.status,
            newStatus: apiStatus
          });
          
          localOrder.status = apiStatus;
          await localOrder.save();
          
          logOperation('ORDER_STATUS_UPDATE_COMPLETED', {
            orderId,
            status: localOrder.status
          });
        }
        
        res.json({
          status: 'success',
          data: {
            localOrder,
            apiStatus: telecelStatusResponse.data
          }
        });
      } else {
        res.json({
          status: 'success',
          data: {
            localOrder,
            apiStatus: null,
            apiError: telecelStatusResponse.error
          }
        });
      }
    } else if (localOrder.processingMethod === 'manual') {
      // For manual processing, just return the local status
      res.json({
        status: 'success',
        data: {
          localOrder,
          manualProcessing: true
        }
      });
    } else if (localOrder.processingMethod === 'datamart_api') {
      // Check status with DataMart
      logOperation('DATAMART_STATUS_CHECK_REQUEST', {
        purchaseId: localOrder.apiOrderId
      });
      
      try {
        const datamartResponse = await datamartClient.get(`/api/purchase-status/${localOrder.apiOrderId}`);
        
        logOperation('DATAMART_STATUS_CHECK_RESPONSE', {
          status: datamartResponse.status,
          data: datamartResponse.data
        });
        
        // Update local order status if needed
        if (datamartResponse.data.status === 'completed' && 
            localOrder.status !== 'completed') {
          
          logOperation('ORDER_STATUS_UPDATE_REQUIRED', {
            oldStatus: localOrder.status,
            newStatus: 'completed'
          });
          
          localOrder.status = 'completed';
          await localOrder.save();
          
          logOperation('ORDER_STATUS_UPDATE_COMPLETED', {
            orderId,
            status: localOrder.status
          });
        }

        res.json({
          status: 'success',
          data: {
            localOrder,
            datamartStatus: datamartResponse.data
          }
        });
      } catch (datamartError) {
        logOperation('DATAMART_STATUS_CHECK_ERROR', {
          error: datamartError.message
        });
        
        res.json({
          status: 'success',
          data: {
            localOrder,
            datamartStatus: null,
            datamartError: datamartError.message
          }
        });
      }
    } else {
      // For any other case, return local status
      res.json({
        status: 'success',
        data: {
          localOrder
        }
      });
    }

  } catch (error) {
    logOperation('ORDER_STATUS_CHECK_ERROR', {
      message: error.message,
      response: error.response ? error.response.data : null,
      stack: error.stack
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to check order status',
      details: error.response ? error.response.data : error.message
    });
  }
});

// Get available data packages from DataMart
router.get('/data-packages', async (req, res) => {
  try {
    const { network } = req.query;
    
    // Map to DataMart network code if provided
    const datamartNetwork = network ? mapNetworkToDatamart(network) : null;
    
    logOperation('DATAMART_PACKAGES_REQUEST', {
      network: network,
      datamartNetwork: datamartNetwork
    });
    
    // Get packages from DataMart
    const response = await datamartClient.get('/api/data-packages', {
      params: datamartNetwork ? { network: datamartNetwork } : {}
    });
    
    logOperation('DATAMART_PACKAGES_RESPONSE', {
      packagesCount: response.data.data ? response.data.data.length : 0
    });
    
    res.json({
      status: 'success',
      data: response.data.data
    });
  } catch (error) {
    logOperation('DATAMART_PACKAGES_ERROR', {
      error: error.message,
      response: error.response?.data
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch data packages'
    });
  }
});

// Get User Data Purchase History
router.get('/purchase-history/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate, network } = req.query;
    const userId = req.params.userId;

    logOperation('PURCHASE_HISTORY_REQUEST', {
      userId,
      page,
      limit,
      startDate,
      endDate,
      network
    });

    // Prepare filter object
    const filter = { userId };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set time to end of day for end date
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateObj;
      }
    }
    
    // Add network filter if provided
    if (network && network !== 'All') {
      filter.network = network;
    }

    logOperation('PURCHASE_HISTORY_FILTER', filter);

    const purchases = await DataPurchase.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const total = await DataPurchase.countDocuments(filter);

    logOperation('PURCHASE_HISTORY_RESULTS', {
      totalFound: total,
      returnedCount: purchases.length,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit)
    });

    res.json({
      status: 'success',
      data: {
        purchases,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalPurchases: total
        }
      }
    });

  } catch (error) {
    logOperation('PURCHASE_HISTORY_ERROR', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch purchase history'
    });
  }
});

// Get User Transaction History for All Transactions Page
router.get('/user-transactions/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, network, phoneNumber } = req.query;
    const userId = req.params.userId;

    logOperation('USER_TRANSACTIONS_REQUEST', {
      userId,
      page,
      limit,
      startDate,
      endDate,
      network,
      phoneNumber
    });

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logOperation('USER_TRANSACTIONS_INVALID_ID', { userId });
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user ID'
      });
    }

    // Prepare filter object
    const filter = { userId };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set time to end of day for end date
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateObj;
      }
    }
    
    // Add network filter if provided
    if (network && network !== 'All') {
      filter.network = network;
    }
    
    // Add phone number search if provided
    if (phoneNumber) {
      filter.phoneNumber = { $regex: phoneNumber, $options: 'i' };
    }

    logOperation('USER_TRANSACTIONS_FILTER', filter);

    const transactions = await DataPurchase.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const totalCount = await DataPurchase.countDocuments(filter);

    logOperation('USER_TRANSACTIONS_RESULTS', {
      totalFound: totalCount,
      returnedCount: transactions.length,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit))
    });

    res.json({
      status: 'success',
      data: {
        transactions,
        totalCount,
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    });

  } catch (error) {
    logOperation('USER_TRANSACTIONS_ERROR', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user transactions',
      details: error.message
    });
  }
});

// Remaining routes stay the same...
// [Keep all other routes unchanged from the original file]
// Including: user-dashboard, sales-report, users-leaderboard, daily-sales

router.get('/user-dashboard/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    logOperation('USER_DASHBOARD_REQUEST', { userId });

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logOperation('USER_DASHBOARD_INVALID_ID', { userId });
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user ID'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      logOperation('USER_DASHBOARD_USER_NOT_FOUND', { userId });
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    logOperation('USER_DASHBOARD_USER_FOUND', {
      userId,
      walletBalance: user.walletBalance
    });

    // Get today's start and end
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    logOperation('USER_DASHBOARD_TODAY_ORDERS_QUERY', {
      userId,
      startDate: today,
      endDate: tomorrow
    });

    // Fetch today's orders
    const todayOrders = await DataPurchase.find({
      userId: userId,
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    }).sort({ createdAt: -1 });

    logOperation('USER_DASHBOARD_TODAY_ORDERS_FOUND', {
      count: todayOrders.length,
      orderIds: todayOrders.map(order => order._id)
    });

    // Calculate today's total order value
    const todayTotalOrderValue = todayOrders.reduce((total, order) => total + order.price, 0);
    
    // Calculate total GB sold today
    const totalGbSoldToday = todayOrders.reduce((total, order) => {
      // Convert MB to GB if necessary (assuming capacity is in MB)
      const gbValue = order.capacity >= 1000 ? order.capacity / 1000 : order.capacity;
      return total + gbValue;
    }, 0);

    // Format GB value to 2 decimal places
    const formattedGbSold = parseFloat(totalGbSoldToday.toFixed(2));

    logOperation('USER_DASHBOARD_CALCULATIONS', {
      totalOrderValue: todayTotalOrderValue,
      totalGbSold: formattedGbSold
    });

    // Prepare response
    res.json({
      status: 'success',
      data: {
        userBalance: user.walletBalance,
        todayOrders: {
          count: todayOrders.length,
          totalValue: todayTotalOrderValue,
          totalGbSold: formattedGbSold,
          amountSpentToday: todayTotalOrderValue,
          orders: todayOrders
        }
      }
    });

  } catch (error) {
    logOperation('USER_DASHBOARD_ERROR', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user dashboard information',
      details: error.message
    });
  }
});

// Get User Sales Report
router.get('/sales-report/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { 
      startDate, 
      endDate, 
      network, 
      format = 'json',
      groupBy = 'day' // Options: 'day', 'week', 'month'
    } = req.query;

    logOperation('SALES_REPORT_REQUEST', {
      userId,
      startDate,
      endDate,
      network,
      format,
      groupBy,
      timestamp: new Date()
    });

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logOperation('SALES_REPORT_INVALID_ID', { userId });
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user ID'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      logOperation('SALES_REPORT_USER_NOT_FOUND', { userId });
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Prepare date range
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set time to end of day for end date
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = endDateObj;
      }
    }

    // Prepare network filter
    const networkFilter = {};
    if (network && network !== 'All') {
      networkFilter.network = network;
    }

    // Combine all filters
    const filter = {
      userId,
      ...dateFilter,
      ...networkFilter
    };

    logOperation('SALES_REPORT_FILTER', filter);

    // Fetch all matching purchases
    const purchases = await DataPurchase.find(filter).sort({ createdAt: 1 });

    logOperation('SALES_REPORT_PURCHASES_FOUND', {
      count: purchases.length
    });

    // Generate summary metrics
    const totalSales = purchases.reduce((total, purchase) => total + purchase.price, 0);
    const totalOrders = purchases.length;
    const totalDataSold = purchases.reduce((total, purchase) => {
      // Convert capacity to GB if needed (assuming capacity is in MB)
      const gbValue = purchase.capacity >= 1000 ? purchase.capacity / 1000 : purchase.capacity;
      return total + gbValue;
    }, 0);

    // Group data according to the groupBy parameter
    let groupedData = [];
    
    if (groupBy === 'day') {
      // Group by day
      const grouped = {};
      
      purchases.forEach(purchase => {
        const date = new Date(purchase.createdAt);
        const day = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        if (!grouped[day]) {
          grouped[day] = {
            date: day,
            sales: 0,
            orders: 0,
            dataSold: 0
          };
        }
        
        grouped[day].sales += purchase.price;
        grouped[day].orders += 1;
        
        // Add data sold in GB
        const gbValue = purchase.capacity >= 1000 ? purchase.capacity / 1000 : purchase.capacity;
        grouped[day].dataSold += gbValue;
      });
      
      groupedData = Object.values(grouped);
      
    } else if (groupBy === 'week') {
      // Group by week (Sunday to Saturday)
      const grouped = {};
      
      purchases.forEach(purchase => {
        const date = new Date(purchase.createdAt);
        const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
        const sunday = new Date(date);
        sunday.setDate(date.getDate() - dayOfWeek);
        const weekStart = sunday.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        if (!grouped[weekStart]) {
          grouped[weekStart] = {
            weekStart,
            sales: 0,
            orders: 0,
            dataSold: 0
          };
        }
        
        grouped[weekStart].sales += purchase.price;
        grouped[weekStart].orders += 1;
        
        // Add data sold in GB
        const gbValue = purchase.capacity >= 1000 ? purchase.capacity / 1000 : purchase.capacity;
        grouped[weekStart].dataSold += gbValue;
      });
      
      groupedData = Object.values(grouped);
      
    } else if (groupBy === 'month') {
      // Group by month
      const grouped = {};
      
      purchases.forEach(purchase => {
        const date = new Date(purchase.createdAt);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM format
        
        if (!grouped[yearMonth]) {
          grouped[yearMonth] = {
            month: yearMonth,
            sales: 0,
            orders: 0,
            dataSold: 0
          };
        }
        
        grouped[yearMonth].sales += purchase.price;
        grouped[yearMonth].orders += 1;
        
        // Add data sold in GB
        const gbValue = purchase.capacity >= 1000 ? purchase.capacity / 1000 : purchase.capacity;
        grouped[yearMonth].dataSold += gbValue;
      });
      
      groupedData = Object.values(grouped);
    }

    // Calculate network distribution
    const networkDistribution = {};
    purchases.forEach(purchase => {
      if (!networkDistribution[purchase.network]) {
        networkDistribution[purchase.network] = {
          count: 0,
          revenue: 0,
          dataSold: 0
        };
      }
      
      networkDistribution[purchase.network].count += 1;
      networkDistribution[purchase.network].revenue += purchase.price;
      
      // Add data sold in GB
      const gbValue = purchase.capacity >= 1000 ? purchase.capacity / 1000 : purchase.capacity;
      networkDistribution[purchase.network].dataSold += gbValue;
    });

    // Format the response based on requested format
    if (format === 'csv') {
      // Generate CSV
      let csv = 'Date,Orders,Sales,Data Sold (GB)\n';
      
      groupedData.forEach(data => {
        const dateField = data.date || data.weekStart || data.month;
        csv += `${dateField},${data.orders},${data.sales.toFixed(2)},${data.dataSold.toFixed(2)}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=sales_report_${userId}_${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    } else {
      // Return JSON
      res.json({
        status: 'success',
        data: {
          summary: {
            totalSales,
            totalOrders,
            totalDataSold: parseFloat(totalDataSold.toFixed(2)),
            startDate: dateFilter.createdAt?.$gte || null,
            endDate: dateFilter.createdAt?.$lte || null,
            user: {
              id: user._id,
              name: user.name,
              email: user.email
            }
          },
          details: groupedData.map(item => ({
            ...item,
            sales: parseFloat(item.sales.toFixed(2)),
            dataSold: parseFloat(item.dataSold.toFixed(2))
          })),
          networkDistribution: Object.entries(networkDistribution).map(([network, data]) => ({
            network,
            count: data.count,
            revenue: parseFloat(data.revenue.toFixed(2)),
            dataSold: parseFloat(data.dataSold.toFixed(2)),
            percentage: parseFloat((data.count / totalOrders * 100).toFixed(2))
          }))
        }
      });
    }
  } catch (error) {
    logOperation('SALES_REPORT_ERROR', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate sales report',
      details: error.message
    });
  }
});

router.get('/users-leaderboard', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    logOperation('REALTIME_LEADERBOARD_REQUEST', {
      limit,
      timestamp: new Date()
    });

    // Get current timestamp for real-time reference
    const currentTime = new Date();
    
    // Aggregate pipeline for leaderboard
    const leaderboard = await DataPurchase.aggregate([
      // Group by userId
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$price' },
          lastOrderDate: { $max: '$createdAt' },
          // Store most recent orders (up to 5)
          recentOrders: { 
            $push: {
              createdAt: '$createdAt',
              price: '$price',
              phoneNumber: '$phoneNumber',
              network: '$network',
              capacity: '$capacity'
            }
          }
        }
      },
      // Sort primarily by order count (descending)
      {
        $sort: { 
          orderCount: -1,  // Primary sort: highest order count first
          lastOrderDate: -1  // Secondary sort: most recent orders first (for tiebreakers)
        }
      },
      // Limit to specified number of top users
      {
        $limit: parseInt(limit)
      },
      // Add user details
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      // Unwind the userDetails array
      {
        $unwind: '$userDetails'
      },
      // Sort the recent orders and limit to most recent 5
      {
        $addFields: {
          recentOrders: {
            $slice: [
              { $sortArray: { input: '$recentOrders', sortBy: { createdAt: -1 } } },
              5
            ]
          }
        }
      },
      // Format response
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$userDetails.name',
          email: '$userDetails.email',
          phoneNumber: '$userDetails.phoneNumber',
          orderCount: 1,
          totalSpent: 1,
          lastOrderDate: 1,
          recentOrders: 1,
          // Time since last order in minutes
          minutesSinceLastOrder: {
            $divide: [
              { $subtract: [currentTime, '$lastOrderDate'] },
              1000 * 60  // Convert ms to minutes
            ]
          },
          // Average order value
          averageOrderValue: { $divide: ['$totalSpent', '$orderCount'] }
        }
      }
    ]);

    logOperation('REALTIME_LEADERBOARD_RESULTS', {
      count: leaderboard.length,
      timestamp: currentTime
    });

    // Format and add ranking
    const formattedLeaderboard = leaderboard.map((user, index) => {
      // Format time since last order
      let timeSinceLastOrder;
      const minutes = Math.floor(user.minutesSinceLastOrder);
      
      if (minutes < 1) {
        timeSinceLastOrder = 'Just now';
      } else if (minutes < 60) {
        timeSinceLastOrder = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      } else if (minutes < 1440) { // Less than a day
        const hours = Math.floor(minutes / 60);
        timeSinceLastOrder = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else {
        const days = Math.floor(minutes / 1440);
        timeSinceLastOrder = `${days} ${days === 1 ? 'day' : 'days'} ago`;
      }
      
      // Return formatted user object with rank
      return {
        rank: index + 1,
        userId: user.userId,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        orderCount: user.orderCount,
        totalSpent: parseFloat(user.totalSpent.toFixed(2)),
        averageOrderValue: parseFloat(user.averageOrderValue.toFixed(2)),
        lastOrderDate: user.lastOrderDate,
        timeSinceLastOrder,
        // Format recent orders
        recentOrders: user.recentOrders.map(order => ({
          ...order,
          price: parseFloat(order.price.toFixed(2)),
          createdAt: order.createdAt,
          formattedDate: new Date(order.createdAt).toLocaleString()
        }))
      };
    });

    // Add live update information
    res.json({
      status: 'success',
      data: {
        leaderboard: formattedLeaderboard,
        lastUpdated: currentTime,
        updateMessage: 'Leaderboard is live. Data refreshes automatically.',
        serverTime: currentTime
      }
    });

  } catch (error) {
    logOperation('REALTIME_LEADERBOARD_ERROR', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch real-time users leaderboard',
      details: error.message
    });
  }
});

// Daily Sales Route - GET endpoint (Fixed for String Dates)
router.get('/daily-sales', async (req, res) => {
  try {
    const { userId, days = 7 } = req.query;
    
    // Log the operation
    logOperation('DAILY_SALES_REQUEST', {
      userId: userId || 'all',
      days,
      timestamp: new Date()
    });

    // Calculate date range (for the past X days)
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // End of current day
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (parseInt(days) - 1));
    startDate.setHours(0, 0, 0, 0); // Start of first day
    
    // Format dates as strings for comparison (YYYY-MM-DD format)
    const endDateStr = endDate.toISOString().split('T')[0];
    const startDateStr = startDate.toISOString().split('T')[0];
    
    console.log('Date range for query:', { startDateStr, endDateStr });
    
    // Build query object
    const query = {};
    if (userId) {
      try {
        // Try to convert to ObjectId if it's in that format
        const { ObjectId } = require('mongodb');
        query.userId = new ObjectId(userId);
      } catch (err) {
        // If conversion fails, use as a string
        console.log('Using userId as string:', userId);
        query.userId = userId;
      }
    }
    
    // Get a sample record to check the data structure
    const sampleRecords = await DataPurchase.find().limit(2).lean();
    console.log('Sample records:', JSON.stringify(sampleRecords, null, 2));
    
    // First approach: Try to use $expr with $substr if dates are stored as strings
    // This handles the case where createdAt is stored as a string like "2025-04-01T12:34:56.789Z"
    const dailySales = await DataPurchase.aggregate([
      // Initial match to reduce dataset size
      {
        $match: userId ? { userId: query.userId } : {}
      },
      
      // Add a day field by extracting just the date part of the createdAt string
      {
        $addFields: {
          // Extract YYYY-MM-DD from the date string
          dayStr: {
            $substr: ["$createdAt", 0, 10]  // First 10 chars of ISO date string
          }
        }
      },
      
      // Now filter by the date range using the extracted day string
      {
        $match: {
          dayStr: { $gte: startDateStr, $lte: endDateStr }
        }
      },
      
      // Group by day
      {
        $group: {
          _id: "$dayStr",
          // We'll format this later since we can't use date operations on strings
          orderCount: { $sum: 1 },
          revenue: { $sum: "$price" },
          orders: {
            $push: {
              id: "$_id",
              phoneNumber: "$phoneNumber",
              price: "$price",
              network: "$network",
              capacity: "$capacity",
              createdAt: "$createdAt" 
            }
          }
        }
      },
      
      // Sort by date string
      { $sort: { _id: 1 } }
    ]);
    
    console.log('Query results count:', dailySales.length);
    
    // Generate a complete date range (including days with no sales)
    const completeDateRange = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const formattedDay = currentDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      
      // Check if we have data for this day
      const existingData = dailySales.find(day => day._id === dateString);
      
      if (existingData) {
        completeDateRange.push({
          date: new Date(dateString), // Convert back to Date object
          dayString: dateString,
          dayFormatted: formattedDay,
          orderCount: existingData.orderCount,
          revenue: Math.round(existingData.revenue * 100) / 100, // Round to 2 decimal places
          averageOrderValue: existingData.orderCount > 0 
            ? Math.round((existingData.revenue / existingData.orderCount) * 100) / 100
            : 0,
          topOrders: existingData.orders.slice(0, 5) // Take top 5 orders
        });
      } else {
        // Add empty data for days with no sales
        completeDateRange.push({
          date: new Date(dateString),
          dayString: dateString,
          dayFormatted: formattedDay,
          orderCount: 0,
          revenue: 0,
          averageOrderValue: 0,
          topOrders: []
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Format data for chart consumption
    const chartData = {
      labels: completeDateRange.map(day => day.dayFormatted),
      revenue: completeDateRange.map(day => day.revenue),
      orders: completeDateRange.map(day => day.orderCount)
    };

    // Calculate period totals and metrics
    const totalOrders = completeDateRange.reduce((sum, day) => sum + day.orderCount, 0);
    const totalRevenue = completeDateRange.reduce((sum, day) => sum + day.revenue, 0);
    const periodAverageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Identify best performing day
    let bestDay = null;
    let bestDayRevenue = -1;
    
    completeDateRange.forEach(day => {
      if (day.revenue > bestDayRevenue) {
        bestDayRevenue = day.revenue;
        bestDay = day;
      }
    });

    // Respond with formatted data
    res.json({
      status: 'success',
      data: {
        dailySales: completeDateRange,
        metrics: {
          totalPeriodOrders: totalOrders,
          totalPeriodRevenue: parseFloat(totalRevenue.toFixed(2)),
          periodAverageOrderValue: parseFloat(periodAverageOrderValue.toFixed(2)),
          bestPerformingDay: bestDay ? {
            date: bestDay.dayFormatted,
            revenue: bestDay.revenue,
            orderCount: bestDay.orderCount
          } : null
        },
        chartData,
        timeRange: {
          start: startDate,
          end: endDate,
          days: parseInt(days)
        }
      }
    });

  } catch (error) {
    console.error('Daily sales error:', error);
    
    logOperation('DAILY_SALES_ERROR', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch daily sales data',
      details: error.message
    });
  }
});

module.exports = router;