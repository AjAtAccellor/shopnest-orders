/**
 * SwiftCourier API client (internal shipping/logistics service).
 *
 * @service SwiftCourier
 * @apiVersion v2
 * @see https://anujchaudhary00.github.io/shopnest-orders/courier/              (human docs)
 * @see https://anujchaudhary00.github.io/shopnest-orders/courier/openapi.json  (OpenAPI spec)
 */
const axios = require('axios');
const { courier } = require('../config');

const http = axios.create({
  baseURL: courier.baseUrl,
  timeout: 5000,
  headers: { 'X-Client-Id': courier.clientId },
});

/**
 * POST /shipments
 * Body: { referenceId, address: { line1, city, pincode }, weightKg }
 */
async function createShipment({ orderId, address, weightKg }) {
  const { data } = await http.post('/shipments', {
    referenceId: orderId,
    address: {
      line1: address.line1,
      city: address.city,
      pincode: address.pincode,
    },
    weightKg,
  });
  // Response: { shipmentId, awb, eta }
  return { shipmentId: data.shipmentId, awb: data.awb, eta: data.eta };
}

/**
 * GET /shipments/{shipmentId}/tracking
 */
async function getTracking(shipmentId) {
  const { data } = await http.get(`/shipments/${shipmentId}/tracking`);
  // Response: { shipmentId, status, events: [{ at, location, note }] }
  return data;
}

module.exports = { createShipment, getTracking };
