import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  preferredLanguage: string;
  avatarUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Specialization {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
}

export interface Doctor {
  id: string;
  userId: string;
  specializationId: string;
  qualification: string;
  experienceYears: number;
  registrationNumber: string;
  consultationFee: number;
  bio: string;
  currentStatus: 'AVAILABLE' | 'IN_CONSULTATION' | 'ON_BREAK' | 'OFFLINE';
  isVerified: boolean;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationNotes?: string;
  clinicAddress: string;
  city: string;
  rating: number;
  totalReviews: number;
  videoEnabled: boolean;
  audioEnabled: boolean;
  chatEnabled: boolean;
  languages: string[]; // ['en', 'te', 'hi']
  slots: string[];
  createdAt: string;
}

export interface Patient {
  id: string;
  userId: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  allergies: string;
  chronicConditions: string;
  address: string;
  city: string;
}

export interface Appointment {
  id: string;
  appointmentNumber: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // "10:00 AM - 10:20 AM"
  consultationMode: 'VIDEO' | 'AUDIO' | 'CHAT';
  status: 'PENDING' | 'CONFIRMED' | 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  symptomsDescription: string;
  consultationFee: number;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  roomId: string;
  cancellationReason?: string;
  rescheduledFromId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueueItem {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  queueNumber: number;
  status: 'WAITING' | 'NEXT' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  estimatedWaitMinutes: number;
  joinedAt: string;
  calledAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  startedAt: string;
  endedAt?: string;
  consultationDurationSeconds: number;
  chiefComplaint: string;
  diagnosisNotes: string;
  physicalExamNeeded: boolean;
  connectionModeUsed: 'VIDEO' | 'AUDIO' | 'CHAT';
  createdAt: string;
}

export interface MedicalReport {
  id: string;
  patientId: string;
  title: string;
  reportType: 'LAB_REPORT' | 'BLOOD_TEST' | 'X_RAY' | 'SCAN' | 'PRESCRIPTION_DOC' | 'OTHER';
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  fileData?: string; // Data URL or text preview
  uploadedAt: string;
  authorizedDoctorIds: string[]; // Doctors permitted to access
  authorizedAllDoctors: boolean;
  notes?: string;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  consultationId: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  diagnosis: string;
  generalAdvice: string;
  labTestsRecommended?: string;
  followupDate?: string;
  items: PrescriptionItem[];
  createdAt: string;
}

export interface Followup {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  recommendedDate: string;
  reason: string;
  status: 'PENDING' | 'BOOKED' | 'DISMISSED';
  bookedAppointmentId?: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  referralReason: string;
  recommendedFacilityName: string;
  recommendedFacilityAddress: string;
  facilityContactPhone: string;
  urgencyLevel: 'ROUTINE' | 'URGENT';
  createdAt: string;
}

export interface Payment {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'CREATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  createdAt: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'APPOINTMENT' | 'QUEUE' | 'CONSULTATION' | 'PRESCRIPTION' | 'FOLLOWUP' | 'PAYMENT' | 'SYSTEM';
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  metadata?: any;
  createdAt: string;
}

class MediLinkDatabase {
  users: User[] = [];
  specializations: Specialization[] = [];
  doctors: Doctor[] = [];
  patients: Patient[] = [];
  appointments: Appointment[] = [];
  queues: QueueItem[] = [];
  consultations: Consultation[] = [];
  medicalReports: MedicalReport[] = [];
  prescriptions: Prescription[] = [];
  followups: Followup[] = [];
  referrals: Referral[] = [];
  payments: Payment[] = [];
  reviews: Review[] = [];
  notifications: Notification[] = [];
  auditLogs: AuditLog[] = [];

  constructor() {
    this.seedDatabase();
  }

