import React, { useState, useEffect } from 'react';
import { Doctor, Specialization } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Search,
  Filter,
  ShieldCheck,
  Star,
  Video,
  Phone,
  MessageSquare,
  Clock,
  Sparkles,
  MapPin,
  Stethoscope,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import { BookingModal } from '../components/BookingModal';

interface DoctorsPageProps {
  initialSpecialty?: string;
  initialQuery?: string;
  onBookSuccess?: (appt: any) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({
  initialSpecialty = '',
  initialQuery = '',
  onBookSuccess,
}) => {
  const { t } = useAuth();
  const { doctorStatusUpdates } = useSocket();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSpec, setSelectedSpec] = useState(initialSpecialty);
  const [selectedLang, setSelectedLang] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');
  const [maxFee, setMaxFee] = useState<number>(1000);
  const [minExp, setMinExp] = useState<number>(0);
  const [cityFilter, setCityFilter] = useState('all');

  // Modals
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [selectedProfileDoctor, setSelectedProfileDoctor] = useState<Doctor | null>(null);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedSpec && selectedSpec !== 'all') params.append('specialization', selectedSpec);
      if (selectedLang !== 'all') params.append('language', selectedLang);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedMode !== 'all') params.append('mode', selectedMode);
      if (maxFee < 1000) params.append('maxFee', maxFee.toString());
      if (minExp > 0) params.append('minExperience', minExp.toString());
      if (cityFilter !== 'all') params.append('city', cityFilter);

      const res = await fetch(`/api/doctors?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setDoctors(data);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const res = await fetch('/api/doctors/specializations');
      const data = await res.json();
      if (res.ok) setSpecializations(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSpecializations();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpec, selectedLang, selectedStatus, selectedMode, maxFee, minExp, cityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpec('all');
    setSelectedLang('all');
    setSelectedStatus('all');
    setSelectedMode('all');
    setMaxFee(1000);
    setMinExp(0);
    setCityFilter('all');
  };

  const getStatusBadge = (doc: Doctor) => {
    // Check if live socket updated status
    const currentStatus = doctorStatusUpdates[doc.id] || doc.currentStatus;

    if (currentStatus === 'AVAILABLE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>🟢 Available Now</span>
        </span>
      );
    } else if (currentStatus === 'IN_CONSULTATION') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>🟡 In Consultation</span>
        </span>
      );
    } else if (currentStatus === 'ON_BREAK') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span>⚪ On Break</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>🔴 Offline</span>
        </span>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Verified Medical Specialists</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Search by clinical specialty, spoken languages (Telugu, Hindi, English), live queue availability, and consultation mode.
        </p>
      </div>

      {/* Main Grid: Filters Sidebar + Doctor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Filter className="w-4 h-4 text-teal-600" />
              <span>Filter Doctors</span>
            </div>
            <button
              onClick={clearFilters}
              className="text-xs text-teal-600 hover:text-teal-800 font-semibold cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Search query input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Doctor Name or Keywords
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDoctors()}
                placeholder="e.g. Ananya, Heart, Skin"
                className="w-full text-xs bg-transparent focus:outline-hidden text-slate-900"
              />
            </div>
          </div>

          {/* Specialization Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Specialization
            </label>
            <select
              value={selectedSpec}
              onChange={(e) => setSelectedSpec(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-hidden focus:border-teal-500 cursor-pointer"
            >
              <option value="all">All Specialties</option>
              {specializations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Spoken Language Filter (English, Telugu, Hindi) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Languages Spoken
            </label>
            <div className="space-y-1.5">
              {[
                { code: 'all', label: 'All Languages' },
                { code: 'te', label: 'Telugu (తెలుగు)' },
                { code: 'hi', label: 'Hindi (हिंदी)' },
                { code: 'en', label: 'English' },
              ].map((lang) => (
                <label key={lang.code} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="language-filter"
                    checked={selectedLang === lang.code}
                    onChange={() => setSelectedLang(lang.code)}
                    className="text-teal-600 focus:ring-0"
                  />
                  <span>{lang.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Real-time Status Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Availability Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-hidden focus:border-teal-500 cursor-pointer"
            >
              <option value="all">Any Status</option>
              <option value="AVAILABLE">🟢 Available Now</option>
              <option value="IN_CONSULTATION">🟡 In Consultation</option>
              <option value="ON_BREAK">⚪ On Break</option>
              <option value="OFFLINE">🔴 Offline</option>
            </select>
          </div>

          {/* Consultation Type (Video, Audio, Chat) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Consultation Mode
            </label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-hidden focus:border-teal-500 cursor-pointer"
            >
              <option value="all">All Modes (Video, Audio, Chat)</option>
              <option value="VIDEO">Video Consultation</option>
              <option value="AUDIO">Audio Consultation</option>
              <option value="CHAT">Chat Consultation</option>
            </select>
          </div>

          {/* Consultation Fee Range */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              <span>Max Fee</span>
              <span className="text-teal-700 font-extrabold">₹{maxFee}</span>
            </div>
            <input
              type="range"
              min="300"
              max="1000"
              step="50"
              value={maxFee}
              onChange={(e) => setMaxFee(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          {/* Location / City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              City / Clinic Location
            </label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-hidden focus:border-teal-500 cursor-pointer"
            >
              <option value="all">All Cities</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Visakhapatnam">Visakhapatnam</option>
            </select>
          </div>
        </div>

        {/* Doctor Cards Listing */}
        <div className="lg:col-span-3 space-y-4">
          {isLoading ? (
            <div className="py-20 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-600" />
              <p className="text-sm">Loading verified doctors & live status...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">No doctors match your selected filters</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your fee range, choosing "All Languages", or resetting the search query.
              </p>
              <button
                onClick={clearFilters}
                className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {doctors.map((doc) => {
                const liveStatus = doctorStatusUpdates[doc.id] || doc.currentStatus;
                const isInConsultation = liveStatus === 'IN_CONSULTATION';

                return (
                  <div
                    key={doc.id}
                    className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-teal-500/80 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    {/* Left details */}
                    <div className="flex items-start gap-4">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.name}
                        className="w-20 h-20 rounded-2xl object-cover ring-2 ring-teal-500/20 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 leading-tight">{doc.name}</h3>
                          {doc.isVerified && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                              <span>Verified</span>
                            </span>
                          )}
                          {getStatusBadge(doc)}
                        </div>

                        <p className="text-xs font-bold text-teal-700">{doc.specializationName}</p>
                        <p className="text-xs text-slate-600 font-medium">{doc.qualification}</p>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-1">
                          <span>{doc.experienceYears} years experience</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">
                            {doc.languages
                              .map((l) => (l === 'te' ? 'Telugu' : l === 'hi' ? 'Hindi' : 'English'))
                              .join(' | ')}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {doc.city}
                          </span>
                        </div>

                        {/* Consultation Modes Support */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Video className="w-3.5 h-3.5 text-teal-600" /> Video
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-teal-600" /> Audio
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-teal-600" /> Chat
                          </span>
                        </div>

                        {/* Live queue dynamic wait message when in consultation */}
                        {isInConsultation && (
                          <div className="mt-2 text-xs bg-amber-50 text-amber-900 border border-amber-200/80 px-3 py-1.5 rounded-xl flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span>
                              Currently in consultation • Active queue: {doc.queueCount || 2} • Est. wait: ~{doc.estimatedWaitMinutes || 20} mins
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side: Fee & Buttons */}
                    <div className="w-full md:w-48 shrink-0 flex flex-col items-start md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 gap-3">
                      <div className="text-left md:text-right">
                        <span className="text-[11px] text-slate-400 uppercase font-semibold">Consultation Fee</span>
                        <div className="text-xl font-black text-slate-900">₹{doc.consultationFee}</div>
                        <div className="flex items-center md:justify-end gap-1 text-xs text-slate-500 mt-0.5">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-slate-800">{doc.rating}</span>
                          <span>({doc.totalReviews} reviews)</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 w-full">
                        <button
                          onClick={() => setSelectedProfileDoctor(doc)}
                          className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer text-center"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => setBookingDoctor(doc)}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer text-center"
                        >
                          Consult Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          isOpen={Boolean(bookingDoctor)}
          onClose={() => setBookingDoctor(null)}
          onSuccess={(appt) => {
            setBookingDoctor(null);
            if (onBookSuccess) onBookSuccess(appt);
          }}
        />
      )}

      {/* Doctor Profile Detailed Modal */}
      {selectedProfileDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProfileDoctor.avatarUrl}
                  alt={selectedProfileDoctor.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-500"
                />
                <div>
                  <h3 className="font-bold text-base">{selectedProfileDoctor.name}</h3>
                  <p className="text-xs text-teal-300">{selectedProfileDoctor.specializationName}</p>
                  <p className="text-[11px] text-slate-400">Reg No: {selectedProfileDoctor.registrationNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProfileDoctor(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">About Doctor</h4>
                <p className="text-slate-600 leading-relaxed">{selectedProfileDoctor.bio}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">Qualifications & Experience</h4>
                <p className="text-slate-700">{selectedProfileDoctor.qualification} • {selectedProfileDoctor.experienceYears} Years Clinical Practice</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">Clinic / Hospital Affiliation</h4>
                <p className="text-slate-700">{selectedProfileDoctor.clinicAddress}, {selectedProfileDoctor.city}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">Supported Languages</h4>
                <div className="flex gap-2">
                  {selectedProfileDoctor.languages.map((l) => (
                    <span key={l} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs">
                      {l === 'te' ? 'Telugu (తెలుగు)' : l === 'hi' ? 'Hindi (हिंदी)' : 'English'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">Fee per Consultation</span>
                  <span className="text-lg font-black text-slate-900">₹{selectedProfileDoctor.consultationFee}</span>
                </div>
                <button
                  onClick={() => {
                    setBookingDoctor(selectedProfileDoctor);
                    setSelectedProfileDoctor(null);
                  }}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
