import { Router } from 'express';
import { store } from '../data/store.js';

const router = Router();

// Store active OTPs in memory
const activeOtps = new Map<string, string>();

// POST /api/v1/auth/send-otp
router.post('/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PHONE', message: 'Valid phone number is required' },
    });
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const demoOtp = '4920'; // Standard demo OTP
  activeOtps.set(cleanPhone, demoOtp);

  res.json({
    success: true,
    data: {
      message: `OTP sent successfully to +91 ${cleanPhone}`,
      demoOtp,
      expiresInSeconds: 300,
    },
  });
});

// POST /api/v1/auth/verify-otp
router.post('/verify-otp', (req, res) => {
  const { phone, otp, name } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'Phone and OTP are required' },
    });
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const storedOtp = activeOtps.get(cleanPhone) || '4920';

  if (String(otp).trim() !== storedOtp && String(otp).trim() !== '4920') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_OTP', message: 'Invalid 4-digit OTP. Demo code is 4920' },
    });
  }

  const user = store.upsertUser({ phone: cleanPhone, name });
  activeOtps.delete(cleanPhone);

  res.json({
    success: true,
    data: {
      user,
      token: `token_${user.id}_${Date.now()}`,
      message: 'Authentication successful! Welcome to Gaurav Bhai Ki Mithai.',
    },
  });
});

// GET /api/v1/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'No authorization token provided' },
    });
  }

  // Return default profile
  const user = store.getUserByPhone('9876543210') || store.upsertUser({ phone: '9876543210', name: 'Gaurav Jain' });

  res.json({
    success: true,
    data: user,
  });
});

// GET /api/v1/auth/addresses
router.get('/addresses', (req, res) => {
  const phone = (req.query.phone as string) || '9876543210';
  const addresses = store.getUserAddresses(phone);
  res.json({
    success: true,
    data: addresses,
  });
});

// POST /api/v1/auth/addresses
router.post('/addresses', (req, res) => {
  const { phone, address } = req.body;
  const userPhone = phone || '9876543210';
  const added = store.addUserAddress(userPhone, address);
  if (added) {
    res.json({
      success: true,
      data: added,
    });
  } else {
    res.status(404).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    });
  }
});

export default router;
