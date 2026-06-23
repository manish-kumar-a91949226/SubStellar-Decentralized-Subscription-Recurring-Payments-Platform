const express = require('express');
const router = express.Router();
const db = require('../db');

// GET treasury summary for a creator
router.get('/', (req, res) => {
  try {
    const { wallet } = req.query;
    if (!wallet) return res.status(400).json({ success: false, error: 'wallet query param required' });

    const summary = db.prepare(`
      SELECT
        COALESCE(SUM(creator_amount), 0) as total_earnings,
        COALESCE(SUM(platform_fee), 0) as total_fees,
        COALESCE(SUM(amount), 0) as gross_volume,
        COUNT(*) as total_transactions
      FROM transactions t
      JOIN subscriptions s ON t.subscription_id = s.id
      JOIN plans p ON s.plan_id = p.id
      WHERE p.creator_wallet = ? AND t.status = 'completed'
    `).get(wallet);

    const recentTx = db.prepare(`
      SELECT t.*, p.name as plan_name FROM transactions t
      JOIN subscriptions s ON t.subscription_id = s.id
      JOIN plans p ON s.plan_id = p.id
      WHERE p.creator_wallet = ? AND t.status = 'completed'
      ORDER BY t.created_at DESC LIMIT 10
    `).all(wallet);

    res.json({ success: true, data: { summary, recentTransactions: recentTx } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST collect fee (called when subscription payment is made)
router.post('/collect', (req, res) => {
  try {
    const { subscription_id, amount, stellar_hash } = req.body;
    const platformFee = amount * 0.02;
    const creatorAmount = amount - platformFee;

    const sub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(subscription_id);
    if (!sub) return res.status(404).json({ success: false, error: 'Subscription not found' });

    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(sub.plan_id);
    const { v4: uuidv4 } = require('uuid');
    const txId = uuidv4();

    db.prepare(`
      INSERT INTO transactions (id, subscription_id, user_wallet, creator_wallet, amount, platform_fee, creator_amount, stellar_hash, status, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', 'fee_collection')
    `).run(txId, subscription_id, sub.user_wallet, plan.creator_wallet, amount, platformFee, creatorAmount, stellar_hash || null);

    const io = req.app.get('io');
    if (io) {
      io.to(`wallet:${plan.creator_wallet}`).emit('treasury:fee_collected', {
        amount, platformFee, creatorAmount, stellar_hash
      });
    }

    res.json({ success: true, data: { platformFee, creatorAmount, transactionId: txId } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
