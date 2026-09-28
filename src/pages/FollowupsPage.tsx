import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Followup } from '../types';
import { Clock, Calendar, CheckCircle2, Stethoscope, ArrowRight } from 'lucide-react';

interface FollowupsPageProps {
  onBookFollowup: (docId: string) => void;
}

export const FollowupsPage: React.FC<FollowupsPageProps> = ({ onBookFollowup }) => {
  const { token } = useAuth();
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        const res = await fetch('/api/followups', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setFollowups(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFollowups();
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-teal-600" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Doctor Follow-up Schedule</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Automated clinical reminders ensuring continuity of care following previous consultations.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading follow-ups...</div>
      ) : followups.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Clock className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="font-bold text-slate-800">No pending follow-ups</h4>
          <p className="text-xs text-slate-500">
            When a doctor recommends a review appointment (e.g. after 7 days of medication), it will appear here with 1-click booking.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {followups.map((f) => (
            <div
              key={f.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    Due: {f.recommendedDate}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Status: {f.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">
                  Follow-up with {f.doctor?.name} ({f.doctor?.specializationName})
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Clinical Reason:</strong> {f.reason}
                </p>

                {f.consultationNotes && (
                  <p className="text-xs text-slate-500 italic">
                    Previous Assessment: "{f.consultationNotes}"
                  </p>
                )}
              </div>

              <button
                onClick={() => onBookFollowup(f.doctorId)}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-colors cursor-pointer shrink-0"
              >
                <span>Book Follow-up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
