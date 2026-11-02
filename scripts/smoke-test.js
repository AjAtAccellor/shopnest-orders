// Run `npm run dev` in one terminal, then `npm run smoke` in another.
const axios = require('axios');
const base = `http://localhost:${process.env.PORT || 3000}`;

(async () => {
  const { data: order } = await axios.post(`${base}/orders`, {
    customerEmail: 'demo@shopnest.dev',
    address: { line1: '12 MG Road', city: 'Bengaluru', pincode: '560001' },
    items: [{ sku: 'TSHIRT-01', price: 499.99, qty: 2, weightKg: 0.3 }],
  });
  console.log('created  ', order.id, order.status, order.paymentId);

  const { data: shipped } = await axios.post(`${base}/orders/${order.id}/confirm`);
  console.log('confirmed', shipped.status, shipped.awb, 'eta', shipped.eta);

  const { data: tracking } = await axios.get(`${base}/orders/${order.id}/tracking`);
  console.log('tracking ', tracking.status, tracking.events[0].location);
  console.log('\nSmoke test passed');
})().catch((e) => {
  console.error('Smoke test failed:', e.response?.data || e.message);
  process.exit(1);
});
