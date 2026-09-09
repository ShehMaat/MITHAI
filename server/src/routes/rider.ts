import { Router } from 'express';
import { store } from '../data/store.js';

const router = Router();

// GET /api/v1/rider/orders - Get orders assigned for delivery
router.get('/orders', (_req, res) => {
  const deliveryOrders = store.getOrders().filter(
    (o) => o.fulfillmentMode === 'delivery'
  );
  res.json({
    success: true,
    data: deliveryOrders,
  });
});

// POST /api/v1/rider/verify-otp - Complete delivery handover via 4-digit customer OTP
router.post('/verify-otp', (req, res) => {
  const { orderId, otp } = req.body;

  if (!orderId || !otp) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'orderId and otp are required' },
    });
  }

  const order = store.getOrderById(orderId);
  if (!order) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Order not found' },
    });
  }

  if (order.riderOtp && order.riderOtp !== String(otp).trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_OTP', message: 'Incorrect OTP entered' },
    });
  }

  const updated = store.updateOrderStatus(order.orderId, 'delivered');

  res.json({
    success: true,
    data: {
      orderId: updated?.orderId,
      status: 'delivered',
      payoutEarned: 120,
      message: 'Delivery successfully verified and completed!',
    },
  });
});

export default router;
