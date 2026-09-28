import { Router, Response } from 'express';
import { db, Referral } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Create referral for physical examination
router.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      consultationId,
      referralReason,
      recommendedFacilityName,
      recommendedFacilityAddress,
      facilityContactPhone,
      urgencyLevel = 'ROUTINE',
    } = req.body;

    if (!consultationId || !referralReason || !recommendedFacilityName) {
      return res.status(400).json({ error: 'Consultation ID, reason, and facility name are required.' });
    }

    const consultation = db.consultations.find((c) => c.id === consultationId);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found.' });
    }

    consultation.physicalExamNeeded = true;

    const referralId = `ref-${Date.now()}`;
    const newReferral: Referral = {
      id: referralId,
      consultationId,
      patientId: consultation.patientId,
      doctorId: consultation.doctorId,
      referralReason,
      recommendedFacilityName,
      recommendedFacilityAddress: recommendedFacilityAddress || 'City General Hospital Outpatient Wing',
      facilityContactPhone: facilityContactPhone || '+91 40 2345 6789',
      urgencyLevel,
      createdAt: new Date().toISOString(),
    };

    db.referrals.unshift(newReferral);

    const doctor = db.findDoctorById(consultation.doctorId);
    const doctorUser = doctor ? db.findUserById(doctor.userId) : null;
    const patient = db.findPatientById(consultation.patientId);

    if (patient) {
      db.addNotification(
        patient.userId,
        'Physical Examination Referral Issued',
        `Dr. ${doctorUser?.name || 'Doctor'} has referred you for an in-person physical examination at ${recommendedFacilityName}.`,
        'CONSULTATION',
        '/patient/referrals'
      );
    }

    db.addAuditLog(req.user!.userId, 'CREATE_REFERRAL', 'REFERRAL', referralId, { urgencyLevel });

    return res.status(201).json({ success: true, referral: newReferral });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// List referrals for patient or doctor
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = req.user!.role;
    let list: Referral[] = [];

    if (role === 'PATIENT') {
      const patientId = req.user!.patientId || db.findPatientByUserId(req.user!.userId)?.id;
      list = db.referrals.filter((r) => r.patientId === patientId);
    } else if (role === 'DOCTOR') {
      const doctorId = req.user!.doctorId || db.findDoctorByUserId(req.user!.userId)?.id;
      list = db.referrals.filter((r) => r.doctorId === doctorId);
    } else {
      list = db.referrals;
    }

    const enriched = list.map((r) => {
      const doctor = db.findDoctorById(r.doctorId);
      const doctorUser = doctor ? db.findUserById(doctor.userId) : null;
      const spec = doctor ? db.specializations.find((s) => s.id === doctor.specializationId) : null;
      const patient = db.findPatientById(r.patientId);
      const patientUser = patient ? db.findUserById(patient.userId) : null;

      // Recommended nearby partnered facilities based on city
      const nearbyFacilities = [
        {
          name: r.recommendedFacilityName,
          address: r.recommendedFacilityAddress,
          phone: r.facilityContactPhone,
          distance: '2.4 km away',
          timings: '08:00 AM - 08:00 PM',
          services: ['Emergency Care', 'Laboratory', 'Ultrasound & X-Ray', 'OPD Clinics'],
        },
        {
          name: 'Apollo Health City - Diagnostic & In-Person Care',
          address: 'Road No 72, Film Nagar, Jubilee Hills',
          phone: '+91 40 2360 7777',
          distance: '4.8 km away',
          timings: '24/7 Casualty & Outpatient',
          services: ['Comprehensive Diagnostics', 'Specialist Consultations', 'CT/MRI'],
        },
        {
          name: 'Care Hospitals - Outpatient Diagnostic Clinic',
          address: 'Old Mumbai Highway, Gachibowli',
          phone: '+91 40 3041 8888',
          distance: '5.1 km away',
          timings: '09:00 AM - 09:00 PM',
          services: ['Physical Examination', 'ECG', 'Pathology Lab'],
        },
      ];

      return {
        ...r,
        doctorName: doctorUser?.name || 'Dr. Doctor',
        specialization: spec?.name || 'Specialist',
        patientName: patientUser?.name || 'Patient',
        nearbyFacilities,
      };
    });

    return res.json(enriched);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
