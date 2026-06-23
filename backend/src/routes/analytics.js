const express = require('express');
const router = express.Router();
const db = require('../db');

// GET analytics for a creator wallet
router.get('/', (req, res) => {
  try {
    const { wallet } = req.query;
    if (!wallet) return res.status(400).json({ success: false, error: 'wallet query param required' });

    // Total revenue
    const revenueRow = db.prepare(`
      SELECT COALESCE(SUM(creator_amount), 0) as total_revenue,
             COALESCE(SUM(amount), 0) as gross_revenue
      FROM transactions t
      JOIN subscriptions s ON t.subscription_id = s.id
      JOIN plans p ON s.plan_id = p.id
      WHERE p.creator_wallet = ? AND t.status = 'completed'
    `).get(wallet);

    // Active subscribers
    const activeSubscribers = db.prepare(`
      SELECT COUNT(*) as count FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE p.creator_wallet = ? AND s.status IN ('active', 'trial')
    `).get(wallet);

    // Cancelled subscribers
    const cancelledSubscribers = db.prepare(`
      SELECT COUNT(*) as count FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE p.creator_wallet = ? AND s.status = 'cancelled'
    `).get(wallet);

    // Total subscribers
    const totalSubscribers = db.prepare(`
      SELECT COUNT(*) as count FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE p.creator_wallet = ?
    `).get(wallet);

    // Plans count
    const plansCount = db.prepare(
      "SELECT COUNT(*) as count FROM plans WHERE creator_wallet = ? AND status != 'deleted'"
    ).get(wallet);

    // Monthly revenue (last 6 months)
    const monthlyRevenue = db.prepare(`
      SELECT strftime('%Y-%m', t.created_at) as month,
             COALESCE(SUM(t.creator_amount), 0) as revenue,
             COUNT(*) as transactions
      FROM transactions t
      JOIN subscriptions s ON t.subscription_id = s.id
      JOIN plans p ON s.plan_id = p.id
      WHERE p.creator_wallet = ? AND t.status = 'completed'
        AND t.created_at >= datetime('now', '-6 months')
      GROUP BY month
      ORDER BY month ASC
    `).all(wallet);

    // Per-plan stats
    const planStats = db.prepare(`
      SELECT p.id, p.name, p.price, p.interval, p.tier,
             COUNT(s.id) as total_subs,
             SUM(CASE WHEN s.status IN ('active','trial') THEN 1 ELSE 0 END) as active_subs,
             COALESCE(SUM(t.creator_amount), 0) as revenue
      FROM plans p
      LEFT JOIN subscriptions s ON s.plan_id = p.id
      LEFT JOIN transactions t ON t.subscription_id = s.id AND t.status = 'completed'
      WHERE p.creator_wallet = ? AND p.status != 'deleted'
      GROUP BY p.id
    `).all(wallet);

    // Growth rate (simple: current month vs last month)
    const currentMonth = db.prepare(`
      SELECT COUNT(*) as count FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE p.creator_wallet = ? AND s.created_at >= datetime('now', 'start of month')
    `).get(wallet);

    const lastMonth = db.prepare(`
      SELECT COUNT(*) as count FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE p.creator_wallet = ?
        AND s.created_at >= datetime('now', 'start of month', '-1 month')
        AND s.created_at < datetime('now', 'start of month')
    `).get(wallet);

    const growthRate = lastMonth.count > 0
      ? ((currentMonth.count - lastMonth.count) / lastMonth.count * 100).toFixed(1)
      : currentMonth.count > 0 ? 100 : 0;

    res.json({
      success: true,
      data: {
        revenue: {
          total: revenueRow.total_revenue,
          gross: revenueRow.gross_revenue,
          monthly: monthlyRevenue,
        },
        subscribers: {
          active: activeSubscribers.count,
          cancelled: cancelledSubscribers.count,
          total: totalSubscribers.count,
          growthRate: parseFloat(growthRate),
        },
        plans: {
          total: plansCount.count,
          stats: planStats,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
