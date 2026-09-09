import { Router } from 'express';
import { store } from '../data/store.js';

const router = Router();

// GET /api/v1/products - List all sweets (with optional ?category= filter)
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let list = store.getProducts();

  if (category && category !== 'All Sweets') {
    list = list.filter((p) => p.category === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    data: list,
    meta: { total: list.length, timestamp: new Date().toISOString() },
  });
});

// GET /api/v1/products/categories - List available category tags
router.get('/categories', (_req, res) => {
  res.json({
    success: true,
    data: store.getCategories(),
  });
});

// GET /api/v1/products/:id - Single sweet details with variants
router.get('/:id', (req, res) => {
  const product = store.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Sweet not found in current kitchen batch' },
    });
  }
  res.json({ success: true, data: product });
});

// POST /api/v1/products/:id/reviews - Submit customer review
router.post('/:id/reviews', (req, res) => {
  const { rating, author, text } = req.body || {};
  if (!rating || !text) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Rating (1-5) and review text are required' },
    });
  }

  const updated = store.addProductReview(req.params.id, {
    rating: Number(rating) || 5,
    author: author || 'Verified Connoisseur',
    text,
  });

  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Product not found' },
    });
  }

  res.status(201).json({
    success: true,
    data: updated,
  });
});

export default router;
