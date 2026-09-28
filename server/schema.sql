-- =====================================================================
-- MediLink: Intelligent Online Doctor Consultation & Appointment System
-- Production MySQL Schema (DDL + Constraints + Indexes)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS medilink_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medilink_db;

-- 1. Users Table (Core authentication & role-based access)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role ENUM('PATIENT', 'DOCTOR', 'ADMIN') NOT NULL DEFAULT 'PATIENT',
    preferred_language VARCHAR(20) DEFAULT 'en',
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- 2. Specializations Table
CREATE TABLE IF NOT EXISTS specializations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    specialization_id VARCHAR(36) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    experience_years INT UNSIGNED NOT NULL DEFAULT 0,
    registration_number VARCHAR(100) NOT NULL UNIQUE,
    consultation_fee DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
    bio TEXT,
    current_status ENUM('AVAILABLE', 'IN_CONSULTATION', 'ON_BREAK', 'OFFLINE') NOT NULL DEFAULT 'AVAILABLE',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    verification_notes TEXT,
    clinic_address VARCHAR(255),
    city VARCHAR(100),
    rating DECIMAL(3, 2) DEFAULT 5.00,
    total_reviews INT UNSIGNED DEFAULT 0,
    video_enabled BOOLEAN DEFAULT TRUE,
    audio_enabled BOOLEAN DEFAULT TRUE,
    chat_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (specialization_id) REFERENCES specializations(id),
    INDEX idx_doc_status (current_status),
    INDEX idx_doc_specialization (specialization_id),
    INDEX idx_doc_verified (is_verified)
) ENGINE=InnoDB;

-- 4. Doctor Languages Table
CREATE TABLE IF NOT EXISTS doctor_languages (
    id VARCHAR(36) PRIMARY KEY,
    doctor_id VARCHAR(36) NOT NULL,
    language_code VARCHAR(20) NOT NULL, -- 'en', 'te', 'hi', etc.
    language_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    UNIQUE KEY uq_doc_lang (doctor_id, language_code)
) ENGINE=InnoDB;

-- 5. Doctor Availability / Schedule Slots Table
CREATE TABLE IF NOT EXISTS doctor_availability (
    id VARCHAR(36) PRIMARY KEY,
    doctor_id VARCHAR(36) NOT NULL,
    day_of_week TINYINT UNSIGNED NOT NULL, -- 0 = Sunday, 1 = Monday ... 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT UNSIGNED DEFAULT 20,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_avail_doc (doctor_id, day_of_week)
) ENGINE=InnoDB;

-- 6. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    dob DATE,
    gender ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'),
    blood_group VARCHAR(10),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(30),
    allergies TEXT,
    chronic_conditions TEXT,
    address VARCHAR(255),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(36) PRIMARY KEY,
    appointment_number VARCHAR(50) NOT NULL UNIQUE,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(30) NOT NULL, -- e.g. "10:00 AM - 10:20 AM"
    consultation_mode ENUM('VIDEO', 'AUDIO', 'CHAT') NOT NULL DEFAULT 'VIDEO',
    status ENUM('PENDING', 'CONFIRMED', 'WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED') NOT NULL DEFAULT 'CONFIRMED',
    symptoms_description TEXT,
    consultation_fee DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('PENDING', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    room_id VARCHAR(100) UNIQUE,
    cancellation_reason TEXT,
    rescheduled_from_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    -- Prevent double-booking constraint for doctor on identical date & time slot for active appointments
    UNIQUE KEY uq_doc_date_slot (doctor_id, appointment_date, time_slot, status),
    INDEX idx_appt_date (appointment_date),
    INDEX idx_appt_status (status)
) ENGINE=InnoDB;