  private seedDatabase() {
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('Password@123', salt);
    const patientPasswordHash = bcrypt.hashSync('Patient@123', salt);
    const doctorPasswordHash = bcrypt.hashSync('Doctor@123', salt);
    const adminPasswordHash = bcrypt.hashSync('Admin@123', salt);

    // 1. Specializations
    this.specializations = [
      {
        id: 'spec-1',
        name: 'General Physician',
        slug: 'general-physician',
        description: 'Comprehensive primary care for common fevers, infections, metabolic health, and general wellness.',
        icon: 'Stethoscope',
        isActive: true,
      },
      {
        id: 'spec-2',
        name: 'Cardiologist',
        slug: 'cardiologist',
        description: 'Heart health, blood pressure, cholesterol, arrhythmia, and preventive cardiovascular care.',
        icon: 'HeartPulse',
        isActive: true,
      },
      {
        id: 'spec-3',
        name: 'Dermatologist',
        slug: 'dermatologist',
        description: 'Skin allergies, acne, rashes, hair fall, pigmentation, and chronic dermatological care.',
        icon: 'Sparkles',
        isActive: true,
      },
      {
        id: 'spec-4',
        name: 'Orthopedic Specialist',
        slug: 'orthopedic-specialist',
        description: 'Bone, joint, spine, arthritis, sports injuries, and musculoskeletal pain management.',
        icon: 'Activity',
        isActive: true,
      },
      {
        id: 'spec-5',
        name: 'Pediatrician',
        slug: 'pediatrician',
        description: 'Infant care, childhood illnesses, growth milestones, and pediatric vaccinations.',
        icon: 'Baby',
        isActive: true,
      },
      {
        id: 'spec-6',
        name: 'Neurologist',
        slug: 'neurologist',
        description: 'Headaches, migraines, nerve pain, seizures, sleep disorders, and neurological conditions.',
        icon: 'Brain',
        isActive: true,
      },
    ];

    // 2. Admin User
    const adminUser: User = {
      id: 'usr-admin-1',
      name: 'System Administrator (Medical Board)',
      email: 'admin@medilink.com',
      passwordHash: adminPasswordHash,
      phone: '+91 98765 00001',
      role: 'ADMIN',
      preferredLanguage: 'en',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    this.users.push(adminUser);

    // 3. Doctors & Doctor Users
    const doctorConfigs = [
      {
        userId: 'usr-doc-1',
        doctorId: 'doc-1',
        name: 'Dr. Ananya Rao',
        email: 'doctor.ananya@medilink.com',
        phone: '+91 98480 12345',
        specializationId: 'spec-1',
        qualification: 'MBBS, MD (Internal Medicine), FACP',
        experienceYears: 11,
        regNo: 'MCI-AP-2015-4421',
        fee: 500,
        status: 'AVAILABLE' as const,
        bio: 'Senior Consultant Physician with over a decade of clinical experience in internal medicine, lifestyle disorders, and telemedicine care.',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
        languages: ['en', 'te', 'hi'],
        rating: 4.9,
        reviewsCount: 142,
        clinicAddress: 'Care Multispeciality Clinic, Road No 12, Banjara Hills',
        city: 'Hyderabad',
      },
      {
        userId: 'usr-doc-2',
        doctorId: 'doc-2',
        name: 'Dr. Rahul Sharma',
        email: 'doctor.rahul@medilink.com',
        phone: '+91 98110 54321',
        specializationId: 'spec-2',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experienceYears: 14,
        regNo: 'MCI-DL-2012-8819',
        fee: 800,
        status: 'IN_CONSULTATION' as const,
        bio: 'Interventional and preventive cardiologist passionate about early cardiac risk detection, hypertension, and post-angioplasty remote care.',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
        languages: ['en', 'hi'],
        rating: 4.8,
        reviewsCount: 189,
        clinicAddress: 'Apex Heart Care Center, Koramangala 4th Block',
        city: 'Bangalore',
      },
      {
        userId: 'usr-doc-3',
        doctorId: 'doc-3',
        name: 'Dr. Priya Reddy',
        email: 'doctor.priya@medilink.com',
        phone: '+91 99890 98765',
        specializationId: 'spec-3',
        qualification: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
        experienceYears: 8,
        regNo: 'MCI-TG-2018-7734',
        fee: 600,
        status: 'AVAILABLE' as const,
        bio: 'Dermatologist and aesthetic physician specializing in clinical dermatology, adult acne, eczema, and scalp health.',
        avatar: 'https://images.unsplash.com/photo-1594824813576-46b5a3597c55?auto=format&fit=crop&q=80&w=300',
        languages: ['en', 'te'],
        rating: 4.95,
        reviewsCount: 118,
        clinicAddress: 'Dermacare Clinic, Jubilee Hills Checkpost',
        city: 'Hyderabad',
      },
      {
        userId: 'usr-doc-4',
        doctorId: 'doc-4',
        name: 'Dr. Arjun Kumar',
        email: 'doctor.arjun@medilink.com',
        phone: '+91 97030 67890',
        specializationId: 'spec-4',
        qualification: 'MBBS, MS (Orthopaedics), MCh (Ortho)',
        experienceYears: 13,
        regNo: 'MCI-KA-2013-1192',
        fee: 700,
        status: 'ON_BREAK' as const,
        bio: 'Orthopedic surgeon and joint specialist focusing on joint pain management, sports injuries, and conservative orthopedic recovery.',
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
        languages: ['en', 'te', 'hi'],
        rating: 4.75,
        reviewsCount: 96,
        clinicAddress: 'Ortholink Spine & Joint Clinic, Indiranagar',
        city: 'Bangalore',
      },
      {
        userId: 'usr-doc-5',
        doctorId: 'doc-5',
        name: 'Dr. Sneha Varma',
        email: 'doctor.sneha@medilink.com',
        phone: '+91 98499 22334',
        specializationId: 'spec-5',
        qualification: 'MBBS, DCH, DNB (Pediatrics)',
        experienceYears: 9,
        regNo: 'MCI-AP-2017-3401',
        fee: 550,
        status: 'AVAILABLE' as const,
        bio: 'Dedicated child healthcare specialist helping parents navigate newborn care, pediatric allergy treatments, and seasonal infections.',
        avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300',
        languages: ['en', 'te', 'hi'],
        rating: 4.9,
        reviewsCount: 84,
        clinicAddress: 'Rainbow Little Steps Children Clinic, Madhapur',
        city: 'Hyderabad',
      },
      {
        userId: 'usr-doc-6',
        doctorId: 'doc-6',
        name: 'Dr. Vikram Joshi',
        email: 'doctor.vikram@medilink.com',
        phone: '+91 99120 44556',
        specializationId: 'spec-6',
        qualification: 'MBBS, MD, DM (Neurology)',
        experienceYears: 16,
        regNo: 'MCI-MH-2010-9923',
        fee: 900,
        status: 'OFFLINE' as const,
        bio: 'Senior Neurologist with expertise in chronic migraines, peripheral neuropathy, cognitive disorders, and stroke rehabilitation advice.',
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
        languages: ['en', 'hi'],
        rating: 4.85,
        reviewsCount: 130,
        clinicAddress: 'NeuroCare Institute, Somajiguda',
        city: 'Hyderabad',
      },
    ];

    doctorConfigs.forEach((cfg) => {
      const u: User = {
        id: cfg.userId,
        name: cfg.name,
        email: cfg.email,
        passwordHash: doctorPasswordHash,
        phone: cfg.phone,
        role: 'DOCTOR',
        preferredLanguage: 'en',
        avatarUrl: cfg.avatar,
        isActive: true,
        createdAt: '2026-01-10T00:00:00.000Z',
        updatedAt: '2026-01-10T00:00:00.000Z',
      };
      this.users.push(u);

      const d: Doctor = {
        id: cfg.doctorId,
        userId: cfg.userId,
        specializationId: cfg.specializationId,
        qualification: cfg.qualification,
        experienceYears: cfg.experienceYears,
        registrationNumber: cfg.regNo,
        consultationFee: cfg.fee,
        bio: cfg.bio,
        currentStatus: cfg.status,
        isVerified: true,
        verificationStatus: 'APPROVED',
        clinicAddress: cfg.clinicAddress,
        city: cfg.city,
        rating: cfg.rating,
        totalReviews: cfg.reviewsCount,
        videoEnabled: true,
        audioEnabled: true,
        chatEnabled: true,
        languages: cfg.languages,
        slots: ['09:00 AM - 09:20 AM', '09:30 AM - 09:50 AM', '10:00 AM - 10:20 AM', '11:00 AM - 11:20 AM', '02:00 PM - 02:20 PM', '04:00 PM - 04:20 PM', '05:00 PM - 05:20 PM'],
        createdAt: '2026-01-10T00:00:00.000Z',
      };
      this.doctors.push(d);
    });

    // 4. Patients & Patient Users
    const patientConfigs = [
      {
        userId: 'usr-pat-1',
        patientId: 'pat-1',
        name: 'Naveen Gunti',
        email: 'patient@medilink.com',
        phone: '+91 91234 56780',
        dob: '1992-06-14',
        gender: 'MALE' as const,
        bloodGroup: 'O+',
        allergies: 'Penicillin, Dust Mites',
        chronicConditions: 'Mild Allergic Rhinitis',
        emergencyContactName: 'Ramesh Gunti (Father)',
        emergencyContactPhone: '+91 91234 56781',
        address: 'Plot 45, Gachibowli Financial District',
        city: 'Hyderabad',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      },
      {
        userId: 'usr-pat-2',
        patientId: 'pat-2',
        name: 'Priya Sharma',
        email: 'priya.p@medilink.com',
        phone: '+91 98888 12345',
        dob: '1996-03-22',
        gender: 'FEMALE' as const,
        bloodGroup: 'B+',
        allergies: 'Sulfa Drugs',
        chronicConditions: 'None',
        emergencyContactName: 'Sunita Sharma (Mother)',
        emergencyContactPhone: '+91 98888 12346',
        address: 'HSR Layout Sector 2',
        city: 'Bangalore',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
      },
      {
        userId: 'usr-pat-3',
        patientId: 'pat-3',
        name: 'Rajesh Varma',
        email: 'rajesh.v@medilink.com',
        phone: '+91 97777 98765',
        dob: '1984-11-05',
        gender: 'MALE' as const,
        bloodGroup: 'A+',
        allergies: 'None known',
        chronicConditions: 'Hypertension (Stage 1)',
        emergencyContactName: 'Kavita Varma (Spouse)',
        emergencyContactPhone: '+91 97777 98766',
        address: 'Beach Road, MVP Colony',
        city: 'Visakhapatnam',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
      },
    ];

    patientConfigs.forEach((cfg) => {
      const u: User = {
        id: cfg.userId,
        name: cfg.name,
        email: cfg.email,
        passwordHash: patientPasswordHash,
        phone: cfg.phone,
        role: 'PATIENT',
        preferredLanguage: 'en',
        avatarUrl: cfg.avatar,
        isActive: true,
        createdAt: '2026-01-15T00:00:00.000Z',
        updatedAt: '2026-01-15T00:00:00.000Z',
      };
      this.users.push(u);

      const p: Patient = {
        id: cfg.patientId,
        userId: cfg.userId,
        dob: cfg.dob,
        gender: cfg.gender,
        bloodGroup: cfg.bloodGroup,
        emergencyContactName: cfg.emergencyContactName,
        emergencyContactPhone: cfg.emergencyContactPhone,
        allergies: cfg.allergies,
        chronicConditions: cfg.chronicConditions,
        address: cfg.address,
        city: cfg.city,
      };
      this.patients.push(p);
    });

    // 5. Existing Medical Reports for Patient 1 (Naveen)
    this.medicalReports = [
      {
        id: 'rep-1',
        patientId: 'pat-1',
        title: 'Complete Blood Picture (CBP) & Lipid Profile',
        reportType: 'BLOOD_TEST',
        fileName: 'CBC_Lipid_Panel_Sept2026.pdf',
        fileType: 'pdf',
        fileSizeKb: 480,
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAEr5HIKDA12dXRwLC1WSEvMKU7NzNNLzs8rTk1RSCpKTS4t1gNyDY2MDA2MDAE51g98CmVuZHN0cmVhbQplbmRvYmoK',
        uploadedAt: '2026-09-15T10:30:00.000Z',
        authorizedDoctorIds: ['doc-1', 'doc-2'],
        authorizedAllDoctors: false,
        notes: 'Routine fasting panel. Total cholesterol 195 mg/dL, Hb 14.2 g/dL.',
      },
      {
        id: 'rep-2',
        patientId: 'pat-1',
        title: 'Digital Chest X-Ray (PA View)',
        reportType: 'X_RAY',
        fileName: 'Chest_XRay_PA_Aug2026.png',
        fileType: 'png',
        fileSizeKb: 1250,
        fileData: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600',
        uploadedAt: '2026-08-20T14:15:00.000Z',
        authorizedDoctorIds: ['doc-1'],
        authorizedAllDoctors: false,
        notes: 'Clear lung fields, normal cardiothoracic ratio.',
      },
      {
        id: 'rep-3',
        patientId: 'pat-1',
        title: 'ECG 12-Lead Rhythm Trace',
        reportType: 'LAB_REPORT',
        fileName: 'ECG_12Lead_Record.pdf',
        fileType: 'pdf',
        fileSizeKb: 320,
        fileData: '',
        uploadedAt: '2026-07-10T09:00:00.000Z',
        authorizedDoctorIds: ['doc-2'],
        authorizedAllDoctors: false,
        notes: 'Normal sinus rhythm, HR 72 bpm.',
      },
    ];

    // 6. Appointments & Live Queue
    const todayStr = '2026-09-28';

    // Appointment 1: Today for Naveen with Dr. Ananya Rao (WAITING in queue)
    const appt1: Appointment = {
      id: 'apt-101',
      appointmentNumber: 'MDL-20260928-001',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      appointmentDate: todayStr,
      timeSlot: '10:00 AM - 10:20 AM',
      consultationMode: 'VIDEO',
      status: 'WAITING',
      symptomsDescription: 'Persistent seasonal dry cough and mild feverish feeling in evenings for 4 days.',
      consultationFee: 500,
      paymentStatus: 'PAID',
      roomId: 'room-ananya-apt101',
      createdAt: '2026-09-28T08:00:00.000Z',
      updatedAt: '2026-09-28T08:30:00.000Z',
    };

    // Appointment 2: For Priya Sharma with Dr. Rahul Sharma (IN_CONSULTATION)
    const appt2: Appointment = {
      id: 'apt-102',
      appointmentNumber: 'MDL-20260928-002',
      patientId: 'pat-2',
      doctorId: 'doc-2',
      appointmentDate: todayStr,
      timeSlot: '09:30 AM - 09:50 AM',
      consultationMode: 'VIDEO',
      status: 'IN_CONSULTATION',
      symptomsDescription: 'Palpitations after morning jog and occasional dizziness.',
      consultationFee: 800,
      paymentStatus: 'PAID',
      roomId: 'room-rahul-apt102',
      createdAt: '2026-09-28T07:30:00.000Z',
      updatedAt: '2026-09-28T08:40:00.000Z',
    };

    // Appointment 3: For Rajesh Varma with Dr. Rahul Sharma (WAITING in queue)
    const appt3: Appointment = {
      id: 'apt-103',
      appointmentNumber: 'MDL-20260928-003',
      patientId: 'pat-3',
      doctorId: 'doc-2',
      appointmentDate: todayStr,
      timeSlot: '10:00 AM - 10:20 AM',
      consultationMode: 'VIDEO',
      status: 'WAITING',
      symptomsDescription: 'Blood pressure check-up and renewal of beta-blocker medicine.',
      consultationFee: 800,
      paymentStatus: 'PAID',
      roomId: 'room-rahul-apt103',
      createdAt: '2026-09-28T07:45:00.000Z',
      updatedAt: '2026-09-28T08:30:00.000Z',
    };

    // Appointment 4: Previous completed appointment for Naveen with Dr. Priya Reddy (COMPLETED with prescription)
    const appt4: Appointment = {
      id: 'apt-099',
      appointmentNumber: 'MDL-20260814-042',
      patientId: 'pat-1',
      doctorId: 'doc-3',
      appointmentDate: '2026-08-14',
      timeSlot: '04:00 PM - 04:20 PM',
      consultationMode: 'VIDEO',
      status: 'COMPLETED',
      symptomsDescription: 'Allergic red rash on forearms triggered after lawn maintenance.',
      consultationFee: 600,
      paymentStatus: 'PAID',
      roomId: 'room-priya-apt099',
      createdAt: '2026-08-14T10:00:00.000Z',
      updatedAt: '2026-08-14T16:25:00.000Z',
    };

    this.appointments.push(appt1, appt2, appt3, appt4);

    // Queue for Dr. Ananya Rao:
    this.queues.push({
      id: 'q-101',
      appointmentId: 'apt-101',
      doctorId: 'doc-1',
      patientId: 'pat-1',
      queueNumber: 1,
      status: 'NEXT',
      estimatedWaitMinutes: 5,
      joinedAt: '2026-09-28T08:30:00.000Z',
      calledAt: '2026-09-28T08:45:00.000Z',
    });

    // Queue for Dr. Rahul Sharma:
    this.queues.push(
      {
        id: 'q-102',
        appointmentId: 'apt-102',
        doctorId: 'doc-2',
        patientId: 'pat-2',
        queueNumber: 1,
        status: 'IN_PROGRESS',
        estimatedWaitMinutes: 0,
        joinedAt: '2026-09-28T08:15:00.000Z',
        startedAt: '2026-09-28T08:40:00.000Z',
      },
      {
        id: 'q-103',
        appointmentId: 'apt-103',
        doctorId: 'doc-2',
        patientId: 'pat-3',
        queueNumber: 2,
        status: 'WAITING',
        estimatedWaitMinutes: 18,
        joinedAt: '2026-09-28T08:25:00.000Z',
      }
    );

    // Completed Consultation for apt-099
    this.consultations.push({
      id: 'c-099',
      appointmentId: 'apt-099',
      doctorId: 'doc-3',
      patientId: 'pat-1',
      startedAt: '2026-08-14T16:02:00.000Z',
      endedAt: '2026-08-14T16:22:00.000Z',
      consultationDurationSeconds: 1200,
      chiefComplaint: 'Acute contact dermatitis with pruritus on bilateral forearms.',
      diagnosisNotes: 'Mild allergic contact dermatitis without secondary bacterial infection. Recommended topical barrier cream and oral antihistamine.',
      physicalExamNeeded: false,
      connectionModeUsed: 'VIDEO',
      createdAt: '2026-08-14T16:22:00.000Z',
    });

    // Prescription for c-099
    this.prescriptions.push({
      id: 'rx-099',
      prescriptionNumber: 'RX-20260814-77',
      consultationId: 'c-099',
      appointmentId: 'apt-099',
      doctorId: 'doc-3',
      patientId: 'pat-1',
      diagnosis: 'Contact Allergic Dermatitis',
      generalAdvice: 'Avoid direct contact with garden vegetation. Apply cool water compresses. Avoid hot showers for 5 days.',
      labTestsRecommended: 'Serum Total IgE if symptoms persist past 2 weeks.',
      followupDate: '2026-08-28',
      items: [
        {
          id: 'rx-item-1',
          medicineName: 'Levocetirizine 5mg Tablet',
          dosage: '5 mg',
          frequency: '0-0-1 (Night after food)',
          duration: '5 Days',
          instructions: 'May cause mild drowsiness. Take at bedtime.',
        },
        {
          id: 'rx-item-2',
          medicineName: 'Hydrocortisone 1% Topical Cream',
          dosage: 'Apply thin layer',
          frequency: 'Twice daily',
          duration: '5 Days',
          instructions: 'Gently apply over affected skin patches only.',
        },
      ],
      createdAt: '2026-08-14T16:24:00.000Z',
    });

    // Followup record for apt-099
    this.followups.push({
      id: 'flw-099',
      consultationId: 'c-099',
      patientId: 'pat-1',
      doctorId: 'doc-3',
      recommendedDate: '2026-08-28',
      reason: 'Evaluate skin recovery and check for persistent erythema or scaling.',
      status: 'DISMISSED',
      createdAt: '2026-08-14T16:25:00.000Z',
    });

    // Payments
    this.payments.push({
      id: 'pay-101',
      appointmentId: 'apt-101',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      orderId: 'order_MdlDemo101',
      paymentId: 'pay_MdlDemoSuccess101',
      amount: 500,
      currency: 'INR',
      paymentMethod: 'UPI / Google Pay',
      status: 'SUCCESS',
      createdAt: '2026-09-28T08:02:00.000Z',
    });

    // Reviews
    this.reviews.push({
      id: 'rev-099',
      appointmentId: 'apt-099',
      doctorId: 'doc-3',
      patientId: 'pat-1',
      rating: 5,
      comment: 'Dr. Priya took time to examine the rash over high-res video, explained the trigger clearly, and the prescribed cream resolved the itch within 24 hours!',
      createdAt: '2026-08-15T09:30:00.000Z',
    });

    // Notifications
    this.notifications.push(
      {
        id: 'notif-1',
        userId: 'usr-pat-1',
        title: "You're next in queue!",
        message: 'Dr. Ananya Rao is preparing for your consultation. Please join the consultation room now.',
        type: 'QUEUE',
        linkUrl: '/consultation/room-ananya-apt101',
        isRead: false,
        createdAt: '2026-09-28T08:45:00.000Z',
      },
      {
        id: 'notif-2',
        userId: 'usr-pat-1',
        title: 'Appointment Confirmed',
        message: 'Your video consultation with Dr. Ananya Rao for Today at 10:00 AM is confirmed.',
        type: 'APPOINTMENT',
        linkUrl: '/patient/appointments',
        isRead: true,
        createdAt: '2026-09-28T08:02:00.000Z',
      }
    );

    // Audit logs
    this.auditLogs.push({
      id: 'log-1',
      userId: 'usr-pat-1',
      action: 'BOOK_APPOINTMENT',
      resourceType: 'APPOINTMENT',
      resourceId: 'apt-101',
      ipAddress: '127.0.0.1',
      metadata: { fee: 500, mode: 'VIDEO' },
      createdAt: '2026-09-28T08:00:00.000Z',
    });
  }

  // --- Helper Methods ---

  findUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  findDoctorByUserId(userId: string): Doctor | undefined {
    return this.doctors.find((d) => d.userId === userId);
  }

  findDoctorById(id: string): Doctor | undefined {
    return this.doctors.find((d) => d.id === id);
  }

  findPatientByUserId(userId: string): Patient | undefined {
    return this.patients.find((p) => p.userId === userId);
  }

  findPatientById(id: string): Patient | undefined {
    return this.patients.find((p) => p.id === id);
  }

  getDoctorFullDetails(doctorId: string) {
    const doctor = this.findDoctorById(doctorId);
    if (!doctor) return null;
    const user = this.findUserById(doctor.userId);
    const spec = this.specializations.find((s) => s.id === doctor.specializationId);
    const doctorReviews = this.reviews.filter((r) => r.doctorId === doctorId);

    // Dynamic queue & wait calculation
    const activeQueue = this.queues.filter(
      (q) => q.doctorId === doctorId && (q.status === 'WAITING' || q.status === 'NEXT' || q.status === 'IN_PROGRESS')
    );

    return {
      ...doctor,
      name: user?.name || 'Dr. Doctor',
      email: user?.email || '',
      phone: user?.phone || '',
      avatarUrl: user?.avatarUrl || '',
      specializationName: spec?.name || 'General',
      specializationSlug: spec?.slug || 'general',
      reviews: doctorReviews,
      queueCount: activeQueue.length,
      estimatedWaitMinutes: activeQueue.length * 15,
    };
  }

  getAllDoctorsWithDetails() {
    return this.doctors.map((d) => this.getDoctorFullDetails(d.id)).filter(Boolean);
  }

  isSlotBooked(doctorId: string, date: string, timeSlot: string): boolean {
    return this.appointments.some(
      (a) =>
        a.doctorId === doctorId &&
        a.appointmentDate === date &&
        a.timeSlot === timeSlot &&
        a.status !== 'CANCELLED'
    );
  }

  addNotification(userId: string, title: string, message: string, type: Notification['type'], linkUrl?: string) {
    const n: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      title,
      message,
      type,
      linkUrl,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(n);
    return n;
  }

  addAuditLog(userId: string | undefined, action: string, resourceType: string, resourceId?: string, metadata?: any) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      action,
      resourceType,
      resourceId,
      metadata,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
  }
}

export const db = new MediLinkDatabase();
