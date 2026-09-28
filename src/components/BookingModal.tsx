import React, { useState } from 'react';
import { Doctor, ConsultationMode } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  MessageSquare,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface BookingModalProps {
  doctor: Doctor;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appointment: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  doctor,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, token, login } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string>(doctor.slots[0] || '10:00 AM - 10:20 AM');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>('VIDEO');
  const [symptoms, setSymptoms] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'CONFIRMED'>('DETAILS');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  // Check booked slots for this doctor on the selected date to prevent conflict
  React.useEffect(() => {
    const fetchBookedSlots = async () => {
      try {
        const res = await fetch(`/api/appointments/booked-slots/${doctor.id}?date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          const booked = data.bookedSlots || [];
          setBookedSlots(booked);
          if (booked.includes(selectedSlot)) {
            const firstAvail = doctor.slots.find((s) => !booked.includes(s));
            if (firstAvail) setSelectedSlot(firstAvail);
          }
        }
      } catch (err) {
        console.error('Failed to fetch booked slots:', err);
      }
    };
    if (doctor?.id && selectedDate) {
      fetchBookedSlots();
    }
  }, [doctor?.id, selectedDate]);

  if (!isOpen) return null;

  const handleProceedToPayment = () => {
    if (!selectedDate || !selectedSlot) {
      setErrorMessage('Please select both a date and an appointment slot.');
      return;
    }
    if (bookedSlots.includes(selectedSlot)) {
      setErrorMessage('This time slot is already booked. Please choose an available slot.');
      return;
    }
    setErrorMessage('');
    setStep('PAYMENT');
  };

  const handleConfirmAndPay = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      let activeToken = token;
      // If user is not logged in or logged in as a non-patient, ensure valid patient session
      if (!activeToken || user?.role !== 'PATIENT') {
        const loggedInUser = await login('patient@medilink.com', 'Patient@123');
        activeToken = localStorage.getItem('medilink_token');
      }

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          doctorId: doctor.id,
          appointmentDate: selectedDate,
          timeSlot: selectedSlot,
          consultationMode,
          symptomsDescription: symptoms || 'Routine consultation',
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to book appointment.');
      }

      setBookedAppointment(data.appointment);
      setStep('CONFIRMED');
      onSuccess(data.appointment);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong during checkout.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={doctor.avatarUrl}
              alt={doctor.name}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-teal-500"
            />
            <div>
              <h3 className="font-bold text-base leading-tight">{doctor.name}</h3>
              <p className="text-xs text-teal-300 font-medium">{doctor.specializationName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 'DETAILS' && (
            <div className="space-y-5">
              {/* Logged in patient notice */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>
                    Booking as Patient: <strong>{user?.role === 'PATIENT' ? user.name : 'Naveen Gunti (Auto-linked)'}</strong>
                  </span>
                </div>
                {user?.role !== 'PATIENT' && (
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                    Auto-Linked Patient
                  </span>
                )}
              </div>

              {/* Date selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Select Date
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-hidden focus:border-teal-500"
                  />
                  {selectedDate === todayStr && (
                    <span className="shrink-0 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1.5 rounded-xl">
                      Today (Instant Queue)
                    </span>
                  )}
                </div>
              </div>

              {/* Slots selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. Select Time Slot
                  </label>
                  {bookedSlots.length > 0 && (
                    <span className="text-[11px] text-amber-700 font-medium">
                      {bookedSlots.length} slot(s) already filled
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {doctor.slots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBooked}
                        onClick={() => !isBooked && setSelectedSlot(slot)}
                        className={`p-2.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                          isBooked
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                            : selectedSlot === slot
                            ? 'border-teal-600 bg-teal-50/80 text-teal-900 shadow-xs cursor-pointer'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className={`w-3.5 h-3.5 ${isBooked ? 'text-slate-400' : 'text-teal-600'} shrink-0`} />
                          <span>{slot}</span>
                        </div>
                        {isBooked && (
                          <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                            Booked
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Consultation Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. Consultation Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultationMode('VIDEO')}
                    className={`p-3 rounded-xl text-xs font-medium border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                      consultationMode === 'VIDEO'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-5 h-5 text-teal-600" />
                    <span>Video Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationMode('AUDIO')}
                    className={`p-3 rounded-xl text-xs font-medium border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                      consultationMode === 'AUDIO'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Phone className="w-5 h-5 text-teal-600" />
                    <span>Audio Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationMode('CHAT')}
                    className={`p-3 rounded-xl text-xs font-medium border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                      consultationMode === 'CHAT'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5 text-teal-600" />
                    <span>Chat</span>
                  </button>
                </div>
              </div>

              {/* Symptoms / Chief Complaint */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  4. Symptoms / Notes for Doctor (Optional)
                </label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms, how long you have had them, or reason for visit..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              {/* Consultation Fee summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Consultation Fee</span>
                  <div className="text-lg font-extrabold text-slate-900">₹{doctor.consultationFee}</div>
                </div>
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Proceed to Payment →
                </button>
              </div>
            </div>
          )}

          {step === 'PAYMENT' && (
            <div className="space-y-5">
              <div className="bg-teal-50/80 border border-teal-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-teal-900 font-medium mb-1">
                  <span>Consultation Fee:</span>
                  <span>₹{doctor.consultationFee}.00</span>
                </div>
                <div className="flex items-center justify-between text-xs text-teal-900 font-medium mb-2">
                  <span>Platform & Telehealth Fee:</span>
                  <span className="text-emerald-700 font-bold">FREE</span>
                </div>
                <div className="border-t border-teal-200 pt-2 flex items-center justify-between font-bold text-slate-900 text-sm">
                  <span>Total Payable:</span>
                  <span>₹{doctor.consultationFee}.00</span>
                </div>
              </div>

              {/* Payment Method Selector (Razorpay Ready) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Payment Method (Razorpay Test Gateway)
                </label>
                <div className="space-y-2">
                  {['UPI', 'Credit/Debit Card', 'Net Banking'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`w-full p-3 rounded-xl text-xs font-semibold border flex items-center justify-between cursor-pointer transition-all ${
                        paymentMethod === method
                          ? 'border-teal-600 bg-teal-50/70 text-teal-900'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="w-4 h-4 text-teal-600" />
                        <span>{method}</span>
                      </div>
                      <span className="text-[11px] text-teal-700">Instant Verification</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Razorpay Sandboxed Mode: Test transaction will be processed instantly without real money deduction.
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleConfirmAndPay}
                  className="flex-1 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Processing Tokenized Payment...' : `Pay ₹${doctor.consultationFee} & Confirm Slot`}
                </button>
              </div>
            </div>
          )}

          {step === 'CONFIRMED' && bookedAppointment && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Appointment Confirmed!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your appointment ID is <strong>{bookedAppointment.appointmentNumber}</strong>
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor:</span>
                  <span className="font-semibold text-slate-900">{doctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Slot:</span>
                  <span className="font-semibold text-slate-900">{bookedAppointment.appointmentDate} • {bookedAppointment.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode:</span>
                  <span className="font-semibold text-teal-700">{bookedAppointment.consultationMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-600">CONFIRMED (PAID)</span>
                </div>
              </div>

              {selectedDate === todayStr && (
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>
                    You have been placed in today's live queue! Check your position in <strong>My Appointments</strong>.
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Go to My Appointments
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
