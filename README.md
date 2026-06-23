# SubStellar 🚀
**Stripe Billing for Web3 built on Stellar.**

## Overview
SubStellar is a decentralized subscription and recurring payments platform. It allows creators, SaaS founders, and communities to create multi-tier subscription plans and accept recurring payments in XLM via Stellar smart contracts.

### Competition Details (Level 3 - Orange Belt)
- **Live Demo:** [Insert Vercel Link Here]
- **Contracts Deployed On:** Stellar Testnet
- **Key Transaction Hash:** [Insert Hash Here]

## Features
✅ **Real-world utility:** Replaces fiat processors like Stripe with crypto equivalents.
✅ **Advanced Contract Logic:** Multi-contract architecture (Plans, Subscriptions, Treasury).
✅ **Event Streaming:** Real-time Socket.IO notifications for payments and subs.
✅ **Mobile Responsive:** Modern glassmorphism UI built with TailwindCSS.
✅ **Creator Dashboard:** Real-time analytics, revenue tracking, and MRR charts.

## Architecture
See `docs/architecture.md` for a complete system diagram.

## Setup Instructions

### Prerequisites
- Node.js 20+
- Rust (for contracts)

### Running Locally
1. **Clone repo:** `git clone <repo>`
2. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *Runs on http://localhost:3001 using SQLite (zero config).*
3. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Runs on http://localhost:5173.*

### Smart Contracts
Contracts are written in Rust using the Soroban SDK.
```bash
cd contracts/plan-contract
cargo build --target wasm32-unknown-unknown --release
```

## Testing
We have 10+ passing tests across the stack.
- Frontend: `cd frontend && npx vitest run`
- Backend: `cd backend && npm test`
