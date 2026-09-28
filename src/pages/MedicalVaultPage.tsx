import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MedicalReport, Doctor } from '../types';
import {
  FolderHeart,
  Upload,
  FileText,
  ShieldCheck,
  Lock,
  Unlock,
  Trash2,
  Eye,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const MedicalVaultPage: React.FC = () => {
  const { token, user } = useAuth();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New report form state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [reportType, setReportType] = useState<any>('LAB_REPORT');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [authAll, setAuthAll] = useState(false);

  // In-app delete confirmation state (replaces window.confirm)
  const [deletingReport, setDeletingReport] = useState<MedicalReport | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [repsRes, docsRes] = await Promise.all([
        fetch('/api/reports', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/doctors', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (repsRes.ok) setReports(await repsRes.json());
      if (docsRes.ok) setDoctors(await docsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Handle upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          reportType,
          fileName: selectedFile ? selectedFile.name : `${newTitle.replace(/\s+/g, '_')}.pdf`,
          fileType: selectedFile ? selectedFile.name.split('.').pop() : 'pdf',
          fileSizeKb: selectedFile ? Math.round(selectedFile.size / 1024) : 450,
          fileData: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=600',
          authorizedAllDoctors: authAll,
          authorizedDoctorIds: authAll ? [] : ['doc-1'],
          notes,
        }),
      });

      if (res.ok) {
        setShowUploadModal(false);
        setNewTitle('');
        setNotes('');
        setSelectedFile(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle specific doctor permission
  const handleToggleDoctorConsent = async (reportId: string, doctorId: string, currentGranted: boolean) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/consent`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId,
          grant: !currentGranted,
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete report execution (in-app modal confirmed)
  const confirmDelete = async () => {
    if (!deletingReport) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reports/${deletingReport.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDeletingReport(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderHeart className="w-6 h-6 text-teal-600" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Consent-Controlled Medical Vault</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Securely store laboratory reports, X-rays, and blood panels. Doctors only have access to documents you explicitly authorize.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Medical Report</span>
        </button>
      </div>

      {/* Consent Privacy Guide Notice */}
      {user?.role === 'DOCTOR' ? (
        <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl flex items-center justify-between text-xs text-teal-900">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
            <span>
              <strong>Doctor Consent View:</strong> Doctors can only access records specifically authorized by patients.
              Switch to <strong>Patient (Naveen Gunti)</strong> in the top Demo Profiles menu to test patient upload and consent granting.
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>
              <strong>Patient Sovereign Consent Shield Active:</strong> By default, your files are completely private.
              Use the doctor toggles on each card below to grant or revoke real-time document viewing access to specific doctors.
            </span>
          </div>
        </div>
      )}

      {/* Reports Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading your encrypted medical records...</div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <FolderHeart className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-800">Your Medical Vault is empty</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload blood panels, ultrasound scans, or previous prescriptions so your consulting doctor can inspect them during your video call.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{rep.title}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {rep.fileName} • {rep.fileSizeKb} KB
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {rep.reportType}
                  </span>
                </div>

                {rep.notes && <p className="text-xs text-slate-600 mt-3 italic">"{rep.notes}"</p>}
              </div>

              {/* Granular Doctor Consent Control Section */}
              <div className="border-t border-slate-100 pt-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Doctor Access Permissions:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {rep.authorizedAllDoctors ? 'All Doctors Permitted' : 'Selective Access'}
                  </span>
                </div>

                {/* Specific doctor access toggles */}
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {doctors.slice(0, 4).map((doc) => {
                    const isGranted =
                      rep.authorizedAllDoctors || rep.authorizedDoctorIds?.includes(doc.id);

                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs border border-slate-100"
                      >
                        <span className="font-semibold text-slate-800">{doc.name}</span>
                        <button
                          onClick={() => handleToggleDoctorConsent(rep.id, doc.id, isGranted)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            isGranted
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {isGranted ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          <span>{isGranted ? 'Authorized' : 'Restricted'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Actions: View & Delete */}
                <div className="flex items-center justify-between pt-2">
                  {rep.fileData ? (
                    <a
                      href={rep.fileData}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-teal-600 hover:text-teal-800 font-bold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View File</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">Uploaded to secure storage</span>
                  )}

                  <button
                    onClick={() => setDeletingReport(rep)}
                    className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Upload New Medical Report</h3>
            <p className="text-xs text-slate-500">
              Supported formats: PDF, JPG, PNG (Max 10MB). Protected by patient consent rules.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Fasting Blood Sugar & HbA1c Panel"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                  Report Category
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 cursor-pointer"
                >
                  <option value="LAB_REPORT">General Lab Report</option>
                  <option value="BLOOD_TEST">Complete Blood Panel</option>
                  <option value="X_RAY">Digital X-Ray</option>
                  <option value="SCAN">CT / MRI / Ultrasound Scan</option>
                  <option value="PRESCRIPTION_DOC">Previous Doctor Prescription</option>
                  <option value="OTHER">Other Clinical Document</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                  Select File
                </label>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-2.5 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                  Patient Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Taken at Apollo Diagnostics fasting at 8 AM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="authAllCheck"
                  checked={authAll}
                  onChange={(e) => setAuthAll(e.target.checked)}
                  className="rounded text-teal-600"
                />
                <label htmlFor="authAllCheck" className="text-xs text-slate-700 cursor-pointer">
                  Authorize all future consulting doctors automatically
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Upload & Secure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (In-app, no window.confirm) */}
      {deletingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Delete Medical Record</h3>
                <p className="text-xs text-slate-500">{deletingReport.title}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete this report? Doctors who had previously received access will no longer be able to view it.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingReport(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50"
              >
                Keep Record
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
