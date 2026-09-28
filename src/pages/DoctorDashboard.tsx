import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Appointment, DoctorStatus } from '../types';
import {
  Stethoscope,
  Users,
  Clock,
  Video,
  CheckCircle2,
  FileText,
  DollarSign,
  PhoneCall,
  Sliders,
  AlertCircle,
  Play,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { PrescriptionModal } from '../components/PrescriptionModal';

interface DoctorDashboardProps {
  onStartCall: (roomId: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onStartCall }) => {
  const { user, token } = useAuth();
  const { socket } = useSocket();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queueData, setQueueData] = useState<any>(null);
  const [currentStatus, setCurrentStatus] = useState<DoctorStatus>('AVAILABLE');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState<any>(null);

  const doctorId = user?.doctorId || 'doc-1';

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [apptsRes, queueRes] = await Promise.all([
        fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/queue/doctor/${doctorId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (apptsRes.ok) {
        const appts = await apptsRes.json();
        setAppointments(appts);
      }
      if (queueRes.ok) {
        const q = await queueRes.json();
        setQueueData(q);
        if (q.doctorStatus) setCurrentStatus(q.doctorStatus);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [doctorId, token]);

  // Update status
  const handleStatusUpdate = async (status: DoctorStatus) => {
    try {
      const res = await fetch('/api/doctors/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setCurrentStatus(status);
        socket?.emit('update-doctor-status', { doctorId, status });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Call Next Patient
  const handleCallNext = async () => {
    try {
      const res = await fetch('/api/queue/call-next', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ doctorId }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate earnings
  const completedAppts = appointments.filter((a) => a.status === 'COMPLETED');
  const totalEarnings = completedAppts.reduce((sum, a) => sum + (a.consultationFee || 500), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Doctor Header & Real-time Status Switcher */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-teal-500"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{user?.name}</h1>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full font-bold">
                Doctor Console
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Current Live Status: <strong className="text-white">{currentStatus}</strong>
            </p>
          </div>
        </div>

        {/* Live Status Toggle Pills */}
        <div className="bg-slate-800 p-1.5 rounded-2xl border border-slate-700 flex flex-wrap gap-1">
          <button
            onClick={() => handleStatusUpdate('AVAILABLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentStatus === 'AVAILABLE'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🟢 Available Now
          </button>

          <button
            onClick={() => handleStatusUpdate('IN_CONSULTATION')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentStatus === 'IN_CONSULTATION'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🟡 In Consultation
          </button>

          <button
            onClick={() => handleStatusUpdate('ON_BREAK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentStatus === 'ON_BREAK'
                ? 'bg-slate-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            ⚪ On Break
          </button>

          <button
            onClick={() => handleStatusUpdate('OFFLINE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentStatus === 'OFFLINE'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🔴 Offline
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today's Total</span>
          <div className="text-2xl font-black text-slate-900">{appointments.length}</div>
          <span className="text-xs text-slate-500">Scheduled Appointments</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live Queue</span>
          <div className="text-2xl font-black text-teal-600">{queueData?.totalWaiting || 0}</div>
          <span className="text-xs text-slate-500">Patients in waiting room</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed</span>
          <div className="text-2xl font-black text-emerald-600">{completedAppts.length}</div>
          <span className="text-xs text-slate-500">Consultations concluded</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Earnings</span>
          <div className="text-2xl font-black text-indigo-600">₹{totalEarnings}</div>
          <span className="text-xs text-slate-500">Razorpay verified payout</span>
        </div>
      </div>

      {/* Live Patient Queue Management */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900">Live Patient Queue (Real-Time)</h2>
            <p className="text-xs text-slate-500">
              Advance patients in order of booking. Estimated wait times auto-adjust based on consultation duration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
              title="Refresh queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleCallNext}
              disabled={!queueData?.totalWaiting}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Call Next Patient</span>
            </button>
          </div>
        </div>

        {queueData?.queue?.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No patients currently queued in the waiting room.
          </div>
        ) : (
          <div className="space-y-3">
            {queueData?.queue?.map((item: any) => {
              const isNext = item.status === 'NEXT';
              const inProgress = item.status === 'IN_PROGRESS';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    inProgress
                      ? 'bg-emerald-50/80 border-emerald-300'
                      : isNext
                      ? 'bg-amber-50/80 border-amber-300'
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                      #{item.queueNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.patientName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ({item.patientAge}y • {item.patientGender})
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            inProgress
                              ? 'bg-emerald-200 text-emerald-900'
                              : isNext
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 italic">
                        Chief Complaint: "{item.symptoms || 'Routine follow-up'}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {item.appointment?.roomId && (
                      <button
                        onClick={() => onStartCall(item.appointment.roomId)}
                        className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          inProgress
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        <span>{inProgress ? 'Resume Consultation' : 'Start Consultation'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Today's Full Schedule Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-black text-slate-900">Today's Appointment Schedule</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">Appointment ID</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Time Slot</th>
                <th className="p-3">Mode</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold text-slate-900">{a.appointmentNumber}</td>
                  <td className="p-3 font-semibold text-slate-800">{a.patient?.name || 'Patient'}</td>
                  <td className="p-3">{a.timeSlot}</td>
                  <td className="p-3 font-medium text-teal-700">{a.consultationMode}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {a.prescription ? (
                      <button
                        onClick={() => setSelectedRx(a.prescription)}
                        className="text-teal-600 hover:underline font-bold cursor-pointer"
                      >
                        View Rx
                      </button>
                    ) : (
                      <button
                        onClick={() => onStartCall(a.roomId)}
                        className="text-teal-600 hover:underline font-bold cursor-pointer"
                      >
                        Enter Room
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRx && (
        <PrescriptionModal
          prescription={selectedRx}
          isOpen={Boolean(selectedRx)}
          onClose={() => setSelectedRx(null)}
        />
      )}
    </div>
  );
};
