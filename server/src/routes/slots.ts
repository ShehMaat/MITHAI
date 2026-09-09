import { Router } from 'express';
import { store } from '../data/store.js';

const router = Router();

// GET /api/v1/slots - Get available delivery & pickup slots
router.get('/', (_req, res) => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dynamicDates = [
    `Today (${today.getDate()} ${monthNames[today.getMonth()]})`,
    `Tomorrow (${tomorrow.getDate()} ${monthNames[tomorrow.getMonth()]})`,
  ];

  const slots = store.getSlots();
  res.json({
    success: true,
    data: {
      dates: dynamicDates,
      timeSlots: slots.timeSlots || ['5:00 PM - 6:00 PM', '6:00 PM - 7:00 PM', '7:00 PM - 8:00 PM'],
    },
  });
});

export default router;
