const express = require('express');
const router = express.Router();
const db = require('../db');

// GET validate coupon
router.get('/validate/:code', (req, res) => {
  try {
    const coupon = db.prepare(
      'SELECT * FROM coupons WHERE code = ? AND uses < max_uses'
    ).get(req.params.code.toUpperCase());

    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Invalid or expired coupon' });
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discount_percent: coupon.discount_percent,
        remaining_uses: coupon.max_uses - coupon.uses,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET all coupons (admin)
router.get('/', (req, res) => {
  try {
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
