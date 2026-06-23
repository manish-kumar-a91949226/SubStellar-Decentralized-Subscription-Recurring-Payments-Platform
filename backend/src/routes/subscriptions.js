const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const PLATFORM_FEE_PERCENT = 0.02; // 2%

function calculatePeriodEnd(interval) {
  const now = new Date();
  if (interval === 'yearly') {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  return now.toISOString();
}

// GET subscriptions for a wallet
router.get('/', (req, res) => {
  try {
    const { wallet } = req.query;
    if (!wallet) return res.status(400).json({ success: false, error: 'wallet query param required' });

    const subs = db.prepare(`
      SELECT s.*, p.name as plan_name, p.price, p.interval, p.tier, p.creator_wallet, p.benefits
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE s.user_wallet = ?
      ORDER BY s.created_at DESC
    `).all(wallet);

    res.json({
      success: true,
      data: subs.map(s => ({ ...s, benefits: JSON.parse(s.benefits || '[]') }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET subscriptions for a creator's plans
router.get('/creator', (req, res) => {
  try {
    const { wallet } = req.query;
    if (!wallet) return res.status(400).json({ success: false, error: 'wallet query param required' });

    const subs = db.prepare(`
      SELECT s.*, p.name as plan_name, p.price, p.interval, p.tier
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE p.creator_wallet = ?
      ORDER BY s.created_at DESC
    `).all(wallet);

    res.json({ success: true, data: subs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST subscribe to a plan
router.post('/', (req, res) => {
  try {
    const { user_wallet, plan_id, coupon_code, stellar_hash } = req.body;
    if (!user_wallet || !plan_id) {
      return res.status(400).json({ success: false, error: 'user_wallet and plan_id required' });
    }

    const plan = db.prepare("SELECT * FROM plans WHERE id = ? AND status = 'active'").get(plan_id);
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found or inactive' });

    // Check existing active subscription
    const existing = db.prepare(
      "SELECT * FROM subscriptions WHERE user_wallet = ? AND plan_id = ? AND status IN ('active', 'trial')"
    ).get(user_wallet, plan_id);
    if (existing) return res.status(409).json({ success: false, error: 'Already subscribed to this plan' });

    // Validate coupon
    let discountPercent = 0;
    let couponUsed = null;
    if (coupon_code) {
      const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND uses < max_uses').get(coupon_code.toUpperCase());
      if (coupon) {
        discountPercent = coupon.discount_percent;
        couponUsed = coupon.code;
        db.prepare('UPDATE coupons SET uses = uses + 1 WHERE id = ?').run(coupon.id);
      }
    }

    // Calculate fee
    const amount = plan.price * (1 - discountPercent / 100);
    const platformFee = amount * PLATFORM_FEE_PERCENT;
    const creatorAmount = amount - platformFee;

    // Trial period
    const now = new Date();
    const trialEndsAt = plan.trial_days > 0
      ? new Date(now.getTime() + plan.trial_days * 86400000).toISOString()
      : null;
    const status = plan.trial_days > 0 ? 'trial' : 'active';
    const periodEnd = calculatePeriodEnd(plan.interval);

    const subId = uuidv4();
    db.prepare(`
      INSERT INTO subscriptions (id, user_wallet, plan_id, status, trial_ends_at, current_period_end, coupon_used, discount_percent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(subId, user_wallet, plan_id, status, trialEndsAt, periodEnd, couponUsed, discountPercent);

    // Record transaction
    const txId = uuidv4();
    db.prepare(`
      INSERT INTO transactions (id, subscription_id, user_wallet, creator_wallet, amount, platform_fee, creator_amount, stellar_hash, status, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(txId, subId, user_wallet, plan.creator_wallet, amount, platformFee, creatorAmount,
      stellar_hash || null, 'completed', 'subscription');

    // Update subscriber count
    db.prepare('UPDATE plans SET subscriber_count = subscriber_count + 1 WHERE id = ?').run(plan_id);

    const sub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(subId);

    // Emit events
    const io = req.app.get('io');
    if (io) {
      io.to(`wallet:${user_wallet}`).emit('subscription:started', { subscription: sub, plan });
      io.to(`wallet:${plan.creator_wallet}`).emit('subscription:new_subscriber', { subscription: sub, plan });
      io.emit('subscription:created', { subscription: sub, plan });
    }

    res.status(201).json({ success: true, data: sub });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH cancel subscription
router.patch('/:id/cancel', (req, res) => {
  try {
    const sub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id);
    if (!sub) return res.status(404).json({ success: false, error: 'Subscription not found' });

    db.prepare("UPDATE subscriptions SET status='cancelled', cancelled_at=CURRENT_TIMESTAMP WHERE id=?").run(req.params.id);
    const updated = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id);

    const io = req.app.get('io');
    if (io) io.to(`wallet:${sub.user_wallet}`).emit('subscription:cancelled', updated);

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH pause subscription
router.patch('/:id/pause', (req, res) => {
  try {
    db.prepare("UPDATE subscriptions SET status='paused', paused_at=CURRENT_TIMESTAMP WHERE id=?").run(req.params.id);
    const updated = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id);
    const io = req.app.get('io');
    if (io) io.to(`wallet:${updated.user_wallet}`).emit('subscription:paused', updated);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH resume subscription
router.patch('/:id/resume', (req, res) => {
  try {
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    db.prepare(`
      UPDATE subscriptions SET status='active', paused_at=NULL, current_period_start=CURRENT_TIMESTAMP,
      current_period_end=? WHERE id=?
    `).run(periodEnd.toISOString(), req.params.id);
    const updated = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id);
    const io = req.app.get('io');
    if (io) io.to(`wallet:${updated.user_wallet}`).emit('subscription:resumed', updated);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH renew subscription
router.patch('/:id/renew', (req, res) => {
  try {
    const sub = db.prepare(`
      SELECT s.*, p.interval, p.creator_wallet, p.price FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id WHERE s.id = ?
    `).get(req.params.id);
    if (!sub) return res.status(404).json({ success: false, error: 'Subscription not found' });

    const periodEnd = calculatePeriodEnd(sub.interval);
    db.prepare(`
      UPDATE subscriptions SET status='active', current_period_start=CURRENT_TIMESTAMP, current_period_end=? WHERE id=?
    `).run(periodEnd, req.params.id);

    const io = req.app.get('io');
    if (io) io.to(`wallet:${sub.user_wallet}`).emit('subscription:renewed', { id: req.params.id });
    res.json({ success: true, message: 'Subscription renewed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
