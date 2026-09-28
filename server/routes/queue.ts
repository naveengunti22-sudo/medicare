import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get queue status for a specific appointment
router.get('/appointment/:appointmentId', (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appt = db.appointments.find((a) => a.id === appointmentId);
    if (!appt) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const doctor = db.findDoctorById(appt.doctorId);
    const doctorUser = doctor ? db.findUserById(doctor.userId) : null;

    // Get active queue for this doctor sorted by queueNumber
    const activeDoctorQueue = db.queues
      .filter((q) => q.doctorId === appt.doctorId && ['WAITING', 'NEXT', 'IN_PROGRESS'].includes(q.status))
      .sort((a, b) => a.queueNumber - b.queueNumber);

    const myQueueItem = db.queues.find((q) => q.appointmentId === appointmentId);

    if (!myQueueItem) {
      return res.json({
        inQueue: false,
        appointmentStatus: appt.status,
        doctorStatus: doctor?.currentStatus || 'AVAILABLE',
        doctorName: doctorUser?.name || 'Dr. Doctor',
      });
    }

    // Calculate position
    const myIndex = activeDoctorQueue.findIndex((q) => q.id === myQueueItem.id);
    const patientsAhead = myIndex > 0 ? myIndex : 0;
    const queuePosition = myIndex !== -1 ? myIndex + 1 : 1;

    // Dynamic wait estimate: average 12-15 mins per patient ahead
    const estimatedWaitMinutes = myQueueItem.status === 'IN_PROGRESS' ? 0 : Math.max(3, patientsAhead * 15 + (myQueueItem.status === 'NEXT' ? 2 : 0));

    let alertMessage = '';
    if (myQueueItem.status === 'NEXT') {
      alertMessage = "You're next. Please get ready.";
    } else if (myQueueItem.status === 'IN_PROGRESS') {
      alertMessage = 'Consultation in progress. Connected with doctor.';
    } else if (doctor?.currentStatus === 'IN_CONSULTATION') {
      alertMessage = `Doctor is currently consulting patient #${activeDoctorQueue[0]?.queueNumber || 1}.`;
    }

    return res.json({
      inQueue: true,
      queueItem: myQueueItem,
      queuePosition,
      patientsAhead,
      estimatedWaitMinutes,
      alertMessage,
      doctorStatus: doctor?.currentStatus || 'AVAILABLE',
      doctorName: doctorUser?.name || 'Dr. Doctor',
      roomId: appt.roomId,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Doctor gets today's live queue
router.get('/doctor/:doctorId', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { doctorId } = req.params;
    const doctor = db.findDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    const queueItems = db.queues
      .filter((q) => q.doctorId === doctorId && ['WAITING', 'NEXT', 'IN_PROGRESS'].includes(q.status))
      .sort((a, b) => a.queueNumber - b.queueNumber);

    const enrichedQueue = queueItems.map((q, idx) => {
      const appt = db.appointments.find((a) => a.id === q.appointmentId);
      const pat = db.findPatientById(q.patientId);
      const patUser = pat ? db.findUserById(pat.userId) : null;
      return {
        ...q,
        position: idx + 1,
        appointment: appt,
        patientName: patUser?.name || 'Patient',
        patientGender: pat?.gender,
        patientAge: pat?.dob ? new Date().getFullYear() - new Date(pat.dob).getFullYear() : 30,
        patientAvatar: patUser?.avatarUrl,
        symptoms: appt?.symptomsDescription,
        mode: appt?.consultationMode || 'VIDEO',
      };
    });

    return res.json({
      doctorId,
      doctorStatus: doctor.currentStatus,
      queue: enrichedQueue,
      totalWaiting: enrichedQueue.filter((q) => q.status === 'WAITING' || q.status === 'NEXT').length,
      currentConsultation: enrichedQueue.find((q) => q.status === 'IN_PROGRESS'),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Doctor calls next patient in queue
router.post('/call-next', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { doctorId } = req.body;
    const doctor = db.findDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    const waitingQueue = db.queues
      .filter((q) => q.doctorId === doctorId && (q.status === 'WAITING' || q.status === 'NEXT'))
      .sort((a, b) => a.queueNumber - b.queueNumber);

    if (waitingQueue.length === 0) {
      return res.status(404).json({ message: 'No more patients waiting in queue.' });
    }

    const nextPatient = waitingQueue[0];
    nextPatient.status = 'NEXT';
    nextPatient.calledAt = new Date().toISOString();

    const appt = db.appointments.find((a) => a.id === nextPatient.appointmentId);
    if (appt) {
      appt.status = 'WAITING';
    }

    // Send urgent notification to patient
    const pat = db.findPatientById(nextPatient.patientId);
    if (pat) {
      db.addNotification(
        pat.userId,
        "You're next! Please get ready",
        `Doctor is ready for your appointment (${appt?.timeSlot}). Please join the consultation room immediately.`,
        'QUEUE',
        `/consultation/${appt?.roomId}`
      );
    }

    return res.json({
      success: true,
      message: 'Next patient called successfully.',
      nextPatient,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
