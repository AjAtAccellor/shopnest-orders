require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT || 3000),
  payhub: {
    baseUrl: process.env.PAYHUB_BASE_URL || 'http://localhost:4001/api/v1',
    apiKey: process.env.PAYHUB_API_KEY || 'test_payhub_key',
    docsUrl: 'https://anujchaudhary00.github.io/shopnest-orders/payhub/',
  },
  courier: {
    baseUrl: process.env.COURIER_BASE_URL || 'http://localhost:4002/v2',
    clientId: process.env.COURIER_CLIENT_ID || 'shopnest-orders',
    docsUrl: 'https://anujchaudhary00.github.io/shopnest-orders/courier/',
  },
};
