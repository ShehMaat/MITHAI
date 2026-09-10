import { Router } from 'express';
import { paymentService } from '../services/paymentService.js';
import { store } from '../data/store.js';

const router = Router();

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
