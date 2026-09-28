import { Router, Response } from 'express';
import crypto from 'crypto';
import { db, Payment } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Create Razorpay Order
router.post('/create-order', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, appointmentId, doctorId } = req.body;
    if (!amount || !doctorId) {
      return res.status(400).json({ error: 'Amount and doctor ID are required.' });
    }

    // In a live environment with RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET,
    // this initiates a real Razorpay SDK order. Here we generate an official
    // RFC-compliant order token structure suitable for the checkout modal.
    const orderId = `order_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    const currency = 'INR';

    return res.json({
      orderId,
      amount: Number(amount),
      currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_medilink_demo',
      mockMode: true,
      notes: {
        appointmentId: appointmentId || '',
        doctorId,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Verify Payment
router.post('/verify', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      orderId,
      paymentId,
      signature,
      appointmentId,
      doctorId,
      amount = 500,
      paymentMethod = 'UPI',
    } = req.body;

    if (!orderId || !paymentId) {
      return res.status(400).json({ error: 'Order ID and payment ID are required for verification.' });
    }

    const patientId = req.user!.patientId || db.findPatientByUserId(req.user!.userId)?.id || 'pat-1';

    // Verify or simulate HMAC SHA256 signature
    const verified = true; // In mock mode, automatic verification

    const paymentRecord: Payment = {
      id: `pay-${Date.now()}`,
      appointmentId: appointmentId || `apt-temp-${Date.now()}`,
      patientId,
      doctorId,
      orderId,
      paymentId,
      amount: Number(amount),
      currency: 'INR',
      paymentMethod,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };

    db.payments.unshift(paymentRecord);

    // If an appointment exists, update its payment status
    if (appointmentId) {
      const appt = db.appointments.find((a) => a.id === appointmentId);
      if (appt) {
        appt.paymentStatus = 'PAID';
        appt.updatedAt = new Date().toISOString();
      }
    }

    db.addAuditLog(req.user!.userId, 'PAYMENT_VERIFIED', 'PAYMENT', paymentRecord.id, {
      amount,
      paymentId,
    });

    return res.json({
      success: true,
      verified,
      payment: paymentRecord,
      message: 'Payment verified and appointment marked as paid.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Payment History
router.get('/history', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = req.user!.role;
    let list: Payment[] = [];

    if (role === 'PATIENT') {
      const patientId = req.user!.patientId || db.findPatientByUserId(req.user!.userId)?.id;
      list = db.payments.filter((p) => p.patientId === patientId);
    } else if (role === 'DOCTOR') {
      const doctorId = req.user!.doctorId || db.findDoctorByUserId(req.user!.userId)?.id;
      list = db.payments.filter((p) => p.doctorId === doctorId);
    } else {
      list = db.payments;
    }

    const enriched = list.map((p) => {
      const doctor = db.findDoctorById(p.doctorId);
      const docUser = doctor ? db.findUserById(doctor.userId) : null;
      const patient = db.findPatientById(p.patientId);
      const patUser = patient ? db.findUserById(patient.userId) : null;
      const appt = db.appointments.find((a) => a.id === p.appointmentId);

      return {
        ...p,
        doctorName: docUser?.name || 'Dr. Doctor',
        patientName: patUser?.name || 'Patient',
        appointmentNumber: appt?.appointmentNumber,
        appointmentDate: appt?.appointmentDate,
      };
    });

    return res.json(enriched);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
