const express = require('express');
const store = require('../store');
const payhub = require('../services/payhubClient');
const courier = require('../services/courierClient');

const router = express.Router();

// Create order -> create PayHub payment
router.post('/', async (req, res, next) => {
  try {
    const { items = [], customerEmail, address, currency = 'INR' } = req.body;
    if (!items.length || !customerEmail || !address) {
      return res.status(400).json({ error: 'items, customerEmail and address are required' });
    }
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const order = store.create({ items, customerEmail, address, currency, total, status: 'created' });

    const payment = await payhub.createPayment({
      orderId: order.id,
      amount: total,
      currency,
      customerEmail,
    });

    const updated = store.update(order.id, { paymentId: payment.paymentId, status: 'payment_pending' });
    res.status(201).json(updated);
  } catch (err) {
    next(err);
  }
});

// Confirm order -> capture payment, then create SwiftCourier shipment
router.post('/:id/confirm', async (req, res, next) => {
  try {
    const order = store.get(req.params.id);
    if (!order) return res.status(404).json({ error: 'order not found' });

    const captured = await payhub.capturePayment(order.paymentId);
    if (captured.status !== 'captured') {
      return res.status(402).json({ error: `payment status is ${captured.status}` });
    }

    const weightKg = order.items.reduce((w, i) => w + (i.weightKg || 0.5) * i.qty, 0);
    const shipment = await courier.createShipment({ orderId: order.id, address: order.address, weightKg });

    const updated = store.update(order.id, {
      status: 'shipped',
      shipmentId: shipment.shipmentId,
      awb: shipment.awb,
      eta: shipment.eta,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Track order -> SwiftCourier tracking
router.get('/:id/tracking', async (req, res, next) => {
  try {
    const order = store.get(req.params.id);
    if (!order || !order.shipmentId) return res.status(404).json({ error: 'shipment not found' });
    res.json(await courier.getTracking(order.shipmentId));
  } catch (err) {
    next(err);
  }
});

// Cancel order -> PayHub refund
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const order = store.get(req.params.id);
    if (!order) return res.status(404).json({ error: 'order not found' });
    const refund = await payhub.refundPayment({
      paymentId: order.paymentId,
      amount: order.total,
      reason: req.body.reason || 'customer_request',
    });
    res.json(store.update(order.id, { status: 'cancelled', refundId: refund.refundId }));
  } catch (err) {
    next(err);
  }
});

router.get('/', (_req, res) => res.json(store.list()));
router.get('/:id', (req, res) => {
  const order = store.get(req.params.id);
  return order ? res.json(order) : res.status(404).json({ error: 'order not found' });
});

module.exports = router;
