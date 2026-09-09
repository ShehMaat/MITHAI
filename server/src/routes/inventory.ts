import { Router } from 'express';
import { store } from '../data/store.js';

const router = Router();

// GET /api/v1/inventory - Get live kitchen tray stock
router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: store.getInventory(),
  });
});

// POST /api/v1/inventory/restock - Restock a sweet batch (e.g. +5kg)
router.post('/restock', (req, res) => {
  const { id, addKg } = req.body;
  if (!id || typeof addKg !== 'number') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Sweet ID and addKg number are required' },
    });
  }

  const updated = store.restockItem(id, addKg);
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Item not found in inventory' },
    });
  }

  res.json({
    success: true,
    data: updated,
  });
});

export default router;
