import { Router, Response } from 'express';
import { db, Appointment, QueueItem } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Create appointment
router.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      doctorId,
      appointmentDate,
      timeSlot,
      consultationMode = 'VIDEO',
      symptomsDescription,
      paymentMethod = 'MOCK_RAZORPAY',
    } = req.body;

    if (!doctorId || !appointmentDate || !timeSlot) {
      return res.status(400).json({ error: 'Doctor ID, appointment date, and time slot are required.' });
    }

    // Determine patient ID
    let patientId = req.user?.patientId;
    if (!patientId && req.user?.role === 'PATIENT') {
      const patient = db.findPatientByUserId(req.user.userId);
      patientId = patient?.id;
    }

    if (!patientId) {
      // In demo/test mode, fall back to first patient (e.g. Naveen Gunti) so doctors/admins or test profiles can test booking freely
      const defaultPatient = db.patients[0];
      if (defaultPatient) {
        patientId = defaultPatient.id;
      } else {
        return res.status(400).json({ error: 'Valid patient profile is required to book an appointment.' });
      }
    }

    const doctor = db.findDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Selected doctor not found.' });
    }

    // Check double-booking prevention constraint
    if (db.isSlotBooked(doctorId, appointmentDate, timeSlot)) {
      return res.status(409).json({
        error: 'This time slot is already booked for this doctor. Please choose another time slot.',
      });
    }

    const apptId = `apt-${Date.now()}`;
    const datePart = appointmentDate.replace(/-/g, '');
    const apptNumber = `MDL-${datePart}-${Math.floor(100 + Math.random() * 900)}`;
    const roomId = `room-${doctorId}-${apptId}`;

    const newAppointment: Appointment = {
      id: apptId,
      appointmentNumber: apptNumber,
      patientId,
      doctorId,
      appointmentDate,
      timeSlot,
      consultationMode,
      status: 'CONFIRMED',
      symptomsDescription: symptomsDescription || 'General health consultation.',
      consultationFee: doctor.consultationFee,
      paymentStatus: 'PAID', // Instant mock/Razorpay confirmed
      roomId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.appointments.unshift(newAppointment);

    // Record payment
    const paymentId = `pay-${Date.now()}`;
    db.payments.unshift({
      id: paymentId,
      appointmentId: apptId,
      patientId,
      doctorId,
      orderId: `order_${Date.now()}`,
      paymentId: `pay_${Date.now()}`,
      amount: doctor.consultationFee,
      currency: 'INR',
      paymentMethod,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    });

    // Check if appointment is for today; if so, automatically enqueue
    const todayStr = new Date().toISOString().split('T')[0];
    let queueItem: QueueItem | null = null;

    if (appointmentDate === todayStr) {
      const existingQueue = db.queues.filter(
        (q) => q.doctorId === doctorId && (q.status === 'WAITING' || q.status === 'NEXT' || q.status === 'IN_PROGRESS')
      );
      const queueNumber = existingQueue.length + 1;
      const isNext = queueNumber === 1 && doctor.currentStatus === 'AVAILABLE';

      queueItem = {
        id: `q-${Date.now()}`,
        appointmentId: apptId,
        doctorId,
        patientId,
        queueNumber,
        status: isNext ? 'NEXT' : 'WAITING',
        estimatedWaitMinutes: Math.max(5, (queueNumber - 1) * 15),
        joinedAt: new Date().toISOString(),
        calledAt: isNext ? new Date().toISOString() : undefined,
      };

      db.queues.push(queueItem);
      newAppointment.status = 'WAITING';
    }

    // Notifications
    const doctorUser = db.findUserById(doctor.userId);
    db.addNotification(
      req.user!.userId,
      'Appointment Confirmed',
      `Your consultation with Dr. ${doctorUser?.name} on ${appointmentDate} at ${timeSlot} is confirmed.`,
      'APPOINTMENT',
      `/patient/appointments`
    );

    db.addNotification(
      doctor.userId,
      'New Appointment Booked',
      `New consultation booked by ${req.user!.name} for ${appointmentDate} (${timeSlot}).`,
      'APPOINTMENT',
      `/doctor/appointments`
    );

    db.addAuditLog(req.user!.userId, 'BOOK_APPOINTMENT', 'APPOINTMENT', apptId, {
      fee: doctor.consultationFee,
      mode: consultationMode,
      date: appointmentDate,
    });

    return res.status(201).json({
      success: true,
      appointment: newAppointment,
      queue: queueItem,
      message: 'Appointment successfully confirmed.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Appointment creation failed.' });
  }
});

