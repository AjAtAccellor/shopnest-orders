const express = require('express');
const config = require('./config');
const ordersRouter = require('./routes/orders');

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/orders', ordersRouter);

app.use((err, _req, res, _next) => {
  const status = err.response?.status || 500;
  const upstream = err.config?.baseURL;
  console.error(`[error] ${err.message}${upstream ? ` (upstream: ${upstream})` : ''}`);
  res.status(status >= 400 && status < 600 ? status : 500).json({ error: err.message });
});

app.listen(config.port, () => {
  console.log(`shopnest-orders listening on http://localhost:${config.port}`);
});
