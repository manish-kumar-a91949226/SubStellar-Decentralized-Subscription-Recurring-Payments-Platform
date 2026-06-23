require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const plansRouter = require('./routes/plans');
const subscriptionsRouter = require('./routes/subscriptions');
const analyticsRouter = require('./routes/analytics');
const treasuryRouter = require('./routes/treasury');
const couponsRouter = require('./routes/coupons');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SubStellar API', version: '1.0.0', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/plans', plansRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/treasury', treasuryRouter);
app.use('/api/coupons', couponsRouter);

// Socket.IO
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on('join-wallet', (walletAddress) => {
    socket.join(`wallet:${walletAddress}`);
    console.log(`Wallet ${walletAddress} joined room`);
  });
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 SubStellar API running on port ${PORT}`);
  console.log(`📡 Socket.IO ready`);
});

module.exports = { app, server };
