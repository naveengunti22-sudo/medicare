import React from 'react';
import { Stethoscope, ShieldCheck, PhoneCall, AlertCircle, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const { t } = useAuth();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      {/* Emergency Helpline Bar */}
      <div className="bg-rose-950/60 border-b border-rose-900/50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-rose-200 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Emergency Care Hotline:</strong> In case of heart attack, stroke, acute trauma or loss of consciousness, do not book online consultations.
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono font-bold text-rose-300">
            <span>National Emergency: 112</span>
            <span>•</span>
            <span>Ambulance: 108</span>
            <span>•</span>
            <span>Women Helpline: 1091</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">MediLink</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intelligent doctor consultation and longitudinal healthcare system. Eliminating unpredictable waiting times with live queue tracking, connectivity-aware consultations, and digital health records.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>MCI Telemedicine Practice Compliant</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Patient Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentTab('doctors')} className="hover:text-white transition-colors cursor-pointer">
                  Find Verified Doctors
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('patient-dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  Live Queue & Appointments
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('timeline')} className="hover:text-white transition-colors cursor-pointer">
                  Patient Health Timeline
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('vault')} className="hover:text-white transition-colors cursor-pointer">
                  Medical Report Vault
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('prescriptions')} className="hover:text-white transition-colors cursor-pointer">
                  Digital Prescriptions
                </button>
              </li>
            </ul>
          </div>

          {/* Specialties */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Specialties</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>General Medicine & Fever Clinic</li>
              <li>Cardiology & Preventive Heart Care</li>
              <li>Clinical Dermatology & Allergies</li>
              <li>Orthopedics & Joint Rehabilitation</li>
              <li>Pediatrics & Child Wellness</li>
              <li>Neurology & Headache Clinic</li>
            </ul>
          </div>

          {/* Safety & Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Safety & Privacy</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Medical records and consultations are protected with end-to-end consent controls. Patients explicitly control doctor document permissions.
            </p>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
              <div className="text-slate-200 font-semibold mb-1">Razorpay Verified Architecture</div>
              <div className="text-[11px] text-slate-400">Zero card data storage. Tokenized payments.</div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} MediLink Healthcare Systems. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentTab('emergency')} className="hover:text-slate-300 cursor-pointer">
              Emergency Disclaimers
            </button>
            <span>•</span>
            <span>English • తెలుగు • हिंदी</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
