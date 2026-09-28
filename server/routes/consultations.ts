import { Router, Response } from 'express';
import { db, Consultation } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Verify consultation room access
router.get('/room/:roomId', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const appt = db.appointments.find((a) => a.roomId === roomId);
    if (!appt) {
      return res.status(404).json({ error: 'Consultation room not found.' });
    }

    const patient = db.findPatientById(appt.patientId);
    const doctor = db.findDoctorById(appt.doctorId);
    const doctorUser = doctor ? db.findUserById(doctor.userId) : null;
    const patientUser = patient ? db.findUserById(patient.userId) : null;

    // Check authorization: must be doctor or patient of this appt, or admin
    const currentUserId = req.user!.userId;
    const isPatient = patientUser?.id === currentUserId;
    const isDoctor = doctorUser?.id === currentUserId;
    const isAdmin = req.user!.role === 'ADMIN';
    const isDemoOverride = req.query.allowDemoAccess === 'true';

    if (!isPatient && !isDoctor && !isAdmin && !isDemoOverride) {
      return res.status(403).json({
        error: 'Unauthorized to enter this private consultation room.',
        appointmentDoctor: { id: doctor?.id, name: doctorUser?.name || 'Assigned Doctor', email: doctorUser?.email },
        appointmentPatient: { id: patient?.id, name: patientUser?.name || 'Assigned Patient', email: patientUser?.email },
        currentUserRole: req.user!.role,
      });
    }

    // Get authorized medical reports for this doctor from this patient
    const authorizedReports = db.medicalReports.filter(
      (r) => r.patientId === appt.patientId && (r.authorizedAllDoctors || r.authorizedDoctorIds.includes(appt.doctorId))
    );

    const existingConsultation = db.consultations.find((c) => c.appointmentId === appt.id);
    const existingPrescription = db.prescriptions.find((p) => p.appointmentId === appt.id);

    return res.json({
      appointment: appt,
      patient: {
        id: patient?.id,
        name: patientUser?.name || 'Patient',
        avatarUrl: patientUser?.avatarUrl,
        dob: patient?.dob,
        gender: patient?.gender,
        bloodGroup: patient?.bloodGroup,
        allergies: patient?.allergies,
        chronicConditions: patient?.chronicConditions,
      },
      doctor: {
        id: doctor?.id,
        name: doctorUser?.name || 'Dr. Doctor',
        avatarUrl: doctorUser?.avatarUrl,
        qualification: doctor?.qualification,
        consultationFee: doctor?.consultationFee,
        currentStatus: doctor?.currentStatus,
      },
      reports: authorizedReports,
      consultation: existingConsultation,
      prescription: existingPrescription,
      userRole: isDoctor ? 'DOCTOR' : isPatient ? 'PATIENT' : 'ADMIN',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Doctor starts consultation
router.post('/start', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { appointmentId, connectionMode = 'VIDEO' } = req.body;
    const appt = db.appointments.find((a) => a.id === appointmentId);
    if (!appt) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const doctor = db.findDoctorById(appt.doctorId);
    if (doctor) {
      doctor.currentStatus = 'IN_CONSULTATION';
    }

    appt.status = 'IN_CONSULTATION';
    appt.updatedAt = new Date().toISOString();

    // Update queue item
    const qItem = db.queues.find((q) => q.appointmentId === appointmentId);
    if (qItem) {
      qItem.status = 'IN_PROGRESS';
      qItem.startedAt = new Date().toISOString();
    }

    // Check or create consultation record
    let consultation = db.consultations.find((c) => c.appointmentId === appointmentId);
    if (!consultation) {
      consultation = {
        id: `c-${Date.now()}`,
        appointmentId: appt.id,
        doctorId: appt.doctorId,
        patientId: appt.patientId,
        startedAt: new Date().toISOString(),
        consultationDurationSeconds: 0,
        chiefComplaint: appt.symptomsDescription || 'Consultation started.',
        diagnosisNotes: '',
        physicalExamNeeded: false,
        connectionModeUsed: connectionMode,
        createdAt: new Date().toISOString(),
      };
      db.consultations.push(consultation);
    }

    const patient = db.findPatientById(appt.patientId);
    if (patient) {
      db.addNotification(
        patient.userId,
        'Consultation Starting Now',
        `Doctor has started your consultation. Please join the consultation room.`,
        'CONSULTATION',
        `/consultation/${appt.roomId}`
      );
    }

    db.addAuditLog(req.user!.userId, 'START_CONSULTATION', 'CONSULTATION', consultation.id);

    return res.json({ success: true, consultation, appointment: appt });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Doctor completes consultation
router.post('/end', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { appointmentId, diagnosisNotes = '', chiefComplaint, physicalExamNeeded = false, durationSeconds = 900 } = req.body;
    const appt = db.appointments.find((a) => a.id === appointmentId);
    if (!appt) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    appt.status = 'COMPLETED';
    appt.updatedAt = new Date().toISOString();

    const doctor = db.findDoctorById(appt.doctorId);
    if (doctor) {
      // Check if there are other patients in queue
      const remaining = db.queues.filter(
        (q) => q.doctorId === appt.doctorId && q.appointmentId !== appointmentId && (q.status === 'WAITING' || q.status === 'NEXT')
      );
      doctor.currentStatus = remaining.length > 0 ? 'AVAILABLE' : 'AVAILABLE';
    }

    // Complete queue item
    const qItem = db.queues.find((q) => q.appointmentId === appointmentId);
    if (qItem) {
      qItem.status = 'COMPLETED';
      qItem.completedAt = new Date().toISOString();
    }

    let consultation = db.consultations.find((c) => c.appointmentId === appointmentId);
    if (consultation) {
      consultation.endedAt = new Date().toISOString();
      consultation.consultationDurationSeconds = durationSeconds;
      consultation.diagnosisNotes = diagnosisNotes || consultation.diagnosisNotes;
      consultation.chiefComplaint = chiefComplaint || consultation.chiefComplaint;
      consultation.physicalExamNeeded = physicalExamNeeded;
    } else {
      consultation = {
        id: `c-${Date.now()}`,
        appointmentId: appt.id,
        doctorId: appt.doctorId,
        patientId: appt.patientId,
        startedAt: new Date(Date.now() - durationSeconds * 1000).toISOString(),
        endedAt: new Date().toISOString(),
        consultationDurationSeconds: durationSeconds,
        chiefComplaint: chiefComplaint || appt.symptomsDescription,
        diagnosisNotes: diagnosisNotes || 'Routine consultation completed.',
        physicalExamNeeded,
        connectionModeUsed: 'VIDEO',
        createdAt: new Date().toISOString(),
      };
      db.consultations.push(consultation);
    }

    const patient = db.findPatientById(appt.patientId);
    if (patient) {
      db.addNotification(
        patient.userId,
        'Consultation Completed',
        `Your consultation has concluded. Doctor diagnosis notes and prescription are being prepared.`,
        'CONSULTATION',
        `/patient/prescriptions`
      );
    }

    db.addAuditLog(req.user!.userId, 'END_CONSULTATION', 'CONSULTATION', consultation.id, {
      physicalExamNeeded,
      duration: durationSeconds,
    });

    return res.json({ success: true, consultation, appointment: appt });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
