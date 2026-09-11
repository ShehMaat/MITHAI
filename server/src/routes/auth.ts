import { Router } from 'express';
import { store } from '../data/store.js';
import { smsService } from '../services/smsService.js';

const router = Router();

// Store active OTPs in memory with expiration
const activeOtps = new Map<string, { otp: string; expiresAt: number }>();

// POST /api/v1/auth/send-otp
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PHONE', message: 'Valid phone number is required' },
    });
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  // Generate random 4-digit OTP (e.g. 7492), or allow demo code 4920
  const generatedOtp = smsService.generateOtp(4);
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins
  activeOtps.set(cleanPhone, { otp: generatedOtp, expiresAt });

  const sendResult = await smsService.sendOtp(cleanPhone, generatedOtp);

  res.json({
    success: true,
    data: {
      message: sendResult.message,
      provider: sendResult.provider,
      demoOtp: sendResult.demoOtp || '4920',
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

  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  const otpRecord = activeOtps.get(cleanPhone);
  const inputOtp = String(otp).trim();

  // Check if expired
  if (otpRecord && Date.now() > otpRecord.expiresAt) {
    activeOtps.delete(cleanPhone);
    return res.status(400).json({
      success: false,
      error: { code: 'OTP_EXPIRED', message: 'OTP has expired. Please request a new code.' },
    });
  }

  const isValid =
    (otpRecord && inputOtp === otpRecord.otp) ||
    inputOtp === '4920'; // Always accept demo master code

  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_OTP', message: 'Invalid 4-digit OTP. Please check the code sent to your phone.' },
    });
  }

  const user = store.upsertUser({ phone: cleanPhone, name });
  activeOtps.delete(cleanPhone);

  res.json({
    success: true,
    data: {
      user,
      token: `token_${user.id}_${Date.now()}`,
      role: user.role,
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

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const parts = token.split('_');
  let user = null;
  if (parts.length >= 3 && parts[1]) {
    user = store.getUserById(parts[1]);
  }
  if (!user) {
    user = store.getUserByPhone('9876543210') || store.upsertUser({ phone: '9876543210', name: 'Gaurav Jain' });
  }

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
