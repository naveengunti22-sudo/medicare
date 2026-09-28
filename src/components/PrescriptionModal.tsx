import React from 'react';
import { Prescription } from '../types';
import { X, Printer, Download, Stethoscope, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';

interface PrescriptionModalProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  prescription,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 print:m-0 print:p-0 print:shadow-none print:w-full">
        {/* Top actions toolbar (hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            <span className="font-bold text-sm">Digital Prescription Document</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Prescription Body */}
        <div className="p-8 font-sans print:p-6" id="prescription-printable">
          {/* Header */}
          <div className="border-b-2 border-teal-600 pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-teal-700">
                <Stethoscope className="w-6 h-6 text-teal-600" />
                <span className="text-xl font-black tracking-tight">MediLink TeleHealth Clinic</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{prescription.doctor?.name || 'Dr. Medical Specialist'}</h2>
              <p className="text-xs text-slate-600 font-medium">{prescription.doctor?.qualification}</p>
              <p className="text-xs text-slate-500">{prescription.doctor?.specializationName} • Reg No: {prescription.doctor?.regNo || 'MCI-VERIFIED'}</p>
              <p className="text-xs text-slate-400">{prescription.doctor?.clinicAddress || 'Virtual Consultation Suite'}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-teal-700 font-serif italic">℞</span>
              <div className="text-xs font-mono font-bold text-slate-800 mt-2">{prescription.prescriptionNumber}</div>
              <div className="text-xs text-slate-500">
                Date: {new Date(prescription.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Patient Details Sub-header */}
          <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Patient Name:</span>
              <span className="font-bold text-slate-800">{prescription.patient?.name || 'Patient'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Age / Gender:</span>
              <span className="font-semibold text-slate-800">{prescription.patient?.age || '32'} Yrs • {prescription.patient?.gender || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Blood Group:</span>
              <span className="font-semibold text-slate-800">{prescription.patient?.bloodGroup || 'O+'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Known Allergies:</span>
              <span className="font-semibold text-rose-600">{prescription.patient?.bloodGroup ? 'None reported' : 'Penicillin'}</span>
            </div>
          </div>

          {/* Clinical Diagnosis */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Clinical Diagnosis</h4>
            <div className="text-sm font-bold text-teal-950 bg-teal-50/60 p-3 rounded-xl border border-teal-100">
              {prescription.diagnosis}
            </div>
          </div>

          {/* Medicines Table */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Prescribed Medication (Rx)</h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Medicine & Strength</th>
                    <th className="p-3">Dosage / Frequency</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {prescription.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{item.medicineName}</td>
                      <td className="p-3 font-semibold text-teal-700">{item.dosage} • {item.frequency}</td>
                      <td className="p-3">{item.duration}</td>
                      <td className="p-3 text-slate-600 italic">{item.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* General Advice & Recommended Tests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {prescription.generalAdvice && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Lifestyle & General Advice</h5>
                <p className="text-xs text-slate-700 leading-relaxed">{prescription.generalAdvice}</p>
              </div>
            )}
            {prescription.labTestsRecommended && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Recommended Laboratory Tests</h5>
                <p className="text-xs text-slate-700 leading-relaxed">{prescription.labTestsRecommended}</p>
              </div>
            )}
          </div>

          {/* Follow-up Reminder & Signature */}
          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              {prescription.followupDate && (
                <div className="text-xs">
                  <span className="text-slate-400">Next Scheduled Follow-up: </span>
                  <span className="font-bold text-teal-700">{prescription.followupDate}</span>
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-1">
                Generated securely via MediLink Digital Prescription System. Non-narcotic teleconsultation record.
              </p>
            </div>
            <div className="text-right sm:text-right">
              <div className="font-serif italic text-sm text-teal-800 font-bold border-b border-slate-300 pb-1 px-4">
                {prescription.doctor?.name || 'Dr. Registered Physician'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Authorized Digital Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
