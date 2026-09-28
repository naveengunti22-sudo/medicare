import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Appointment, QueueItem } from '../types';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  AlertCircle,
  CheckCircle2,
  Phone,
  MessageSquare,
  ArrowRight,
  Sparkles,
  ExternalLink,
  XCircle,
  RefreshCw,
  FolderHeart,
  Star,
} from 'lucide-react';
import { PrescriptionModal } from '../components/PrescriptionModal';

interface PatientDashboardProps {
  setCurrentTab: (tab: string) => void;
  onEnterRoom: (roomId: string) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  setCurrentTab,
  onEnterRoom,
}) => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

  // Review modal state
  const [reviewAppt, setReviewAppt] = useState<Appointment | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  // In-app cancellation state (replaces window.prompt)
  const [cancellingAppt, setCancellingAppt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Schedule conflict');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  // Execute cancel appointment
  const executeCancel = async () => {
    if (!cancellingAppt) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/appointments/${cancellingAppt.id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      });
      if (res.ok) {
        setCancellingAppt(null);
        fetchAppointments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCancelling(false);
    }
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!reviewAppt) return;
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId: reviewAppt.id,
          rating,
          comment: reviewComment,
        }),
      });
      if (res.ok) {
        setReviewAppt(null);
        setReviewComment('');
        fetchAppointments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const activeAppointments = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'WAITING' || a.status === 'IN_CONSULTATION'
  );
  const pastAppointments = appointments.filter(
    (a) => a.status === 'COMPLETED' || a.status === 'CANCELLED'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 text-teal-200 text-xs font-semibold">
            <span>Patient Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Welcome, {user?.name || 'Patient'}</h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
            Track your live consultation queues, enter video rooms, access longitudinal prescriptions, and manage medical reports.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setCurrentTab('doctors')}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            + Book New Doctor
          </button>
          <button
            onClick={() => setCurrentTab('vault')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer border border-white/15"
          >
            Upload Reports
          </button>
        </div>
      </div>

      {/* Live Queue & Active Consultations Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-lg font-black text-slate-900">Active Consultations & Smart Live Queue</h2>
          </div>
          <button
            onClick={fetchAppointments}
            className="text-xs text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>

        {activeAppointments.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No active queues or pending consultations today</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When you book an appointment, you can track your exact position in the doctor's live queue right here.
            </p>
            <button
              onClick={() => setCurrentTab('doctors')}
              className="mt-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Find Available Doctors
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeAppointments.map((appt) => {
              const isToday = appt.appointmentDate === todayStr;
              const queue = appt.queue;
              const isNext = queue?.status === 'NEXT';
              const inProgress = appt.status === 'IN_CONSULTATION';

              return (
                <div
                  key={appt.id}
                  className="rounded-3xl bg-white border-2 border-teal-500/40 p-6 shadow-md space-y-4 relative overflow-hidden"
                >
                  {/* Status header banner */}
                  {inProgress ? (
                    <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Doctor is ready in room!</span>
                      </span>
                      <span>Consultation in progress</span>
                    </div>
                  ) : isNext ? (
                    <div className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>You're next. Please get ready!</span>
                      </span>
                      <span>Queue Position #1</span>
                    </div>
                  ) : (
                    <div className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl text-xs flex items-center justify-between border border-slate-200">
                      <span>Appointment Status: <strong className="text-teal-700">{appt.status}</strong></span>
                      <span>{appt.appointmentDate} • {appt.timeSlot}</span>
                    </div>
                  )}

                  {/* Doctor Info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={appt.doctor?.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'}
                      alt={appt.doctor?.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-500/20"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-sm">{appt.doctor?.name}</h4>
                      <p className="text-xs text-teal-700 font-semibold">{appt.doctor?.specializationName}</p>
                      <p className="text-[11px] text-slate-500">ID: {appt.appointmentNumber}</p>
                    </div>
                  </div>

                  {/* Smart Queue Metrics */}
                  {queue && isToday && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Position</span>
                        <span className="text-base font-black text-slate-900">#{queue.queueNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ahead</span>
                        <span className="text-base font-black text-teal-700">
                          {Math.max(0, queue.queueNumber - 1)} Patients
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Est. Wait</span>
                        <span className="text-base font-black text-emerald-600">
                          ~{queue.estimatedWaitMinutes}m
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => onEnterRoom(appt.roomId)}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        inProgress || isNext
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                          : 'bg-teal-600 hover:bg-teal-700 text-white'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>Enter Consultation Room</span>
                    </button>

                    <button
                      onClick={() => setCancellingAppt(appt)}
                      className="p-3 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                      title="Cancel Appointment"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Consultations & Prescriptions History */}
      <div className="space-y-4 pt-6">
        <h2 className="text-lg font-black text-slate-900">Past Consultations & Digital Prescriptions</h2>

        {pastAppointments.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 text-xs text-slate-400 text-center">
            No previous completed consultations yet.
          </div>
        ) : (
          <div className="space-y-3">
            {pastAppointments.map((appt) => (
              <div
                key={appt.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{appt.doctor?.name}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{appt.appointmentDate} • {appt.timeSlot} • {appt.doctor?.specializationName}</p>
                    <p className="text-xs text-slate-600 italic mt-0.5">"{appt.symptomsDescription}"</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {appt.prescription ? (
                    <button
                      onClick={() => setSelectedPrescription(appt.prescription)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Prescription</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">Prescription not issued</span>
                  )}

                  {appt.status === 'COMPLETED' && !appt.review && (
                    <button
                      onClick={() => setReviewAppt(appt)}
                      className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Review Consultation with {reviewAppt.doctor?.name}</h3>
            <p className="text-xs text-slate-500">How was your telemedicine experience with this doctor?</p>

            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share details about the doctor's communication, diagnosis, and helpfulness..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-teal-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewAppt(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal (No window.prompt) */}
      {cancellingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Cancel Appointment</h3>
                <p className="text-xs text-slate-500">ID: {cancellingAppt.appointmentNumber}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to cancel your consultation with <strong>{cancellingAppt.doctor?.name}</strong>?
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-teal-500"
              >
                <option value="Schedule conflict">Schedule conflict</option>
                <option value="Symptoms resolved">Symptoms resolved / Feeling better</option>
                <option value="Booked another specialist">Booked another specialist</option>
                <option value="Personal emergency">Personal emergency</option>
                <option value="Other">Other reasons</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingAppt(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={executeCancel}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {selectedPrescription && (
        <PrescriptionModal
          prescription={selectedPrescription}
          isOpen={Boolean(selectedPrescription)}
          onClose={() => setSelectedPrescription(null)}
        />
      )}
    </div>
  );
};
