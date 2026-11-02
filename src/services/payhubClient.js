/**
 * PayHub API client (internal payments service).
 *
 * @service PayHub
 * @apiVersion v1
 * @see https://anujchaudhary00.github.io/shopnest-orders/payhub/              (human docs)
 * @see https://anujchaudhary00.github.io/shopnest-orders/payhub/openapi.json  (OpenAPI spec)
 */
const axios = require('axios');
const { payhub } = require('../config');

const http = axios.create({
  baseURL: payhub.baseUrl,
  timeout: 5000,
  headers: { 'X-PayHub-Key': payhub.apiKey },
});

/**
 * POST /payments
 * Body: { orderId, amount, currency, customerEmail }
 * `amount` is a decimal number in major units (e.g. 499.99).
 */
async function createPayment({ orderId, amount, currency = 'INR', customerEmail }) {
  const { data } = await http.post('/payments', {
    orderId,
    amount,
    currency,
    customerEmail,
  });
  // Response: { paymentId, status: 'pending' | 'authorized' | 'failed', createdAt }
  return { paymentId: data.paymentId, status: data.status };
}

/**
 * POST /payments/{paymentId}/capture
 */
async function capturePayment(paymentId) {
  const { data } = await http.post(`/payments/${paymentId}/capture`);
  return { paymentId: data.paymentId, status: data.status };
}

/**
 * GET /payments/{paymentId}
 */
async function getPayment(paymentId) {
  const { data } = await http.get(`/payments/${paymentId}`);
  return data;
}

/**
 * POST /refunds
 * Body: { paymentId, amount, reason }
 */
async function refundPayment({ paymentId, amount, reason }) {
  const { data } = await http.post('/refunds', { paymentId, amount, reason });
  return { refundId: data.refundId, status: data.status };
}

module.exports = { createPayment, capturePayment, getPayment, refundPayment };
