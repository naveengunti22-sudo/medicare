export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  preferredLanguage: string;
  doctorId?: string;
  patientId?: string;
}

export interface Specialization {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
}

export type DoctorStatus = 'AVAILABLE' | 'IN_CONSULTATION' | 'ON_BREAK' | 'OFFLINE';

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  specializationId: string;
  specializationName: string;
  specializationSlug: string;
  qualification: string;
  experienceYears: number;
  registrationNumber: string;
  consultationFee: number;
  bio: string;
  currentStatus: DoctorStatus;
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
  languages: string[];
  slots: string[];
  queueCount?: number;
  estimatedWaitMinutes?: number;
  reviews?: Review[];
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

export type ConsultationMode = 'VIDEO' | 'AUDIO' | 'CHAT';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'WAITING'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED';

export interface Appointment {
  id: string;
  appointmentNumber: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  timeSlot: string;
  consultationMode: ConsultationMode;
  status: AppointmentStatus;
  symptomsDescription: string;
  consultationFee: number;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  roomId: string;
  cancellationReason?: string;
  rescheduledFromId?: string;
  createdAt: string;
  doctor?: {
    id: string;
    name: string;
    specializationName: string;
    qualification: string;
    avatarUrl: string;
    currentStatus: DoctorStatus;
    clinicAddress?: string;
    city?: string;
  };
  patient?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    gender?: string;
    bloodGroup?: string;
    allergies?: string;
    chronicConditions?: string;
    avatarUrl?: string;
  };
  queue?: QueueItem;
  prescription?: Prescription;
  review?: Review;
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
  connectionModeUsed: ConsultationMode;
  createdAt: string;
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
  doctor?: {
    id: string;
    name: string;
    specializationName?: string;
    qualification?: string;
    regNo?: string;
    clinicAddress?: string;
    city?: string;
  };
  patient?: {
    id: string;
    name: string;
    age?: number | string;
    gender?: string;
    bloodGroup?: string;
  };
}

export interface MedicalReport {
  id: string;
  patientId: string;
  title: string;
  reportType: 'LAB_REPORT' | 'BLOOD_TEST' | 'X_RAY' | 'SCAN' | 'PRESCRIPTION_DOC' | 'OTHER';
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  fileData?: string;
  uploadedAt: string;
  authorizedDoctorIds: string[];
  authorizedAllDoctors: boolean;
  notes?: string;
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
  doctor?: {
    id: string;
    name: string;
    specializationName: string;
    avatarUrl?: string;
    consultationFee?: number;
  };
  patient?: {
    id: string;
    name: string;
  };
  consultationNotes?: string;
  chiefComplaint?: string;
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
  doctorName?: string;
  specialization?: string;
  patientName?: string;
  nearbyFacilities?: {
    name: string;
    address: string;
    phone: string;
    distance: string;
    timings: string;
    services: string[];
  }[];
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
  doctorName?: string;
  patientName?: string;
  appointmentNumber?: string;
  appointmentDate?: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  rating: number;
  comment: string;
  createdAt: string;
  patientName?: string;
  patientAvatar?: string;
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
