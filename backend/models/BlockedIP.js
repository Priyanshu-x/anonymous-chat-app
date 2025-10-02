// backend/models/BlockedIP.js
const mongoose = require('mongoose');

const BlockedIPSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  blockedAt: { type: Date, default: Date.now },
  reason: { type: String }
});

module.exports = mongoose.model('BlockedIP', BlockedIPSchema);
