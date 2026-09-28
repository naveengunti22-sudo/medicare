import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  Clock,
  Video,
  ShieldCheck,
  Bot,
  ArrowRight,
  Search,
  Sparkles,
  HeartPulse,
  Activity,
  Baby,
  Brain,
  CheckCircle2,
  Calendar,
  PhoneCall,
  Star,
  Users,
  AlertTriangle,
} from 'lucide-react';

interface HomePageProps {
  setCurrentTab: (tab: string) => void;
  openAiModal: () => void;
  onSearchDoctors: (query: string, specialty?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setCurrentTab,
  openAiModal,
  onSearchDoctors,
}) => {
  const { t } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  const specialties = [
    { name: 'General Physician', slug: 'general-physician', icon: Stethoscope, desc: 'Fever, viral cough, fatigue, metabolic health' },
    { name: 'Cardiologist', slug: 'cardiologist', icon: HeartPulse, desc: 'Blood pressure, cholesterol, chest discomfort' },
    { name: 'Dermatologist', slug: 'dermatologist', icon: Sparkles, desc: 'Acne, skin allergies, eczema, hair loss' },
    { name: 'Orthopedic Specialist', slug: 'orthopedic-specialist', icon: Activity, desc: 'Joint stiffness, back pain, bone fractures' },
    { name: 'Pediatrician', slug: 'pediatrician', icon: Baby, desc: 'Child health, infant nutrition, vaccinations' },
    { name: 'Neurologist', slug: 'neurologist', icon: Brain, desc: 'Headaches, migraines, dizziness, nerve pain' },
  ];

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchDoctors(searchQuery, selectedSpecialty);
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-white pt-12 pb-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Next-Gen Telehealth & Continuous Care</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Healthcare, Without the <span className="text-teal-600">Waiting Room</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {t.heroSubtitle}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => setCurrentTab('doctors')}
                  className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>{t.findDoctor}</span>
                </button>

                <button
                  onClick={() => setCurrentTab('doctors')}
                  className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  <Video className="w-4 h-4 text-teal-400" />
                  <span>{t.consultNow}</span>
                </button>

                <button
                  onClick={() => setCurrentTab('emergency')}
                  className="px-5 py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{t.emergencyInfo}</span>
                </button>
              </div>

              {/* Interactive Search Bar */}
              <form onSubmit={handleHeroSearch} className="mt-8 pt-4">
                <div className="bg-white p-2.5 rounded-2xl shadow-xl border border-slate-200 flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Doctor name, symptoms, or condition..."
                      className="w-full text-xs text-slate-900 bg-transparent focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:w-48">
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full text-xs text-slate-700 bg-slate-50 rounded-xl px-3 py-2.5 border-none focus:outline-hidden cursor-pointer"
                    >
                      <option value="">All Specialties</option>
                      {specialties.map((s) => (
                        <option key={s.slug} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Search Doctors
                  </button>
                </div>
              </form>

              {/* Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-left">
                <div>
                  <div className="text-xl font-black text-slate-900">0 min</div>
                  <div className="text-xs text-slate-500">Uncertain clinic wait</div>
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900">100%</div>
                  <div className="text-xs text-slate-500">Verified doctors</div>
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900">Adaptive</div>
                  <div className="text-xs text-slate-500">Video & audio fallback</div>
                </div>
              </div>
            </div>

            {/* Right Showcase Card: Smart Live Doctor Status & Queue Demo */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/80 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Live Queue Intelligence
                    </span>
                  </div>
                  <span className="text-[11px] font-mono bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md font-bold">
                    Socket.IO Active
                  </span>
                </div>

                {/* Doctor status snippet */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"
                    alt="Dr. Ananya Rao"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-teal-500/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900">Dr. Ananya Rao</h4>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Available Now
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">General Physician • 11 yrs exp</p>
                    <p className="text-[11px] text-teal-700 font-semibold mt-0.5">English | Telugu | Hindi</p>
                  </div>
                </div>

                {/* Queue simulation card */}
                <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-teal-200">
                    <span>Your Queue Position:</span>
                    <span className="font-mono text-base font-extrabold text-white">#1 (Next)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Patients Ahead:</span>
                    <span className="font-bold text-white">0 Patients</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Estimated Waiting Time:</span>
                    <span className="font-bold text-emerald-400">~ 4 minutes</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-teal-800/50 border border-teal-700/50 text-[11px] text-teal-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>"You're next. Please get ready."</span>
                  </div>
                </div>

                {/* AI Assistant teaser */}
                <div
                  onClick={openAiModal}
                  className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between cursor-pointer hover:bg-emerald-100/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Bot className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold text-emerald-950">Not sure which doctor to see?</div>
                      <div className="text-[11px] text-emerald-800">Ask AI Health Navigation Assistant</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Specialties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Popular Medical Specialties
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Consult verified specialists across internal medicine, cardiology, skin health, pediatrics, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {specialties.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.slug}
                onClick={() => onSearchDoctors('', s.name)}
                className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500/80 hover:shadow-lg transition-all cursor-pointer flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 group-hover:bg-teal-600 group-hover:text-white text-teal-600 flex items-center justify-center transition-colors shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                    {s.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 mt-2">
                    Consult Doctors →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How MediLink Works */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Continuous Patient Journey</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              How MediLink Solves Online Healthcare
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Beyond standard booking: manage your entire journey from live queue to consultation, digital prescription, automated follow-up, and offline clinic referrals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black">
                1
              </div>
              <h4 className="font-bold text-sm text-white">Smart Match & Book</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter by verified credentials, languages spoken (Telugu/Hindi/English), fee, and real-time availability.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black">
                2
              </div>
              <h4 className="font-bold text-sm text-white">Live Queue Intelligence</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                See exact position (#3), patients ahead, and dynamic estimated wait time. Get notified when you're next.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black">
                3
              </div>
              <h4 className="font-bold text-sm text-white">Adaptive Consultation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamless WebRTC video with auto-fallback to audio and chat when network quality drops. Never get disconnected.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black">
                4
              </div>
              <h4 className="font-bold text-sm text-white">Complete Care Journey</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive digital prescriptions, automated follow-up scheduling, and physical exam clinic referrals when required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Doctors Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Verified Medical Practitioners
            </h2>
            <p className="text-xs text-slate-500 mt-1">Medical council registered and credentials approved by board.</p>
          </div>
          <button
            onClick={() => setCurrentTab('doctors')}
            className="px-4 py-2 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            View All Doctors →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Dr. Ananya Rao',
              spec: 'General Physician',
              exp: '11 years exp',
              langs: 'English | Telugu | Hindi',
              status: '🟢 Available Now',
              fee: '₹500 consultation',
              avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
              rating: '4.9 (142 reviews)',
            },
            {
              name: 'Dr. Rahul Sharma',
              spec: 'Cardiologist',
              exp: '14 years exp',
              langs: 'English | Hindi',
              status: '🟡 In Consultation',
              fee: '₹800 consultation',
              avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
              rating: '4.8 (189 reviews)',
            },
            {
              name: 'Dr. Priya Reddy',
              spec: 'Dermatologist',
              exp: '8 years exp',
              langs: 'English | Telugu',
              status: '🟢 Available Now',
              fee: '₹600 consultation',
              avatar: 'https://images.unsplash.com/photo-1594824813576-46b5a3597c55?auto=format&fit=crop&q=80&w=300',
              rating: '4.95 (118 reviews)',
            },
          ].map((doc, idx) => (
            <div key={idx} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start gap-3.5">
                <img
                  src={doc.avatar}
                  alt={doc.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-500/20"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-sm">{doc.name}</h3>
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                  </div>
                  <p className="text-xs font-semibold text-teal-700">{doc.spec}</p>
                  <p className="text-[11px] text-slate-500">{doc.exp}</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                <span>{doc.langs}</span>
                <span className="font-semibold text-slate-900">{doc.status}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-extrabold text-slate-900 text-sm">{doc.fee}</span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {doc.rating}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setCurrentTab('doctors')}
                  className="py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  View Profile
                </button>
                <button
                  onClick={() => setCurrentTab('doctors')}
                  className="py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Consult Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Patient Testimonials */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Real Patient Experiences
            </h2>
            <p className="text-xs text-slate-600 mt-1">Verified reviews submitted following online consultations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "The live queue feature made all the difference. I knew exactly that there was only 1 patient ahead of me and logged into the room right when Dr. Ananya was ready. No wasted time in a clinic."
              </p>
              <div className="text-xs font-bold text-slate-900 pt-2 border-t border-slate-100">
                — Ramesh G., Hyderabad
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "During our call my 4G connection became spotty. Instead of dropping the call, the system automatically fell back to high-quality audio and allowed Dr. Rahul to review my ECG report smoothly."
              </p>
              <div className="text-xs font-bold text-slate-900 pt-2 border-t border-slate-100">
                — Kavita V., Bangalore
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "Being able to grant document access specifically to Dr. Priya gave me peace of mind about medical privacy. Downloaded the digital prescription immediately after the call."
              </p>
              <div className="text-xs font-bold text-slate-900 pt-2 border-t border-slate-100">
                — Naveen G., Hyderabad
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 mt-1">Clear answers regarding telemedicine, prescriptions, and safety.</p>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h4 className="font-bold text-sm text-slate-900">Are online medical prescriptions legally valid?</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Yes. Prescriptions generated on MediLink comply with Telemedicine Practice Guidelines. They contain the doctor's council registration number, digital signature, and patient particulars, and are accepted by registered pharmacies.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h4 className="font-bold text-sm text-slate-900">What happens if my internet connection is slow?</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              MediLink uses connectivity-aware WebRTC streaming. If bandwidth drops, the consultation smoothly falls back from Video to Audio, and further to encrypted Instant Chat, ensuring you never lose contact with your doctor.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h4 className="font-bold text-sm text-slate-900">What if the doctor recommends an in-person physical exam?</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Online teleconsultation does not replace physical examination when palpation or auscultation is required. The doctor can flag your case with an Online-to-Offline Referral with nearby partnered clinics and hospitals.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
