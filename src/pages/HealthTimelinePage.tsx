import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  FileText,
  Activity,
  Stethoscope,
  Heart,
  Sparkles,
  ShieldCheck,
  Eye,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { PrescriptionModal } from '../components/PrescriptionModal';

export const HealthTimelinePage: React.FC = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [selectedRx, setSelectedRx] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [apptsRes, repsRes, rxsRes] = await Promise.all([
          fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/reports', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/prescriptions', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (apptsRes.ok) setAppointments(await apptsRes.json());
        if (repsRes.ok) setReports(await repsRes.json());
        if (rxsRes.ok) setPrescriptions(await rxsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Merge and sort chronological timeline events
  const timelineEvents: any[] = [];

  appointments.forEach((a) => {
    timelineEvents.push({
      id: `ev-appt-${a.id}`,
      date: a.appointmentDate,
      type: 'CONSULTATION',
      title: `${a.doctor?.specializationName || 'Doctor'} Consultation`,
      doctorName: a.doctor?.name,
      status: a.status,
      description: a.symptomsDescription,
      prescription: a.prescription,
      roomId: a.roomId,
    });
  });

  reports.forEach((r) => {
    timelineEvents.push({
      id: `ev-rep-${r.id}`,
      date: r.uploadedAt.split('T')[0],
      type: 'REPORT',
      title: `Medical Document: ${r.title}`,
      reportType: r.reportType,
      fileName: r.fileName,
      fileData: r.fileData,
      notes: r.notes,
    });
  });

  // Sort descending by date
  timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-teal-600" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Longitudinal Patient Health Timeline</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Chronological medical journey connecting past consultations, diagnostic reports, digital prescriptions, and follow-ups.
        </p>
      </div>

      {/* Patient Vitals Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Patient Profile</span>
          <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
          <p className="text-xs text-slate-500">Blood Group: <strong>O+</strong> • Penicillin Allergy</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Patient-Consent Controlled Health Vault</span>
        </div>
      </div>

      {/* Chronological Tree */}
      <div className="relative border-l-2 border-teal-200 ml-4 pl-6 space-y-8">
        {timelineEvents.map((ev) => {
          const isConsultation = ev.type === 'CONSULTATION';
          const isReport = ev.type === 'REPORT';

          return (
            <div key={ev.id} className="relative group">
              {/* Timeline Bullet Node */}
              <div
                className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center ${
                  isConsultation
                    ? 'border-teal-600 text-teal-600'
                    : 'border-indigo-600 text-indigo-600'
                }`}
              >
                {isConsultation ? <Stethoscope className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              </div>

              {/* Event Content Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2 hover:border-teal-400 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                    {ev.date}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    {ev.type}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{ev.title}</h3>

                {isConsultation && (
                  <div className="space-y-1 text-xs text-slate-600">
                    <p>Consulting Specialist: <strong>{ev.doctorName}</strong></p>
                    {ev.description && <p className="italic text-slate-500">"{ev.description}"</p>}

                    {ev.prescription && (
                      <div className="pt-2">
                        <button
                          onClick={() => setSelectedRx(ev.prescription)}
                          className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Digital Prescription ({ev.prescription.prescriptionNumber})</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {isReport && (
                  <div className="space-y-1 text-xs text-slate-600">
                    <p className="font-semibold text-slate-700">Category: {ev.reportType}</p>
                    <p className="text-slate-500">{ev.notes || ev.fileName}</p>
                    {ev.fileData && (
                      <div className="pt-1">
                        <a
                          href={ev.fileData}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-600 hover:underline flex items-center gap-1 font-semibold text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Uploaded Report</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
