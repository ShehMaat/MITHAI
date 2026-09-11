import { Router } from 'express';

const router = Router();

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'order' | 'promo' | 'loyalty' | 'system';
  targetPhone?: string;
  orderId?: string;
  read: boolean;
  createdAt: string;
}

// In-memory notification registry
const notifications: NotificationItem[] = [
  {
    id: 'notif-01',
    title: '🎉 Welcome to Royal Gold Club',
    body: 'You have been awarded 450 introductory loyalty points. Enjoy 10% off on your next pure desi ghee box.',
    type: 'loyalty',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-02',
    title: '🌸 Festive Special: Fresh Malpua Live!',
    body: 'Fresh hot Rabdi Malpua is now being prepared in our open bilona kadhai. Limited batches daily.',
    type: 'promo',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// GET /api/v1/notifications - Get customer notification history
router.get('/', (req, res) => {
  const phone = req.query.phone as string;
  const filtered = phone
    ? notifications.filter((n) => !n.targetPhone || n.targetPhone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, ''))
    : notifications;

  res.json({
    success: true,
    data: filtered,
  });
});

// POST /api/v1/notifications/send - Send transactional or promotional notification
router.post('/send', (req, res) => {
  const { title, body, type = 'order', targetPhone, orderId } = req.body;

  if (!title || !body) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'Title and body are required' },
    });
  }

  const newNotif: NotificationItem = {
    id: `notif-${Date.now()}`,
    title,
    body,
    type,
    targetPhone,
    orderId,
    read: false,
    createdAt: new Date().toISOString(),
  };

  notifications.unshift(newNotif);

  console.log(`\n========================================`);
  console.log(`🔔 [TRANSACTIONAL NOTIFICATION DISPATCH]`);
  console.log(`Type: ${type.toUpperCase()}`);
  console.log(`Target: ${targetPhone || 'ALL CUSTOMERS'}`);
  console.log(`Title: ${title}`);
  console.log(`Body: ${body}`);
  if (orderId) console.log(`Order: ${orderId}`);
  console.log(`========================================\n`);

  res.status(201).json({
    success: true,
    data: newNotif,
  });
});

// PATCH /api/v1/notifications/:id/read - Mark notification as read
router.patch('/:id/read', (req, res) => {
  const item = notifications.find((n) => n.id === req.params.id);
  if (!item) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Notification not found' },
    });
  }

  item.read = true;
  res.json({
    success: true,
    data: item,
  });
});

export default router;
