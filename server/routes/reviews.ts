import { Router, Response } from 'express';
import { db, Review } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Post review after consultation
router.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { appointmentId, rating, comment = '' } = req.body;
    if (!appointmentId || !rating) {
      return res.status(400).json({ error: 'Appointment ID and rating (1-5) are required.' });
    }

    const appt = db.appointments.find((a) => a.id === appointmentId);
    if (!appt) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const patientId = req.user!.patientId || db.findPatientByUserId(req.user!.userId)?.id;
    if (!patientId) {
      return res.status(400).json({ error: 'Patient profile required.' });
    }

    // Check if already reviewed
    const existing = db.reviews.find((r) => r.appointmentId === appointmentId);
    if (existing) {
      existing.rating = Number(rating);
      existing.comment = comment;
      return res.json({ success: true, review: existing });
    }

    const reviewId = `rev-${Date.now()}`;
    const newReview: Review = {
      id: reviewId,
      appointmentId,
      doctorId: appt.doctorId,
      patientId,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment,
      createdAt: new Date().toISOString(),
    };

    db.reviews.unshift(newReview);

    // Recalculate doctor rating
    const doctorReviews = db.reviews.filter((r) => r.doctorId === appt.doctorId);
    const doctor = db.findDoctorById(appt.doctorId);
    if (doctor && doctorReviews.length > 0) {
      const avg = doctorReviews.reduce((sum, r) => sum + r.rating, 0) / doctorReviews.length;
      doctor.rating = Number(avg.toFixed(2));
      doctor.totalReviews = doctorReviews.length;
    }

    db.addAuditLog(req.user!.userId, 'ADD_REVIEW', 'REVIEW', reviewId, { rating });

    return res.status(201).json({ success: true, review: newReview });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Doctor reviews
router.get('/doctor/:doctorId', (req, res) => {
  const reviews = db.reviews.filter((r) => r.doctorId === req.params.doctorId);
  const enriched = reviews.map((r) => {
    const pat = db.findPatientById(r.patientId);
    const patUser = pat ? db.findUserById(pat.userId) : null;
    return {
      ...r,
      patientName: patUser?.name || 'Verified Patient',
      patientAvatar: patUser?.avatarUrl,
    };
  });
  return res.json(enriched);
});

export default router;