// List appointments for current user (Patient or Doctor)
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = req.user!.role;
    let list: any[] = [];

    if (role === 'PATIENT') {
      const patientId = req.user!.patientId || db.findPatientByUserId(req.user!.userId)?.id;
      list = db.appointments.filter((a) => a.patientId === patientId);
    } else if (role === 'DOCTOR') {
      const doctorId = req.user!.doctorId || db.findDoctorByUserId(req.user!.userId)?.id;
      list = db.appointments.filter((a) => a.doctorId === doctorId);
    } else if (role === 'ADMIN') {
      list = [...db.appointments];
    }

    // Enrich appointments with Doctor/Patient names and related data
    const enriched = list.map((a) => {
      const doctor = db.findDoctorById(a.doctorId);
      const doctorUser = doctor ? db.findUserById(doctor.userId) : null;
      const spec = doctor ? db.specializations.find((s) => s.id === doctor.specializationId) : null;

      const patient = db.findPatientById(a.patientId);
      const patientUser = patient ? db.findUserById(patient.userId) : null;

      const queue = db.queues.find((q) => q.appointmentId === a.id);
      const prescription = db.prescriptions.find((p) => p.appointmentId === a.id);
      const review = db.reviews.find((r) => r.appointmentId === a.id);
      const followup = db.followups.find((f) => f.consultationId && db.consultations.find(c => c.appointmentId === a.id)?.id === f.consultationId);

      return {
        ...a,
        doctor: {
          id: doctor?.id,
          name: doctorUser?.name || 'Dr. Doctor',
          specializationName: spec?.name || 'Specialist',
          qualification: doctor?.qualification || '',
          avatarUrl: doctorUser?.avatarUrl || '',
          currentStatus: doctor?.currentStatus || 'OFFLINE',
          clinicAddress: doctor?.clinicAddress,
          city: doctor?.city,
        },
        patient: {
          id: patient?.id,
          name: patientUser?.name || 'Patient',
          email: patientUser?.email,
          phone: patientUser?.phone,
          gender: patient?.gender,
          bloodGroup: patient?.bloodGroup,
          allergies: patient?.allergies,
          chronicConditions: patient?.chronicConditions,
          avatarUrl: patientUser?.avatarUrl,
        },
        queue,
        prescription,
        review,
        followup,
      };
    });

    return res.json(enriched);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get single appointment
router.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const appt = db.appointments.find((a) => a.id === req.params.id);
  if (!appt) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  const doctor = db.findDoctorById(appt.doctorId);
  const doctorUser = doctor ? db.findUserById(doctor.userId) : null;
  const spec = doctor ? db.specializations.find((s) => s.id === doctor.specializationId) : null;

  const patient = db.findPatientById(appt.patientId);
  const patientUser = patient ? db.findUserById(patient.userId) : null;
  const queue = db.queues.find((q) => q.appointmentId === appt.id);
  const prescription = db.prescriptions.find((p) => p.appointmentId === appt.id);

  return res.json({
    ...appt,
    doctor: {
      id: doctor?.id,
      name: doctorUser?.name || 'Dr. Doctor',
      specializationName: spec?.name || 'Specialist',
      qualification: doctor?.qualification || '',
      avatarUrl: doctorUser?.avatarUrl || '',
      currentStatus: doctor?.currentStatus || 'OFFLINE',
      clinicAddress: doctor?.clinicAddress,
      city: doctor?.city,
    },
    patient: {
      id: patient?.id,
      name: patientUser?.name || 'Patient',
      email: patientUser?.email,
      phone: patientUser?.phone,
      gender: patient?.gender,
      bloodGroup: patient?.bloodGroup,
      allergies: patient?.allergies,
      chronicConditions: patient?.chronicConditions,
      avatarUrl: patientUser?.avatarUrl,
    },
    queue,
    prescription,
  });
});

// Cancel appointment
router.put('/:id/cancel', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason = 'Cancelled by user' } = req.body;
    const appt = db.appointments.find((a) => a.id === req.params.id);
    if (!appt) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    appt.status = 'CANCELLED';
    appt.cancellationReason = reason;
    appt.updatedAt = new Date().toISOString();

    // Cancel in queue if present
    const qIndex = db.queues.findIndex((q) => q.appointmentId === appt.id);
    if (qIndex !== -1) {
      db.queues.splice(qIndex, 1);
    }

    db.addAuditLog(req.user!.userId, 'CANCEL_APPOINTMENT', 'APPOINTMENT', appt.id, { reason });

    return res.json({ success: true, appointment: appt });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Reschedule appointment
router.put('/:id/reschedule', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { newDate, newTimeSlot } = req.body;
    if (!newDate || !newTimeSlot) {
      return res.status(400).json({ error: 'New date and time slot are required.' });
    }

    const appt = db.appointments.find((a) => a.id === req.params.id);
    if (!appt) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    // Check slot availability
    if (db.isSlotBooked(appt.doctorId, newDate, newTimeSlot)) {
      return res.status(409).json({ error: 'The requested new slot is already booked.' });
    }

    appt.appointmentDate = newDate;
    appt.timeSlot = newTimeSlot;
    appt.status = 'CONFIRMED';
    appt.updatedAt = new Date().toISOString();

    db.addAuditLog(req.user!.userId, 'RESCHEDULE_APPOINTMENT', 'APPOINTMENT', appt.id, {
      newDate,
      newTimeSlot,
    });

    return res.json({ success: true, appointment: appt });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get booked slots for a doctor on a specific date (public or authenticated)
router.get('/booked-slots/:doctorId', (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    if (!date) {
      return res.json({ bookedSlots: [] });
    }
    const booked = db.appointments
      .filter((a) => a.doctorId === doctorId && a.appointmentDate === date && a.status !== 'CANCELLED')
      .map((a) => a.timeSlot);
    return res.json({ bookedSlots: booked });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
