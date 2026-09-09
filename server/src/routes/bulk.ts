import { Router } from 'express';
import { store } from '../data/store.js';

const router = Router();

// GET /api/v1/bulk-orders - Get list of submitted bulk quote requests
router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: store.getBulkOrders(),
  });
});

// POST /api/v1/bulk-orders - Submit bulk quote request
router.post('/', (req, res) => {
  const {
    occasion,
    quantityKg,
    sweets,
    boxStyle,
    customFoilText,
    targetDate,
    customerName,
    phone,
  } = req.body || {};

  const qty = Number(quantityKg) || 25; // default 25kg
  const quoteNumber = Math.floor(10000 + Math.random() * 90000);
  const quoteId = `#GBM-BULK-${quoteNumber}`;

  // Average retail base price per Kg ₹750
  const retailSubtotal = qty * 750;

  // Wholesale bulk discount tier
  let discountPercent = 0.15; // 15% for 20-50kg
  if (qty >= 100) discountPercent = 0.25; // 25% for 100kg+
  else if (qty >= 50) discountPercent = 0.20; // 20% for 50-100kg

  const wholesaleDiscount = Math.round(retailSubtotal * discountPercent);
  const estimatedTotal = retailSubtotal - wholesaleDiscount;
  const depositRequired = Math.round(estimatedTotal * 0.25); // 25% deposit

  const bulkQuote = {
    quoteId,
    customerName: customerName || 'Gaurav Jain',
    phone: phone || '+91 98765 43210',
    occasion: occasion || 'Wedding & Sangeet Samaroh',
    quantityKg: qty,
    selectedSweets: Array.isArray(sweets) && sweets.length > 0 ? sweets : ['Premium Kaju Katli', 'Desi Ghee Motichoor Ladoo'],
    boxStyle: boxStyle || '4-Compartment Velvet Box with Gold Seal',
    customFoilText: customFoilText || 'With Best Compliments from Sharma Family',
    targetDate: targetDate || '15 Nov 2026',
    pricing: {
      retailSubtotal,
      wholesaleDiscount,
      discountPercentage: Math.round(discountPercent * 100),
      estimatedTotal,
      depositRequired,
    },
    status: 'quote_submitted',
    submittedAt: new Date().toISOString(),
  };

  store.addBulkOrder(bulkQuote);

  res.status(201).json({
    success: true,
    data: bulkQuote,
  });
});

export default router;
