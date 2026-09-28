import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Calendar,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  XCircle,
  FileText,
  Activity,
  UserCheck,
  UserX,
  RefreshCw,
  Search,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, docsRes, logsRes] = await Promise.all([
        fetch('/api/admin/metrics', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/doctors', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/audit-logs', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (docsRes.ok) setDoctorsList(await docsRes.json());
      if (logsRes.ok) setAuditLogs(await logsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Approve or Reject doctor
  const handleVerifyDoctor = async (doctorId: string, status: 'APPROVED' | 'REJECTED') => {
    const notes = prompt(`Enter verification note for ${status.toLowerCase()} action:`) || 'Medical Council Verification Completed';
    try {
      const res = await fetch(`/api/admin/doctors/${doctorId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle user active status
  const handleToggleUserStatus = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">System & Medical Board Administration</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Platform governance, doctor registration verification, payments audit, and real-time operational telemetry.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Total Patients</span>
          <div className="text-xl font-black text-slate-900">{metrics?.cards?.totalPatients || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Total Doctors</span>
          <div className="text-xl font-black text-teal-700">{metrics?.cards?.totalDoctors || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Today's Appts</span>
          <div className="text-xl font-black text-slate-900">{metrics?.cards?.todayAppointments || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Completed</span>
          <div className="text-xl font-black text-emerald-600">{metrics?.cards?.completedConsultations || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Pending Verify</span>
          <div className="text-xl font-black text-amber-600">{metrics?.cards?.pendingDoctorVerification || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Gross Revenue</span>
          <div className="text-xl font-black text-indigo-700">₹{metrics?.cards?.totalRevenue || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Cancelled</span>
          <div className="text-xl font-black text-rose-600">{metrics?.cards?.cancelledAppointments || 0}</div>
        </div>
      </div>

      {/* Analytics Visual Charts (Appointments per Day & Specializations) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Per Day Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-black text-sm text-slate-900">Appointments Per Day (Last 7 Days)</h3>
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {metrics?.charts?.appointmentsPerDay?.map((d: any, idx: number) => {
              const heightPercent = Math.max(15, (d.count / 30) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-700">{d.count}</span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded-t-xl bg-gradient-to-t from-teal-600 to-emerald-400 transition-all"
                  />
                  <span className="text-[10px] text-slate-400">{d.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Consultations by Specialization */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-black text-sm text-slate-900">Consultations by Specialization</h3>
          <div className="space-y-3 pt-2">
            {metrics?.charts?.specializations &&
              Object.entries(metrics.charts.specializations).map(([spec, count]: any, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{spec}</span>
                    <span>{count} Consultations</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, (count / 10) * 100)}%` }}
                      className="h-full rounded-full bg-indigo-600"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Doctor Verification Management Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-slate-900">Medical Doctor Credentials Verification</h3>
            <p className="text-xs text-slate-500">
              Approve or reject doctor accounts to protect patient safety. Unverified doctors cannot receive bookings.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">{doctorsList.length} Registered Doctors</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">Doctor</th>
                <th className="p-3">Specialization</th>
                <th className="p-3">Registration No</th>
                <th className="p-3">Experience</th>
                <th className="p-3">Fee</th>
                <th className="p-3">Verification</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {doctorsList.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-900">
                    <div>{doc.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{doc.email}</div>
                  </td>
                  <td className="p-3 font-medium text-teal-700">{doc.specializationName}</td>
                  <td className="p-3 font-mono">{doc.registrationNumber}</td>
                  <td className="p-3">{doc.experienceYears} Yrs</td>
                  <td className="p-3 font-bold">₹{doc.consultationFee}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        doc.verificationStatus === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.verificationStatus === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {doc.verificationStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      {doc.verificationStatus !== 'APPROVED' && (
                        <button
                          onClick={() => handleVerifyDoctor(doc.id, 'APPROVED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {doc.verificationStatus !== 'REJECTED' && (
                        <button
                          onClick={() => handleVerifyDoctor(doc.id, 'REJECTED')}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleUserStatus(doc.userId)}
                        className="px-2 py-1 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-[11px] cursor-pointer"
                        title={doc.userActive ? 'Suspend Account' : 'Reactivate Account'}
                      >
                        {doc.userActive ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Audit Logs */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-black text-sm text-slate-900">Security & Clinical Audit Logs</h3>
        <div className="max-h-56 overflow-y-auto space-y-2 text-xs">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-slate-600"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">
                  {log.action}
                </span>
                <span>Resource: {log.resourceType} ({log.resourceId})</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
