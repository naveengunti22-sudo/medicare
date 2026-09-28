import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Specializations
router.get('/specializations', (req, res) => {
  return res.json(db.specializations);
});

// Search & List Doctors
router.get('/', (req, res) => {
  try {
    const {
      search,
      specialization,
      language,
      status,
      mode,
      maxFee,
      minExperience,
      city,
    } = req.query;

    let doctors = db.getAllDoctorsWithDetails();

    // Filter by verification status (admins can see unverified, patients only verified)
    doctors = doctors.filter((d: any) => d.isVerified);

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      doctors = doctors.filter(
        (d: any) =>
          d.name.toLowerCase().includes(q) ||
          d.specializationName.toLowerCase().includes(q) ||
          d.qualification.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q)
      );
    }

    if (specialization && typeof specialization === 'string' && specialization !== 'all') {
      doctors = doctors.filter(
        (d: any) =>
          d.specializationId === specialization ||
          d.specializationSlug === specialization ||
          d.specializationName.toLowerCase() === specialization.toLowerCase()
      );
    }

    if (language && typeof language === 'string' && language !== 'all') {
      doctors = doctors.filter((d: any) => d.languages && d.languages.includes(language));
    }

    if (status && typeof status === 'string' && status !== 'all') {
      doctors = doctors.filter((d: any) => d.currentStatus === status);
    }

    if (mode && typeof mode === 'string') {
      if (mode === 'VIDEO') doctors = doctors.filter((d: any) => d.videoEnabled);
      if (mode === 'AUDIO') doctors = doctors.filter((d: any) => d.audioEnabled);
      if (mode === 'CHAT') doctors = doctors.filter((d: any) => d.chatEnabled);
    }

    if (maxFee) {
      const feeNum = Number(maxFee);
      if (!isNaN(feeNum)) {
        doctors = doctors.filter((d: any) => d.consultationFee <= feeNum);
      }
    }

    if (minExperience) {
      const expNum = Number(minExperience);
      if (!isNaN(expNum)) {
        doctors = doctors.filter((d: any) => d.experienceYears >= expNum);
      }
    }

    if (city && typeof city === 'string' && city !== 'all') {
      doctors = doctors.filter((d: any) => d.city.toLowerCase().includes(city.toLowerCase()));
    }

    return res.json(doctors);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching doctors' });
  }
});

// Single Doctor Details
router.get('/:id', (req, res) => {
  const details = db.getDoctorFullDetails(req.params.id);
  if (!details) {
    return res.status(404).json({ error: 'Doctor not found.' });
  }
  return res.json(details);
});

// Doctor updates availability status (Available, In Consultation, On Break, Offline)
router.put('/status', authenticate, requireRole(['DOCTOR']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    const allowed = ['AVAILABLE', 'IN_CONSULTATION', 'ON_BREAK', 'OFFLINE'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status code.' });
    }

    const doctor = db.findDoctorByUserId(req.user!.userId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found.' });
    }

    doctor.currentStatus = status;
    db.addAuditLog(req.user!.userId, 'UPDATE_DOCTOR_STATUS', 'DOCTOR', doctor.id, { newStatus: status });

    return res.json({
      success: true,
      currentStatus: doctor.currentStatus,
      doctor: db.getDoctorFullDetails(doctor.id),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Doctor updates profile, fee, languages, slots
router.put('/profile', authenticate, requireRole(['DOCTOR']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const doctor = db.findDoctorByUserId(req.user!.userId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found.' });
    }

    const { consultationFee, bio, languages, clinicAddress, city, qualification, experienceYears, slots } = req.body;

    if (consultationFee !== undefined) doctor.consultationFee = Number(consultationFee);
    if (bio !== undefined) doctor.bio = bio;
    if (languages && Array.isArray(languages)) doctor.languages = languages;
    if (clinicAddress !== undefined) doctor.clinicAddress = clinicAddress;
    if (city !== undefined) doctor.city = city;
    if (qualification !== undefined) doctor.qualification = qualification;
    if (experienceYears !== undefined) doctor.experienceYears = Number(experienceYears);
    if (slots && Array.isArray(slots)) doctor.slots = slots;

    db.addAuditLog(req.user!.userId, 'UPDATE_DOCTOR_PROFILE', 'DOCTOR', doctor.id);

    return res.json({
      success: true,
      doctor: db.getDoctorFullDetails(doctor.id),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