-- 8. Appointment Live Queue Table
CREATE TABLE IF NOT EXISTS appointment_queue (
    id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(36) NOT NULL UNIQUE,
    doctor_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    queue_number INT UNSIGNED NOT NULL,
    status ENUM('WAITING', 'NEXT', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED') NOT NULL DEFAULT 'WAITING',
    estimated_wait_minutes INT UNSIGNED DEFAULT 15,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    called_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_queue_doc (doctor_id, status, queue_number)
) ENGINE=InnoDB;

-- 9. Consultations Table
CREATE TABLE IF NOT EXISTS consultations (
    id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(36) NOT NULL UNIQUE,
    doctor_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    consultation_duration_seconds INT UNSIGNED DEFAULT 0,
    chief_complaint TEXT,
    diagnosis_notes TEXT,
    physical_exam_needed BOOLEAN DEFAULT FALSE,
    connection_mode_used ENUM('VIDEO', 'AUDIO', 'CHAT') NOT NULL DEFAULT 'VIDEO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
) ENGINE=InnoDB;

-- 10. Medical Reports Vault Table
CREATE TABLE IF NOT EXISTS medical_reports (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    report_type ENUM('LAB_REPORT', 'BLOOD_TEST', 'X_RAY', 'SCAN', 'PRESCRIPTION_DOC', 'OTHER') NOT NULL DEFAULT 'LAB_REPORT',
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- pdf, jpg, png
    file_size_kb INT UNSIGNED NOT NULL,
    file_data LONGTEXT, -- Base64 or cloud storage URL
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    authorized_all_doctors BOOLEAN DEFAULT FALSE,
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_reports (patient_id)
) ENGINE=InnoDB;

-- 11. Report Access Consents (Patient controls which doctor can view which report)
CREATE TABLE IF NOT EXISTS report_access_consents (
    id VARCHAR(36) PRIMARY KEY,
    report_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    is_granted BOOLEAN DEFAULT TRUE,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES medical_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    UNIQUE KEY uq_report_doctor (report_id, doctor_id)
) ENGINE=InnoDB;

-- 12. Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    id VARCHAR(36) PRIMARY KEY,
    prescription_number VARCHAR(50) NOT NULL UNIQUE,
    consultation_id VARCHAR(36) NOT NULL UNIQUE,
    appointment_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    diagnosis TEXT NOT NULL,
    general_advice TEXT,
    lab_tests_recommended TEXT,
    followup_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
) ENGINE=InnoDB;

-- 13. Prescription Items Table
CREATE TABLE IF NOT EXISTS prescription_items (
    id VARCHAR(36) PRIMARY KEY,
    prescription_id VARCHAR(36) NOT NULL,
    medicine_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(100) NOT NULL, -- e.g. "500 mg"
    frequency VARCHAR(100) NOT NULL, -- e.g. "1-0-1 (After Food)"
    duration VARCHAR(100) NOT NULL, -- e.g. "5 Days"
    instructions TEXT,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. Follow-ups Engine Table
CREATE TABLE IF NOT EXISTS followups (
    id VARCHAR(36) PRIMARY KEY,
    consultation_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    recommended_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('PENDING', 'BOOKED', 'DISMISSED') NOT NULL DEFAULT 'PENDING',
    booked_appointment_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
) ENGINE=InnoDB;

-- 15. Online to Offline Physical Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
    id VARCHAR(36) PRIMARY KEY,
    consultation_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    referral_reason TEXT NOT NULL,
    recommended_facility_name VARCHAR(150) NOT NULL,
    recommended_facility_address VARCHAR(255),
    facility_contact_phone VARCHAR(50),
    urgency_level ENUM('ROUTINE', 'URGENT') DEFAULT 'ROUTINE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
) ENGINE=InnoDB;

-- 16. Payments Table (Razorpay-ready architecture)
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(100) NOT NULL, -- Razorpay order id (e.g., order_xxxx)
    payment_id VARCHAR(100), -- Razorpay payment id (e.g., pay_xxxx)
    signature VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50) DEFAULT 'MOCK_RAZORPAY',
    status ENUM('CREATED', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
) ENGINE=InnoDB;

-- 17. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(36) NOT NULL UNIQUE,
    doctor_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    rating TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
) ENGINE=InnoDB;

-- 18. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('APPOINTMENT', 'QUEUE', 'CONSULTATION', 'PRESCRIPTION', 'FOLLOWUP', 'PAYMENT', 'SYSTEM') NOT NULL,
    link_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_notifications (user_id, is_read)
) ENGINE=InnoDB;

-- 19. Audit Logs Table (HIPAA & Security compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    ip_address VARCHAR(45),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
