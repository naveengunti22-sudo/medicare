import { Router, Response } from 'express';
import { db, Followup } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Create follow-up recommendation (Doctor)
router.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { consultationId, recommendedDate, reason } = req.body;
    if (!consultationId || !recommendedDate || !reason) {
      return res.status(400).json({ error: 'Consultation ID, recommended date, and reason are required.' });
    }

    const consultation = db.consultations.find((c) => c.id === consultationId);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found.' });
    }

    const followupId = `flw-${Date.now()}`;
    const newFollowup: Followup = {
      id: followupId,
      consultationId,
      patientId: consultation.patientId,
      doctorId: consultation.doctorId,
      recommendedDate,
      reason,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    db.followups.unshift(newFollowup);

    const doctor = db.findDoctorById(consultation.doctorId);
    const doctorUser = doctor ? db.findUserById(doctor.userId) : null;
    const patient = db.findPatientById(consultation.patientId);

    if (patient) {
      db.addNotification(
        patient.userId,
        'Follow-up Recommended',
        `Dr. ${doctorUser?.name || 'Doctor'} recommended a follow-up consultation on or around ${recommendedDate}.`,
        'FOLLOWUP',
        '/patient/followups'
      );
    }

    db.addAuditLog(req.user!.userId, 'CREATE_FOLLOWUP', 'FOLLOWUP', followupId);

    return res.status(201).json({ success: true, followup: newFollowup });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// List follow-ups for user
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = req.user!.role;
    let list: Followup[] = [];

    if (role === 'PATIENT') {
      const patientId = req.user!.patientId || db.findPatientByUserId(req.user!.userId)?.id;
      list = db.followups.filter((f) => f.patientId === patientId);
    } else if (role === 'DOCTOR') {
      const doctorId = req.user!.doctorId || db.findDoctorByUserId(req.user!.userId)?.id;
      list = db.followups.filter((f) => f.doctorId === doctorId);
    } else {
      list = db.followups;
    }

    const enriched = list.map((f) => {
      const doctor = db.findDoctorById(f.doctorId);
      const doctorUser = doctor ? db.findUserById(doctor.userId) : null;
      const spec = doctor ? db.specializations.find((s) => s.id === doctor.specializationId) : null;

      const consultation = db.consultations.find((c) => c.id === f.consultationId);
      const patient = db.findPatientById(f.patientId);
      const patientUser = patient ? db.findUserById(patient.userId) : null;

      return {
        ...f,
        doctor: {
          id: doctor?.id,
          name: doctorUser?.name || 'Dr. Doctor',
          specializationName: spec?.name || 'Specialist',
          avatarUrl: doctorUser?.avatarUrl,
          consultationFee: doctor?.consultationFee,
        },
        patient: {
          id: patient?.id,
          name: patientUser?.name || 'Patient',
        },
        consultationNotes: consultation?.diagnosisNotes || '',
        chiefComplaint: consultation?.chiefComplaint || '',
      };
    });

    return res.json(enriched);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
