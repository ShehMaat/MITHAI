import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';

import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import couponsRouter from './routes/coupons.js';
import slotsRouter from './routes/slots.js';
import inventoryRouter from './routes/inventory.js';
import riderRouter from './routes/rider.js';
import authRouter from './routes/auth.js';
import bulkRouter from './routes/bulk.js';
import paymentsRouter from './routes/payments.js';
import notificationsRouter from './routes/notifications.js';
import analyticsRouter from './routes/analytics.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
export const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH'],
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

  socket.on('join_order', (orderId: string) => {
    const cleanId = orderId ? orderId.replace('#', '') : '';
    socket.join(`order_${cleanId}`);
    console.log(`🔌 [Socket.io] Socket ${socket.id} joined room: order_${cleanId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [Socket.io] Client disconnected: ${socket.id}`);
  });
});

export function broadcastOrderStatus(orderId: string, status: string, orderData?: any) {
  const cleanId = orderId ? orderId.replace('#', '') : '';
  io.emit('order:status_updated', { orderId, status, orderData });
  io.to(`order_${cleanId}`).emit('order:updated', { orderId, status, orderData });
  console.log(`📡 [Socket.io] Broadcasted status for ${orderId} -> ${status}`);
}

// Enable CORS for mobile apps, web preview, and local LAN devices
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-App-Version'],
}));

app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root & Health
app.get('/', (_req, res) => {
  res.json({
    app: 'Gaurav Bhai Ki Mithai Backend API',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: '/api/v1',
    websockets: 'ENABLED',
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

// Mount V1 API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/coupons', couponsRouter);
app.use('/api/v1/slots', slotsRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/rider', riderRouter);
app.use('/api/v1/bulk-orders', bulkRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/analytics', analyticsRouter);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'ENDPOINT_NOT_FOUND', message: 'API route not found' },
  });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ServerError]', err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: err.message || 'Something went wrong on server' },
  });
});

server.listen(PORT, () => {
  console.log(`✨ Gaurav Bhai Ki Mithai Backend API running at http://localhost:${PORT}`);
  console.log(`📦 Health check: http://localhost:${PORT}/health`);
  console.log(`🍬 Sweets catalog: http://localhost:${PORT}/api/v1/products`);
  console.log(`🔌 Real-time Socket.io active on port ${PORT}`);
});
