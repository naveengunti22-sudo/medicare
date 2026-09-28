import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, HeartPulse, Stethoscope, ArrowRight } from 'lucide-react';

interface EmergencyPageProps {
  onBackToSafety: () => void;
}

export const EmergencyPage: React.FC<EmergencyPageProps> = ({ onBackToSafety }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* High-Impact Alert Banner */}
      <div className="bg-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Emergency Medical Services Disclaimer</h1>
            <p className="text-xs text-rose-100 font-medium mt-0.5">MediLink Telemedicine Safety Protocol</p>
          </div>
        </div>

        <p className="text-sm sm:text-base leading-relaxed text-rose-50 font-medium">
          <strong>CRITICAL WARNING:</strong> MediLink is an online elective consultation and scheduling platform designed exclusively for non-acute, non-emergency conditions. Telehealth cannot substitute for hospital trauma wards, acute stroke intervention, or resuscitation equipment.
        </p>

        <div className="pt-2 flex flex-wrap gap-4">
          <a
            href="tel:112"
            className="px-6 py-3 rounded-2xl bg-white text-rose-700 font-black text-sm shadow-md hover:bg-rose-50 transition-colors flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-rose-600" />
            <span>Dial National Emergency (112)</span>
          </a>
          <a
            href="tel:108"
            className="px-6 py-3 rounded-2xl bg-rose-900/80 hover:bg-rose-900 text-white font-black text-sm border border-rose-400 transition-colors flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-rose-300" />
            <span>Dial Ambulance Service (108)</span>
          </a>
        </div>
      </div>

      {/* Red Flag Symptoms Checklist */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-900">Immediate Red-Flag Symptoms</h2>
          <p className="text-xs text-slate-500 mt-1">
            If you or someone in your care is experiencing any of the following, seek immediate in-person emergency care without delay:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-rose-700 text-sm">Cardiovascular & Respiratory</div>
            <ul className="list-disc list-inside text-slate-700 space-y-1 pt-1">
              <li>Sudden severe or crushing chest pressure radiating to arm, neck or jaw</li>
              <li>Extreme shortness of breath or struggling to draw air</li>
              <li>Bluish lips or fingertips (cyanosis)</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-rose-700 text-sm">Neurological (FAST Stroke Signs)</div>
            <ul className="list-disc list-inside text-slate-700 space-y-1 pt-1">
              <li>Sudden facial drooping, arm weakness, or slurred speech</li>
              <li>Unexplained sudden loss of consciousness or seizures</li>
              <li>Worst headache of life with neck stiffness</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-rose-700 text-sm">Severe Trauma & Hemorrhage</div>
            <ul className="list-disc list-inside text-slate-700 space-y-1 pt-1">
              <li>Heavy uncontrolled bleeding</li>
              <li>Head trauma followed by vomiting or confusion</li>
              <li>Deep puncture wounds or compound bone fractures</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-rose-700 text-sm">Allergic & Poisoning Emergencies</div>
            <ul className="list-disc list-inside text-slate-700 space-y-1 pt-1">
              <li>Severe anaphylaxis with swollen throat, tongue, and hives</li>
              <li>Suspected ingestion of toxic chemicals or drug overdose</li>
              <li>Snakebite or high-voltage electric shock</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex justify-end">
          <button
            onClick={onBackToSafety}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            I Understand — Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
