const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET all public plans
router.get('/', (req, res) => {
  try {
    const { creator, tier, interval } = req.query;
    let query = "SELECT * FROM plans WHERE status != 'deleted'";
    const params = [];
    if (creator) { query += ' AND creator_wallet = ?'; params.push(creator); }
    if (tier) { query += ' AND tier = ?'; params.push(tier); }
    if (interval) { query += ' AND interval = ?'; params.push(interval); }
    query += ' ORDER BY created_at DESC';
    const plans = db.prepare(query).all(...params);
    res.json({ success: true, data: plans.map(p => ({ ...p, benefits: JSON.parse(p.benefits || '[]') })) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single plan
router.get('/:id', (req, res) => {
  try {
    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
    res.json({ success: true, data: { ...plan, benefits: JSON.parse(plan.benefits || '[]') } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create plan
router.post('/', (req, res) => {
  try {
    const { creator_wallet, name, description, price, interval, trial_days, tier, benefits, is_public } = req.body;
    if (!creator_wallet || !name || !price) {
      return res.status(400).json({ success: false, error: 'creator_wallet, name, and price are required' });
    }
    const id = uuidv4();
    db.prepare(`
      INSERT INTO plans (id, creator_wallet, name, description, price, interval, trial_days, tier, benefits, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, creator_wallet, name, description || '', price, interval || 'monthly',
      trial_days || 0, tier || 'starter', JSON.stringify(benefits || []), is_public ? 1 : 0);

    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(id);
    
    // Emit event
    const io = req.app.get('io');
    if (io) io.emit('plan:created', { ...plan, benefits: JSON.parse(plan.benefits) });

    res.status(201).json({ success: true, data: { ...plan, benefits: JSON.parse(plan.benefits) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update plan
router.put('/:id', (req, res) => {
  try {
    const { name, description, price, trial_days, tier, benefits, is_public } = req.body;
    const existing = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Plan not found' });

    db.prepare(`
      UPDATE plans SET name=?, description=?, price=?, trial_days=?, tier=?, benefits=?, is_public=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(name || existing.name, description || existing.description, price || existing.price,
      trial_days ?? existing.trial_days, tier || existing.tier,
      JSON.stringify(benefits || JSON.parse(existing.benefits)), is_public ? 1 : 0, req.params.id);

    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
    const io = req.app.get('io');
    if (io) io.emit('plan:updated', { ...plan, benefits: JSON.parse(plan.benefits) });
    res.json({ success: true, data: { ...plan, benefits: JSON.parse(plan.benefits) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH pause/activate plan
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'paused', 'deleted'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    db.prepare('UPDATE plans SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(status, req.params.id);
    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: { ...plan, benefits: JSON.parse(plan.benefits) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE plan
router.delete('/:id', (req, res) => {
  try {
    db.prepare("UPDATE plans SET status='deleted', updated_at=CURRENT_TIMESTAMP WHERE id=?").run(req.params.id);
    res.json({ success: true, message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
