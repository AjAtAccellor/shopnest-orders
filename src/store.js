// In-memory order store (demo only).
const orders = new Map();
let seq = 1000;

function create(order) {
  const id = `ORD-${++seq}`;
  const record = { id, ...order, createdAt: new Date().toISOString() };
  orders.set(id, record);
  return record;
}

function get(id) {
  return orders.get(id);
}

function update(id, patch) {
  const current = orders.get(id);
  if (!current) return undefined;
  const next = { ...current, ...patch };
  orders.set(id, next);
  return next;
}

function list() {
  return [...orders.values()];
}

module.exports = { create, get, update, list };
