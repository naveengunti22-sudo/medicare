import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, User, Patient, Doctor } from '../db.js';
import { generateToken, authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, phone, role = 'PATIENT', preferredLanguage = 'en', doctorData, patientData } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (db.findUserByEmail(email)) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newUser: User = {
      id: userId,
      name,
      email,
      passwordHash,
      phone: phone || '',
      role: role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT',
      preferredLanguage,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    let doctorId: string | undefined;
    let patientId: string | undefined;

    if (newUser.role === 'DOCTOR') {
      doctorId = `doc-${Date.now()}`;
      const newDoctor: Doctor = {
        id: doctorId,
        userId: newUser.id,
        specializationId: doctorData?.specializationId || 'spec-1',
        qualification: doctorData?.qualification || 'MBBS',
        experienceYears: Number(doctorData?.experienceYears) || 1,
        registrationNumber: doctorData?.registrationNumber || `REG-${Date.now()}`,
        consultationFee: Number(doctorData?.consultationFee) || 500,
        bio: doctorData?.bio || 'Dedicated medical professional.',
        currentStatus: 'AVAILABLE',
        isVerified: false,
        verificationStatus: 'PENDING',
        clinicAddress: doctorData?.clinicAddress || 'Clinic Address',
        city: doctorData?.city || 'Hyderabad',
        rating: 5.0,
        totalReviews: 0,
        videoEnabled: true,
        audioEnabled: true,
        chatEnabled: true,
        languages: doctorData?.languages || ['en'],
        slots: ['09:00 AM - 09:20 AM', '10:00 AM - 10:20 AM', '11:00 AM - 11:20 AM', '02:00 PM - 02:20 PM', '04:00 PM - 04:20 PM'],
        createdAt: new Date().toISOString(),
      };
      db.doctors.push(newDoctor);

      db.addNotification(
        'usr-admin-1',
        'New Doctor Registration Pending Verification',
        `Dr. ${newUser.name} registered and submitted credentials for approval.`,
        'SYSTEM',
        '/admin/doctors'
      );
    } else {
      patientId = `pat-${Date.now()}`;
      const newPatient: Patient = {
        id: patientId,
        userId: newUser.id,
        dob: patientData?.dob || '1995-01-01',
        gender: patientData?.gender || 'PREFER_NOT_TO_SAY',
        bloodGroup: patientData?.bloodGroup || 'Not specified',
        emergencyContactName: patientData?.emergencyContactName || '',
        emergencyContactPhone: patientData?.emergencyContactPhone || '',
        allergies: patientData?.allergies || 'None reported',
        chronicConditions: patientData?.chronicConditions || 'None reported',
        address: patientData?.address || '',
        city: patientData?.city || '',
      };
      db.patients.push(newPatient);
    }

    db.addAuditLog(newUser.id, 'USER_REGISTERED', 'USER', newUser.id, { role: newUser.role });

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      doctorId,
      patientId,
    });

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
        preferredLanguage: newUser.preferredLanguage,
        doctorId,
        patientId,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account has been suspended. Please contact support.' });
    }

    let doctorId: string | undefined;
    let patientId: string | undefined;

    if (user.role === 'DOCTOR') {
      const doc = db.findDoctorByUserId(user.id);
      doctorId = doc?.id;
    } else if (user.role === 'PATIENT') {
      const pat = db.findPatientByUserId(user.id);
      patientId = pat?.id;
    }

    db.addAuditLog(user.id, 'USER_LOGIN', 'USER', user.id);

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      doctorId,
      patientId,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        preferredLanguage: user.preferredLanguage,
        doctorId,
        patientId,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// Demo Login Shortcut (for easy 1-click evaluation)
router.post('/demo-login', (req, res) => {
  try {
    const { role = 'PATIENT', doctorKey = 'ananya' } = req.body;

    let targetEmail = 'patient@medilink.com';
    if (role === 'DOCTOR') {
      if (doctorKey === 'rahul') targetEmail = 'doctor.rahul@medilink.com';
      else if (doctorKey === 'priya') targetEmail = 'doctor.priya@medilink.com';
      else targetEmail = 'doctor.ananya@medilink.com';
    } else if (role === 'ADMIN') {
      targetEmail = 'admin@medilink.com';
    }

    const user = db.findUserByEmail(targetEmail);
    if (!user) {
      return res.status(404).json({ error: 'Demo user not found.' });
    }

    let doctorId: string | undefined;
    let patientId: string | undefined;

    if (user.role === 'DOCTOR') {
      const doc = db.findDoctorByUserId(user.id);
      doctorId = doc?.id;
    } else if (user.role === 'PATIENT') {
      const pat = db.findPatientByUserId(user.id);
      patientId = pat?.id;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      doctorId,
      patientId,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        preferredLanguage: user.preferredLanguage,
        doctorId,
        patientId,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Demo login failed.' });
  }
});

// Current User Me
router.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const user = db.findUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let extraData: any = {};
  if (user.role === 'DOCTOR') {
    const doc = db.findDoctorByUserId(user.id);
    extraData.doctor = doc ? db.getDoctorFullDetails(doc.id) : null;
  } else if (user.role === 'PATIENT') {
    extraData.patient = db.findPatientByUserId(user.id);
  }

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatarUrl,
    preferredLanguage: user.preferredLanguage,
    doctorId: req.user.doctorId,
    patientId: req.user.patientId,
    ...extraData,
  });
});

export default router;
