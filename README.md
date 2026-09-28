# MediLink — Intelligent Online Doctor Consultation & Appointment System

> *"Don't just book a doctor — manage the complete patient journey from appointment to consultation, prescription, follow-up and referral."*

MediLink is a production-style full-stack digital healthcare platform engineered to eliminate unpredictable clinic waiting times, doctor availability mismatches, poor follow-up continuity, fragmented medical records, network disconnects, and language friction.

---

## 1. Major Innovations & Differentiating Features

1. **Real-time Doctor Availability & Multi-Status Engine:**
   - 🟢 **Available Now**: Accepting instant consultations.
   - 🟡 **In Consultation**: Live queue indicator with position and dynamic wait estimation.
   - ⚪ **On Break**: Scheduled pause.
   - 🔴 **Offline**: Currently off-duty.
2. **Smart Live Queue with Dynamic Waiting Time:**
   - Real-time queue tracker (Position #3, Patients Ahead: 2, Dynamic wait time based on actual doctor consultation pace).
   - Instant notification when next: *"You're next. Please get ready."*
   - Strictly enforces double-booking prevention at both database and transaction layers.
3. **Connectivity-Aware Consultation Room (WebRTC Fallback):**
   - WebRTC media call with adaptive network monitoring:
     - **Preferred:** High-Definition Video Call
     - **If connection becomes unstable:** Audio-only fallback (saves ~80% bandwidth)
     - **If connection drops further:** Encrypted real-time text chat
   - Real-time network indicator (🟢 Excellent, 🟡 Unstable, 🔴 Poor) with manual and automatic fallback toggles.
4. **Longitudinal Patient Health Timeline:**
   - Unified chronological tree spanning consultations, blood tests, digital prescriptions, follow-up alerts, and physical referrals.
5. **Consent-Controlled Medical Report Vault:**
   - Granular document-level permission controls (PDF, JPG, PNG). Patients grant or revoke doctor access on demand.
6. **Automated Follow-up Engine:**
   - Doctors recommend follow-ups (e.g., *"Follow up after 7 days"*), automatically generating reminders with 1-click booking and medical context preservation.
7. **Online-to-Offline Physical Examination Referral System:**
   - When remote telemedicine is insufficient, doctors flag *"Physical examination recommended"* and provide nearby clinic/hospital locations, contact numbers, and appointment guidelines.
8. **Multilingual Navigation (English, Telugu, Hindi):**
   - Instant header language switcher (`EN` / `తెలుగు` / `हिंदी`) with doctor language filters.
9. **AI Health Navigation Assistant (Powered by Gemini API):**
   - Conversational triage assistant that analyzes symptoms, asks clarifying questions, and suggests the matching medical specialty without making diagnostic medical claims. Prominent medical disclaimer included.
10. **Razorpay-Ready Tokenized Payment Architecture:**
    - Secure payment order creation, mock verification flow, receipts, and zero raw card storage.

---

## 2. System Architecture & Folder Structure

```
├── /
│   ├── server.ts                         # Full-stack entry point: Express + Vite middlewares + Socket.IO
│   ├── package.json                      # Dependencies and scripts
│   ├── metadata.json                     # AI Studio metadata & permissions
│   ├── .env.example                      # Environment configuration template
│   ├── /server/
│   │   ├── schema.sql                    # Production MySQL DDL schema (19 relational tables, indexes, constraints)
│   │   ├── db.ts                         # Relational in-memory & persistent data store with rich demo seed data
│   │   ├── socket.ts                     # Socket.IO real-time queue and WebRTC signaling server
│   │   ├── /middleware/
│   │   │   └── auth.ts                   # JWT authentication & role-based authorization (PATIENT, DOCTOR, ADMIN)
│   │   └── /routes/
│   │       ├── auth.ts                   # Registration, login, and 1-click test profile authentication
│   │       ├── doctors.ts                # Doctor search with multi-filters and profile management
│   │       ├── appointments.ts           # Calendar booking, conflict checks, and cancellation
│   │       ├── queue.ts                  # Real-time live queue calculation & "call next" logic
│   │       ├── consultations.ts          # Consultation session lifecycles & room authorization
│   │       ├── prescriptions.ts          # Digital prescriptions creation & printable formats
│   │       ├── reports.ts                # Consent-controlled medical report vault
│   │       ├── followups.ts              # Follow-up scheduling engine
│   │       ├── referrals.ts              # Online-to-offline physical exam referral system
│   │       ├── payments.ts               # Razorpay order generation and verification
│   │       ├── reviews.ts                # Patient reviews and doctor rating calculation
│   │       ├── notifications.ts          # User notification center
│   │       ├── admin.ts                  # Board metrics, doctor credentials approval, audit logs
│   │       └── ai.ts                     # AI Health Navigation Assistant (Gemini 3.8 Flash)
│   └── /src/
│       ├── types.ts                      # Shared TypeScript data models
│       ├── translations.ts               # English, Telugu, and Hindi translation dictionaries
│       ├── /context/
│       │   ├── AuthContext.tsx           # Authentication, role session, and language context
│       │   └── SocketContext.tsx         # Real-time Socket.IO and live notification provider
│       ├── /components/
│       │   ├── Navbar.tsx                # Responsive navigation with 1-click test role switcher
│       │   ├── Footer.tsx                # Emergency helplines, compliance, and disclaimers
│       │   ├── BookingModal.tsx          # Appointment slot picker & Razorpay mock checkout
│       │   ├── PrescriptionModal.tsx     # Printable/downloadable Rx document viewer
│       │   └── AIAssistantModal.tsx      # Gemini-powered medical navigation triage assistant
│       └── /pages/
│           ├── HomePage.tsx              # Landing page with hero, search, specialties, and testimonials
│           ├── DoctorsPage.tsx           # Smart doctor directory with multi-filters & live availability
│           ├── PatientDashboard.tsx      # Patient portal with live queue tracker & appointment actions
│           ├── DoctorDashboard.tsx       # Doctor console with queue manager & status switcher
│           ├── AdminDashboard.tsx        # Medical board governance & doctor credentials verification
│           ├── ConsultationRoomPage.tsx  # WebRTC video room with adaptive connectivity fallback
│           ├── HealthTimelinePage.tsx    # Longitudinal patient health timeline
│           ├── MedicalVaultPage.tsx      # Medical report vault with granular doctor consent controls
│           ├── FollowupsPage.tsx         # Follow-up reminders and 1-click rebooking
│           ├── ReferralsPage.tsx         # In-person clinic referral directory
│           ├── EmergencyPage.tsx         # Emergency triage guidelines and helpline contacts
│           └── AuthPage.tsx              # Sign in and registration with 1-click test accounts
```

---

## 3. Database Schema (MySQL)

The production MySQL schema is defined in `/server/schema.sql`. It contains 19 relational tables with foreign key cascades, unique booking constraints, and indexes:

1. `users`: Core credentials, roles (`PATIENT`, `DOCTOR`, `ADMIN`), language preferences, and profile data.
2. `specializations`: Medical disciplines (General Medicine, Cardiology, Dermatology, Orthopedics, Pediatrics, Neurology).
3. `doctors`: Professional credentials, consultation fees, verification status (`PENDING`, `APPROVED`, `REJECTED`), and live availability status (`AVAILABLE`, `IN_CONSULTATION`, `ON_BREAK`, `OFFLINE`).
4. `doctor_languages`: Spoken languages (`en`, `te`, `hi`).
5. `doctor_availability`: Working hours and appointment slot templates.
6. `patients`: Demographics, blood group, allergies, emergency contacts, and chronic conditions.
7. `appointments`: Unique appointment IDs, time slots, consultation mode (`VIDEO`, `AUDIO`, `CHAT`), payment status, and double-booking prevention constraint:
   ```sql
   UNIQUE KEY uq_doc_date_slot (doctor_id, appointment_date, time_slot, status)
   ```
8. `appointment_queue`: Real-time queue order, status (`WAITING`, `NEXT`, `IN_PROGRESS`, `COMPLETED`), and dynamic wait time.
9. `consultations`: Consultation duration, chief complaints, diagnosis notes, and physical examination flags.
10. `medical_reports`: Patient documents (PDF, JPG, PNG) with authorization flags.
11. `report_access_consents`: Explicit patient permissions granting specific doctors access to documents.
12. `prescriptions`: Digital prescriptions with unique prescription numbers, diagnosis, advice, and lab tests.
13. `prescription_items`: Medicine name, dosage, frequency (e.g., `1-0-1`), duration, and instructions.
14. `followups`: Automatic follow-up reminders.
15. `referrals`: Online-to-offline referral records for in-person hospital/clinic visits.
16. `payments`: Razorpay order IDs, payment IDs, amounts, and statuses.
17. `reviews`: 1-to-5 star ratings and patient comments.
18. `notifications`: In-app notification center.
19. `audit_logs`: Security and clinical compliance audit trail.

---

## 4. Demo Accounts for Immediate Testing

You can use the **Quick Demo Login** button in the navigation bar or use these credentials:

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Patient** | Naveen Gunti | `patient@medilink.com` | `Patient@123` | Has an active queue appointment today |
| **Doctor** | Dr. Ananya Rao | `doctor.ananya@medilink.com` | `Doctor@123` | General Physician (Available Now) |
| **Doctor** | Dr. Rahul Sharma | `doctor.rahul@medilink.com` | `Doctor@123` | Cardiologist (In Consultation with 2 in queue) |
| **Doctor** | Dr. Priya Reddy | `doctor.priya@medilink.com` | `Doctor@123` | Dermatologist (Available Now) |
| **Doctor** | Dr. Arjun Kumar | `doctor.arjun@medilink.com` | `Doctor@123` | Orthopedic Specialist (On Break) |
| **Admin** | Medical Director | `admin@medilink.com` | `Admin@123` | Medical Board Administrator |

---

## 5. How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
```bash
# 1. Install all dependencies
npm install

# 2. Configure environment variables (optional, defaults provided)
cp .env.example .env

# 3. Start full-stack application (Express + Vite + Socket.IO)
npm run dev
```

The application will be live at: **http://localhost:3000**

---

## 6. Testing the Key Workflows

### 1. Real-Time Smart Queue & Wait Estimation
1. Log in as **Patient (Naveen Gunti)**.
2. Go to **My Appointments**.
3. Observe the active queue card: Queue position, patients ahead, and estimated waiting time.
4. In another tab or window, switch role to **Doctor (Dr. Ananya Rao)**.
5. In the doctor console, click **Call Next Patient** or **Start Consultation**.
6. The patient's screen immediately updates to: *"You're next. Please get ready."* or *"Consultation in progress"*.

### 2. WebRTC Video Room with Connectivity Fallback
1. Click **Enter Consultation Room**.
2. Test camera and microphone toggles.
3. Test the **Network Simulation Dropdown** (switch between 🟢 Good, 🟡 Flaky, and 🔴 Poor).
4. Notice how the system automatically degrades to high-quality audio or instant chat when poor network is simulated, protecting the call from dropping.
5. Test in-call medical report viewing and the in-call chat drawer.

### 3. Digital Prescription & Printable Document
1. Inside the consultation room as doctor, open the **Prescription & Notes** drawer.
2. Enter diagnosis, add medicines (dosage, frequency, duration), and click **Sign Prescription & Conclude Call**.
3. The patient receives an instant notification and can view/print the official Rx document with doctor registration credentials.

### 4. AI Health Navigation Assistant
1. Click the **AI Triage** button in the navigation bar.
2. Enter a symptom description (e.g., *"I have dry cough and mild fever"* or *"Sudden red skin rash on arm"*).
3. The assistant identifies the matching specialty (e.g., General Physician or Dermatologist), asks follow-up questions, and provides a 1-click button to view matching verified doctors.
