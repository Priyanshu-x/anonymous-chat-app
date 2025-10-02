// backend/routes/adminBlockIp.js
const express = require('express');
const BlockedIP = require('../models/BlockedIP');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

// Get all blocked IPs
router.get('/blocked-ips', adminAuth, async (req, res) => {
  const ips = await BlockedIP.find().sort({ blockedAt: -1 });
  res.json(ips);
});

// Block an IP
router.post('/block-ip', adminAuth, async (req, res) => {
  const { ip, reason } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP is required' });
  await BlockedIP.updateOne({ ip }, { ip, reason }, { upsert: true });
  res.json({ message: 'IP blocked' });
});

// Unblock an IP
router.delete('/block-ip/:ip', adminAuth, async (req, res) => {
  const { ip } = req.params;
  await BlockedIP.deleteOne({ ip });
  res.json({ message: 'IP unblocked' });
});

module.exports = router;
