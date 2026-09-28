import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Referral } from '../types';
import {
  MapPin,
  Building2,
  PhoneCall,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

export const ReferralsPage: React.FC = () => {
  const { token } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const res = await fetch('/api/referrals', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setReferrals(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReferrals();
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-teal-600" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Online-to-Offline Physical Examination Referrals</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          When clinical diagnosis requires direct physical palpation, cardiac auscultation, or urgent diagnostic scans.
        </p>
      </div>

      {/* Prominent Educational Notice */}
      <div className="bg-amber-50 border border-amber-200/90 rounded-3xl p-6 text-amber-900 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Why In-Person Examination Is Essential in Certain Cases</span>
        </div>
        <p className="leading-relaxed text-amber-900">
          While telemedicine handles a wide range of acute illnesses, rashes, and routine follow-ups, certain red-flag symptoms require in-person palpation (such as abdominal tenderness), deep chest auscultation with a physical stethoscope, or complex orthopedic mobility stress tests. Your doctor has identified that physical care will provide the safest, most comprehensive outcome.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading referral records...</div>
      ) : referrals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h4 className="font-bold text-slate-800">No physical exam referrals issued</h4>
          <p className="text-xs text-slate-500">
            If a consulting doctor marks that your symptoms require an in-person physical check-up, partnered clinics and booking instructions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {referrals.map((ref) => (
            <div
              key={ref.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Physical Examination Recommended
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1">
                    Referred by Dr. {ref.doctorName || 'Specialist'}
                  </h3>
                </div>
                <div className="text-xs text-slate-500">
                  Issued on: {new Date(ref.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                  Reason for In-Person Examination
                </h4>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-medium">
                  {ref.referralReason}
                </p>
              </div>

              {/* Nearby Clinics Directory */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider mb-3">
                  Partnered Diagnostic Clinics & In-Person Facilities
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ref.nearbyFacilities?.map((fac, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{fac.name}</span>
                          <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                            {fac.distance}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed">{fac.address}</p>
                        <p className="text-slate-600 text-[11px] flex items-center gap-1">
                          <PhoneCall className="w-3 h-3 text-teal-600" />
                          <span>{fac.phone}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80">
                        <span className="text-[10px] text-slate-400 block mb-1">Timings: {fac.timings}</span>
                        <button
                          onClick={() => window.open(`tel:${fac.phone}`)}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Call Facility to Book
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
