import { Router } from 'express';
import { store } from '../data/store.js';

const router = Router();

// GET /api/v1/slots - Get available delivery & pickup slots
router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: store.getSlots(),
  });
});

export default router;
