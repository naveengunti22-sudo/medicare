import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get notifications for authenticated user
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const notifications = db.notifications.filter((n) => n.userId === userId);
    return res.json(notifications);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Mark single notification read
router.put('/:id/read', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const notif = db.notifications.find((n) => n.id === req.params.id && n.userId === req.user!.userId);
    if (notif) {
      notif.isRead = true;
    }
    return res.json({ success: true, notification: notif });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Mark all read
router.put('/read-all', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    db.notifications.forEach((n) => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
