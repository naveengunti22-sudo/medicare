import { Router, Response } from 'express';
import { db, Prescription, PrescriptionItem } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Create digital prescription (Doctor only)
router.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      appointmentId,
      diagnosis,
      generalAdvice = '',
      labTestsRecommended = '',
      followupDate,
      items = [],
    } = req.body;

    if (!appointmentId || !diagnosis) {
      return res.status(400).json({ error: 'Appointment ID and diagnosis are required.' });
    }

    const appt = db.appointments.find((a) => a.id === appointmentId);
    if (!appt) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    let consultation = db.consultations.find((c) => c.appointmentId === appointmentId);
    if (!consultation) {
      consultation = {
        id: `c-${Date.now()}`,
        appointmentId: appt.id,
        doctorId: appt.doctorId,
        patientId: appt.patientId,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        consultationDurationSeconds: 600,
        chiefComplaint: appt.symptomsDescription,
        diagnosisNotes: diagnosis,
        physicalExamNeeded: false,
        connectionModeUsed: 'VIDEO',
        createdAt: new Date().toISOString(),
      };
      db.consultations.push(consultation);
    }

    const rxId = `rx-${Date.now()}`;
    const rxNumber = `RX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const formattedItems: PrescriptionItem[] = items.map((it: any, idx: number) => ({
      id: `rx-item-${Date.now()}-${idx}`,
      medicineName: it.medicineName || 'Medicine',
      dosage: it.dosage || '1 tablet',
      frequency: it.frequency || '1-0-1',
      duration: it.duration || '5 Days',
      instructions: it.instructions || 'After meals',
    }));

    const newPrescription: Prescription = {
      id: rxId,
      prescriptionNumber: rxNumber,
      consultationId: consultation.id,
      appointmentId: appt.id,
      doctorId: appt.doctorId,
      patientId: appt.patientId,
      diagnosis,
      generalAdvice,
      labTestsRecommended,
      followupDate,
      items: formattedItems,
      createdAt: new Date().toISOString(),
    };

    // If already exists, replace or update
    const existingIdx = db.prescriptions.findIndex((p) => p.appointmentId === appt.id);
    if (existingIdx !== -1) {
      db.prescriptions[existingIdx] = newPrescription;
    } else {
      db.prescriptions.unshift(newPrescription);
    }

    // Auto-create follow-up reminder if follow-up date is set
    if (followupDate) {
      const existingFlw = db.followups.find((f) => f.consultationId === consultation!.id);
      if (!existingFlw) {
        db.followups.unshift({
          id: `flw-${Date.now()}`,
          consultationId: consultation.id,
          patientId: appt.patientId,
          doctorId: appt.doctorId,
          recommendedDate: followupDate,
          reason: `Review after completing course of ${diagnosis}.`,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        });
      }
    }

    const patient = db.findPatientById(appt.patientId);
    if (patient) {
      db.addNotification(
        patient.userId,
        'Prescription Ready',
        `Dr. has issued your digital prescription (${rxNumber}). You can view and download it now.`,
        'PRESCRIPTION',
        `/patient/prescriptions`
      );
    }

    db.addAuditLog(req.user!.userId, 'CREATE_PRESCRIPTION', 'PRESCRIPTION', rxId, {
      rxNumber,
      itemsCount: formattedItems.length,
    });

    return res.status(201).json({
      success: true,
      prescription: newPrescription,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get prescription by ID
router.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const rx = db.prescriptions.find((p) => p.id === req.params.id || p.prescriptionNumber === req.params.id);
  if (!rx) {
    return res.status(404).json({ error: 'Prescription not found.' });
  }

  const doctor = db.findDoctorById(rx.doctorId);
  const doctorUser = doctor ? db.findUserById(doctor.userId) : null;
  const spec = doctor ? db.specializations.find((s) => s.id === doctor.specializationId) : null;

  const patient = db.findPatientById(rx.patientId);
  const patientUser = patient ? db.findUserById(patient.userId) : null;

  return res.json({
    ...rx,
    doctor: {
      id: doctor?.id,
      name: doctorUser?.name || 'Dr. Doctor',
      qualification: doctor?.qualification,
      registrationNumber: doctor?.registrationNumber,
      specializationName: spec?.name,
      clinicAddress: doctor?.clinicAddress,
      city: doctor?.city,
    },
    patient: {
      id: patient?.id,
      name: patientUser?.name || 'Patient',
      age: patient?.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 'N/A',
      gender: patient?.gender,
      bloodGroup: patient?.bloodGroup,
      allergies: patient?.allergies,
    },
  });
});

// List prescriptions for current patient
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    let list: Prescription[] = [];
    if (req.user!.role === 'PATIENT') {
      const patientId = req.user!.patientId || db.findPatientByUserId(req.user!.userId)?.id;
      list = db.prescriptions.filter((p) => p.patientId === patientId);
    } else if (req.user!.role === 'DOCTOR') {
      const doctorId = req.user!.doctorId || db.findDoctorByUserId(req.user!.userId)?.id;
      list = db.prescriptions.filter((p) => p.doctorId === doctorId);
    } else {
      list = db.prescriptions;
    }

    const enriched = list.map((rx) => {
      const doctor = db.findDoctorById(rx.doctorId);
      const doctorUser = doctor ? db.findUserById(doctor.userId) : null;
      const spec = doctor ? db.specializations.find((s) => s.id === doctor.specializationId) : null;

      const patient = db.findPatientById(rx.patientId);
      const patientUser = patient ? db.findUserById(patient.userId) : null;

      return {
        ...rx,
        doctor: {
          id: doctor?.id,
          name: doctorUser?.name || 'Dr. Doctor',
          specializationName: spec?.name || 'Specialist',
          qualification: doctor?.qualification,
          regNo: doctor?.registrationNumber,
          clinicAddress: doctor?.clinicAddress,
          city: doctor?.city,
        },
        patient: {
          id: patient?.id,
          name: patientUser?.name || 'Patient',
          age: patient?.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 'N/A',
          gender: patient?.gender,
          bloodGroup: patient?.bloodGroup,
        },
      };
    });

    return res.json(enriched);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
