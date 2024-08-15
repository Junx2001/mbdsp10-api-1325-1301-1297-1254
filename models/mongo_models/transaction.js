const mongoose = require('./mongoDb');

const transactionSchema = new mongoose.Schema({
  exchange_id: Number,
  owner_id: Number,
  taker_id: Number,
  status: String,
  longitude: Number,
  latitude: Number,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Transation = mongoose.model('Transaction', transactionSchema);

module.exports = Transation;
