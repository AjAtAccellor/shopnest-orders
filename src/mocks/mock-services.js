// Local mocks of PayHub (:4001) and SwiftCourier (:4002) so the demo runs offline.
// They implement the CURRENT (v1 / v2) contracts from docs/.
const express = require('express');
const crypto = require('crypto');

const id = (p) => `${p}_${crypto.randomBytes(4).toString('hex')}`;

// ---- PayHub mock ----
const payhub = express();
payhub.use(express.json());
const payments = new Map();

payhub.use((req, res, next) => {
  if (!req.get('X-PayHub-Key')) return res.status(401).json({ error: 'missing X-PayHub-Key' });
  next();
});
payhub.post('/api/v1/payments', (req, res) => {
  const { orderId, amount, currency } = req.body;
  if (!orderId || typeof amount !== 'number') return res.status(400).json({ error: 'orderId and amount required' });
  const p = { paymentId: id('pay'), orderId, amount, currency: currency || 'INR', status: 'authorized', createdAt: new Date().toISOString() };
  payments.set(p.paymentId, p);
  res.status(201).json(p);
});
payhub.post('/api/v1/payments/:id/capture', (req, res) => {
  const p = payments.get(req.params.id);
  if (!p) return res.status(404).json({ error: 'payment not found' });
  p.status = 'captured';
  res.json(p);
});
payhub.get('/api/v1/payments/:id', (req, res) => {
  const p = payments.get(req.params.id);
  return p ? res.json(p) : res.status(404).json({ error: 'payment not found' });
});
payhub.post('/api/v1/refunds', (req, res) => {
  res.status(201).json({ refundId: id('ref'), paymentId: req.body.paymentId, status: 'processing' });
});

// ---- SwiftCourier mock ----
const courier = express();
courier.use(express.json());
const shipments = new Map();

courier.post('/v2/shipments', (req, res) => {
  const { referenceId, address } = req.body;
  if (!referenceId || !address?.pincode) return res.status(400).json({ error: 'referenceId and address.pincode required' });
  const eta = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
  const s = { shipmentId: id('shp'), awb: `SC${Date.now()}`, eta, referenceId };
  shipments.set(s.shipmentId, s);
  res.status(201).json(s);
});
courier.get('/v2/shipments/:id/tracking', (req, res) => {
  const s = shipments.get(req.params.id);
  if (!s) return res.status(404).json({ error: 'shipment not found' });
  res.json({
    shipmentId: s.shipmentId,
    status: 'in_transit',
    events: [
      { at: new Date().toISOString(), location: 'Delhi Hub', note: 'Picked up' },
    ],
  });
});

payhub.listen(4001, () => console.log('PayHub mock on http://localhost:4001/api/v1'));
courier.listen(4002, () => console.log('SwiftCourier mock on http://localhost:4002/v2'));
