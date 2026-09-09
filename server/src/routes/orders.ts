import { Router } from 'express';
import { store } from '../data/store.js';

const router = Router();

// GET /api/v1/orders - Get orders list
router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: store.getOrders(),
  });
});

// GET /api/v1/orders/recent - Recent orders
router.get('/recent', (_req, res) => {
  res.json({
    success: true,
    data: store.getOrders(),
  });
});

// GET /api/v1/orders/verify?token=42 - Verify pickup token
router.get('/verify', (req, res) => {
  const token = req.query.token as string;
  if (!token) {
    return res.status(400).json({ success: false, error: { message: 'Token query parameter required' } });
  }
  const clean = token.replace('#', '').trim();
  const matched = store.getOrders().find((o) => o.token === clean);
  if (!matched) {
    return res.status(404).json({ success: false, error: { message: 'No active order matching token' } });
  }
  res.json({ success: true, data: matched });
});

// GET /api/v1/orders/:id - Get specific order by ID
router.get('/:id', (req, res) => {
  const order = store.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Order not found' },
    });
  }
  res.json({ success: true, data: order });
});

// POST /api/v1/orders - Place a new order
router.post('/', (req, res) => {
  const body = req.body || {};

  const orderNum = Math.floor(10000 + Math.random() * 90000);
  const orderId = `#GBM-${orderNum}`;
  const token = String(Math.floor(40 + Math.random() * 50));
  const riderOtp = String(Math.floor(1000 + Math.random() * 9000));

  const items = Array.isArray(body.items) ? body.items : [];
  const fulfillmentMode = body.fulfillmentMode || 'delivery';
  const hasGiftWrap = Boolean(body.hasGiftWrap);
  const giftMessage = body.giftMessage || '';
  const selectedDate = body.selectedDate || 'Today (8 Sep)';
  const selectedSlot = body.selectedSlot || '5:00 PM - 6:00 PM';
  const address = body.address || 'Flat 402, Nirvana Courtyard, Sector 50, Gurugram';
  const paymentMethod = body.paymentMethod || 'UPI (Instant)';

  // Calculate pricing
  const itemTotal = items.reduce((sum: number, it: any) => {
    const qty = it.quantity || 1;
    const price = it.price || (it.variant?.price) || 0;
    return sum + price * qty;
  }, 0);

  const packagingFee = hasGiftWrap ? 35 : 0;
  const deliveryFee = fulfillmentMode === 'pickup' ? 0 : (itemTotal >= 1000 ? 0 : 50);
  const tax = Math.round(itemTotal * 0.05);

  let discount = 0;
  if (body.couponCode) {
    const coupon = store.getCouponByCode(body.couponCode);
    if (coupon && itemTotal >= coupon.minOrderValue) {
      discount = coupon.discountAmount;
    }
  }

  const grandTotal = Math.max(0, itemTotal + packagingFee + deliveryFee + tax - discount);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newOrder = {
    orderId,
    token,
    customerName: body.customerName || 'Gaurav Jain',
    phone: body.phone || '+91 98765 43210',
    fulfillmentMode,
    slotDate: selectedDate,
    slotTime: selectedSlot,
    address,
    items,
    hasGiftWrap,
    giftMessage,
    itemTotal,
    packagingFee,
    deliveryFee,
    tax,
    discount,
    grandTotal,
    paymentMethod,
    placedAt: timeStr,
    eta: fulfillmentMode === 'pickup' ? 'Ready in 15-20 mins' : 'Delivery in 25-35 mins',
    status: 'kitchen',
    riderOtp,
  };

  store.addOrder(newOrder);

  res.status(201).json({
    success: true,
    data: newOrder,
  });
});

const handleStatusUpdate = (req: any, res: any) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_STATUS', message: 'Status field is required' },
    });
  }

  const updated = store.updateOrderStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Order not found' },
    });
  }

  res.json({
    success: true,
    data: updated,
  });
};

router.patch('/:id/status', handleStatusUpdate);
router.post('/:id/status', handleStatusUpdate);

// POST /api/v1/orders/:id/cancel - Cancel order and process instant refund
router.post('/:id/cancel', (req, res) => {
  const cancelled = store.cancelOrder(req.params.id);
  if (!cancelled) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Order not found or cannot be cancelled' },
    });
  }

  res.json({
    success: true,
    data: {
      orderId: cancelled.orderId,
      status: 'cancelled',
      refundId: cancelled.refundId,
      refundAmount: cancelled.grandTotal,
      message: `Order ${cancelled.orderId} cancelled successfully. 100% refund of ₹${cancelled.grandTotal} credited to original payment source.`,
    },
  });
});

export default router;
