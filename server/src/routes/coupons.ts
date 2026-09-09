import { Router } from 'express';
import { store } from '../data/store.js';

const router = Router();

// POST /api/v1/coupons/validate - Validate coupon code against subtotal
router.post('/validate', (req, res) => {
  const { code, subtotal } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Coupon code is required' },
    });
  }

  const coupon = store.getCouponByCode(code);

  if (!coupon) {
    return res.status(404).json({
      success: false,
      error: { code: 'COUPON_NOT_FOUND', message: 'Invalid coupon code. Try MITHAI50 or GOLD100' },
    });
  }

  const orderValue = Number(subtotal) || 0;

  if (orderValue < coupon.minOrderValue) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MIN_ORDER_UNMET',
        message: `Code ${coupon.code} requires minimum order value of ₹${coupon.minOrderValue}`,
      },
    });
  }

  res.json({
    success: true,
    data: {
      valid: true,
      code: coupon.code,
      discount: coupon.discountAmount,
      description: coupon.description,
    },
  });
});

export default router;
