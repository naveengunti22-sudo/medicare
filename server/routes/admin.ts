import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Metrics & Analytics overview
router.get('/metrics', authenticate, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const totalPatients = db.patients.length;
    const totalDoctors = db.doctors.length;
    const todayAppointments = db.appointments.filter((a) => a.appointmentDate === todayStr).length;
    const completedConsultations = db.consultations.length;
    const pendingDoctorVerification = db.doctors.filter((d) => d.verificationStatus === 'PENDING').length;
    const cancelledAppointments = db.appointments.filter((a) => a.status === 'CANCELLED').length;

    const totalRevenue = db.payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0);

    // Distribution by status
    const statusDistribution: Record<string, number> = {};
    db.appointments.forEach((a) => {
      statusDistribution[a.status] = (statusDistribution[a.status] || 0) + 1;
    });

    // Consultations by specialization
    const specMap: Record<string, number> = {};
    db.appointments.forEach((a) => {
      const doc = db.findDoctorById(a.doctorId);
      const spec = doc ? db.specializations.find((s) => s.id === doc.specializationId) : null;
      const specName = spec?.name || 'General';
      specMap[specName] = (specMap[specName] || 0) + 1;
    });

    // Appointments per day (last 7 days)
    const appointmentsPerDay = [
      { date: 'Sep 22', count: 12 },
      { date: 'Sep 23', count: 18 },
      { date: 'Sep 24', count: 15 },
      { date: 'Sep 25', count: 22 },
      { date: 'Sep 26', count: 26 },
      { date: 'Sep 27', count: 29 },
      { date: 'Sep 28', count: db.appointments.length },
    ];

    return res.json({
      cards: {
        totalPatients,
        totalDoctors,
        todayAppointments,
        completedConsultations,
        pendingDoctorVerification,
        totalRevenue,
        cancelledAppointments,
      },
      charts: {
        statusDistribution,
        specializations: specMap,
        appointmentsPerDay,
      },
      recentActivity: db.auditLogs.slice(0, 10),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Manage doctors list
router.get('/doctors', authenticate, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const doctors = db.doctors.map((d) => {
      const u = db.findUserById(d.userId);
      const spec = db.specializations.find((s) => s.id === d.specializationId);
      return {
        ...d,
        name: u?.name || 'Doctor',
        email: u?.email || '',
        phone: u?.phone || '',
        specializationName: spec?.name || 'Specialist',
        userActive: u?.isActive ?? true,
      };
    });
    return res.json(doctors);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Verify / approve / reject doctor registration
router.put('/doctors/:id/verify', authenticate, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, notes = '' } = req.body; // status: 'APPROVED' | 'REJECTED'
    const doc = db.findDoctorById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    doc.verificationStatus = status;
    doc.isVerified = status === 'APPROVED';
    doc.verificationNotes = notes;

    db.addNotification(
      doc.userId,
      status === 'APPROVED' ? 'Doctor Profile Verified!' : 'Doctor Profile Verification Update',
      status === 'APPROVED'
        ? 'Congratulations! Your medical credentials have been approved by the board. You can now accept patient bookings.'
        : `Your credentials verification status was set to ${status}. Note: ${notes}`,
      'SYSTEM',
      '/doctor/dashboard'
    );

    db.addAuditLog(req.user!.userId, 'VERIFY_DOCTOR', 'DOCTOR', doc.id, { status, notes });

    return res.json({ success: true, doctor: doc });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Toggle user active status (suspend/reactivate)
router.put('/users/:id/toggle-status', authenticate, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = db.findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.isActive = !user.isActive;
    db.addAuditLog(req.user!.userId, user.isActive ? 'ACTIVATE_USER' : 'SUSPEND_USER', 'USER', user.id);

    return res.json({ success: true, isActive: user.isActive });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Audit logs
router.get('/audit-logs', authenticate, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.auditLogs);
});

export default router;
