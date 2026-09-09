import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import couponsRouter from './routes/coupons.js';
import slotsRouter from './routes/slots.js';
import inventoryRouter from './routes/inventory.js';
import riderRouter from './routes/rider.js';
import authRouter from './routes/auth.js';
import bulkRouter from './routes/bulk.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`✨ Gaurav Bhai Ki Mithai Backend API running at http://localhost:${PORT}`);
  console.log(`📦 Health check: http://localhost:${PORT}/health`);
  console.log(`🍬 Sweets catalog: http://localhost:${PORT}/api/v1/products`);
});
