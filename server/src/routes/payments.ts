import { Router } from 'express';
import crypto from 'crypto';
import { paymentService } from '../services/paymentService.js';
import { store } from '../data/store.js';
import { broadcastOrderStatus } from '../server.js';

const router = Router();

// Idempotency cache for processed webhook event IDs
const processedWebhookEvents = new Set<string>();

// POST /api/v1/payments/create-order - Initialize payment gateway order
router.post('/create-order', async (req, res) => {
  const { amount, receipt, notes } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_AMOUNT', message: 'Valid payment amount is required' },
    });
  }

  const orderReceipt = receipt || `rcpt_${Date.now()}`;
  const gatewayOrder = await paymentService.createGatewayOrder({
    amount: Number(amount),
    receipt: orderReceipt,
    notes,
  });

  res.json({
    success: true,
    data: gatewayOrder,
  });
});

// POST /api/v1/payments/verify - Verify gateway payment signature and confirm order
router.post('/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_payment_id) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_PAYMENT_DETAILS', message: 'Payment ID is required' },
    });
  }

  const isValid = paymentService.verifySignature({
    razorpay_order_id: razorpay_order_id || '',
    razorpay_payment_id,
    razorpay_signature: razorpay_signature || '',
  });

  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: { code: 'PAYMENT_VERIFICATION_FAILED', message: 'Signature mismatch' },
    });
  }

  if (orderId) {
    const existing = store.getOrderById(orderId);
    if (existing) {
      existing.paymentStatus = 'Paid';
      existing.paymentId = razorpay_payment_id;
    }
  }

  res.json({
    success: true,
    data: {
      verified: true,
      paymentId: razorpay_payment_id,
      message: 'Payment verified successfully',
    },
  });
});

// POST /api/v1/payments/webhook - Reconcile asynchronous payment events (captured, failed)
router.post('/webhook', (req, res) => {
  const webhookSignature = req.headers['x-razorpay-signature'] as string;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // 1. Signature Verification (if secret configured)
  if (webhookSecret && webhookSignature) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_WEBHOOK_SIGNATURE', message: 'Signature verification failed' },
      });
    }
  }

  const { event, payload } = req.body;
  const paymentEntity = payload?.payment?.entity;
  const eventId =
    (req.headers['x-razorpay-event-id'] as string) ||
    `${event}_${paymentEntity?.id || Date.now()}`;

  // 2. Idempotency Guard (Roadmap Page 18: Protect against duplicate/delayed webhooks)
  if (processedWebhookEvents.has(eventId)) {
    console.log(`⚠️ [Webhook] Duplicate event ignored (Idempotency): ${eventId}`);
    return res.json({
      success: true,
      idempotency: 'ALREADY_PROCESSED',
      message: 'Duplicate webhook event acknowledged',
    });
  }
  processedWebhookEvents.add(eventId);

  console.log(`🔔 [Webhook] Processing payment event: ${event}`);

  // 3. Reconcile Order Status
  if (event === 'payment.captured') {
    const orderId = paymentEntity?.notes?.orderId || paymentEntity?.description;

    if (orderId) {
      const order = store.getOrderById(orderId);
      if (order) {
        order.paymentStatus = 'Paid';
        order.paymentId = paymentEntity.id;
        order.status = 'kitchen';
        store.updateOrderStatus(order.orderId, 'kitchen');
        broadcastOrderStatus(order.orderId, 'kitchen', order);
        console.log(`✅ [Webhook] Order ${order.orderId} reconciled to Paid & Kitchen`);
      }
    }
  } else if (event === 'payment.failed') {
    const orderId = paymentEntity?.notes?.orderId || paymentEntity?.description;

    if (orderId) {
      const order = store.getOrderById(orderId);
      if (order) {
        order.paymentStatus = 'Failed';
        order.status = 'payment_failed';
        store.updateOrderStatus(order.orderId, 'payment_failed');
        broadcastOrderStatus(order.orderId, 'payment_failed', order);
        console.log(`❌ [Webhook] Order ${order.orderId} marked Payment Failed`);
      }
    }
  }

  res.json({
    success: true,
    data: {
      received: true,
      event,
      timestamp: new Date().toISOString(),
    },
  });
});

// POST /api/v1/payments/refund - Process order refund
router.post('/refund', async (req, res) => {
  const { paymentId, amount } = req.body;

  if (!paymentId || !amount) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'paymentId and amount are required' },
    });
  }

  const refundResult = await paymentService.processRefund(paymentId, Number(amount));
  res.json({
    success: true,
    data: refundResult,
  });
});

export default router;
