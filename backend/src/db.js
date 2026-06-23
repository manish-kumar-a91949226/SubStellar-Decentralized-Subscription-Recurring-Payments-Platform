const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../substellar.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    creator_wallet TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    interval TEXT NOT NULL DEFAULT 'monthly',
    trial_days INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    tier TEXT DEFAULT 'starter',
    benefits TEXT DEFAULT '[]',
    is_public INTEGER DEFAULT 1,
    subscriber_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_wallet TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    trial_ends_at DATETIME,
    current_period_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    current_period_end DATETIME,
    cancelled_at DATETIME,
    paused_at DATETIME,
    coupon_used TEXT,
    discount_percent REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    subscription_id TEXT,
    user_wallet TEXT NOT NULL,
    creator_wallet TEXT,
    amount REAL NOT NULL,
    platform_fee REAL DEFAULT 0,
    creator_amount REAL DEFAULT 0,
    stellar_hash TEXT,
    status TEXT DEFAULT 'pending',
    type TEXT DEFAULT 'subscription',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_percent REAL NOT NULL,
    max_uses INTEGER DEFAULT 100,
    uses INTEGER DEFAULT 0,
    valid_until DATETIME,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default coupons
const existingCoupons = db.prepare('SELECT COUNT(*) as count FROM coupons').get();
if (existingCoupons.count === 0) {
  const insertCoupon = db.prepare(
    'INSERT INTO coupons (id, code, discount_percent, max_uses) VALUES (?, ?, ?, ?)'
  );
  insertCoupon.run('c1', 'WELCOME20', 20, 1000);
  insertCoupon.run('c2', 'SAVE50', 50, 500);
  insertCoupon.run('c3', 'FIRSTMONTH', 100, 200);
}

// Seed sample plans
const existingPlans = db.prepare('SELECT COUNT(*) as count FROM plans').get();
if (existingPlans.count === 0) {
  const { v4: uuidv4 } = require('uuid');
  const insertPlan = db.prepare(`
    INSERT INTO plans (id, creator_wallet, name, description, price, interval, trial_days, tier, benefits, is_public)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPlan.run(uuidv4(), 'GBDEMO1234567890DEMO1234567890DEMO1234567890DEMO12345678',
    'Newsletter Pro', 'Premium newsletter with weekly exclusive content', 5, 'monthly', 7, 'starter',
    JSON.stringify(['Weekly newsletter', 'Exclusive articles', 'Community access']), 1);
  insertPlan.run(uuidv4(), 'GBDEMO1234567890DEMO1234567890DEMO1234567890DEMO12345678',
    'SaaS Builder Plan', 'Full access to all SaaS tools and resources', 20, 'monthly', 14, 'pro',
    JSON.stringify(['All tools access', 'Priority support', 'API access', 'Analytics']), 1);
  insertPlan.run(uuidv4(), 'GBDEMO1234567890DEMO1234567890DEMO1234567890DEMO12345678',
    'Enterprise Suite', 'Enterprise-grade subscription management', 99, 'monthly', 30, 'enterprise',
    JSON.stringify(['Unlimited everything', 'Dedicated support', 'Custom contracts', 'White-label']), 1);
  insertPlan.run(uuidv4(), 'GBDEMO1234567890DEMO1234567890DEMO1234567890DEMO12345678',
    'Creator Membership', 'Exclusive creator community membership', 15, 'monthly', 0, 'pro',
    JSON.stringify(['Creator tools', 'Revenue analytics', 'Community badge', 'Early access']), 1);
  insertPlan.run(uuidv4(), 'GBDEMO1234567890DEMO1234567890DEMO1234567890DEMO12345678',
    'AI SaaS Toolkit', 'Access premium AI tools powered by Stellar payments', 49, 'yearly', 7, 'enterprise',
    JSON.stringify(['GPT-4 API access', 'Image generation', 'Priority queues', 'Analytics dashboard']), 1);
}

module.exports = db;
