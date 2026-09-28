import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { LanguageCode } from '../translations';
import {
  Stethoscope,
  Globe,
  Bell,
  User,
  LogOut,
  AlertTriangle,
  Bot,
  Calendar,
  FolderHeart,
  FileText,
  Clock,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
  Check,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAiModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openAiModal }) => {
  const { user, logout, demoLogin, language, setLanguage, t } = useAuth();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, isConnected } = useSocket();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const handleDemoSwitch = async (role: any, docKey?: string) => {
    await demoLogin(role, docKey);
    setShowDemoMenu(false);
    if (role === 'DOCTOR') setCurrentTab('doctor-dashboard');
    else if (role === 'ADMIN') setCurrentTab('admin-dashboard');
    else setCurrentTab('patient-dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Emergency Alert Ribbon (Brief & Discreet) */}
      <div className="bg-rose-50 border-b border-rose-100 text-rose-800 text-xs py-1 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>
            <strong>Medical Notice:</strong> MediLink is for non-emergency consultations. For severe chest pain, breathing difficulty or urgent trauma, call <strong>112 / 108</strong> immediately.
          </span>
          <button
            onClick={() => setCurrentTab('emergency')}
            className="underline font-semibold hover:text-rose-950 ml-1 cursor-pointer"
          >
            Emergency Guidelines →
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">MediLink</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Care
                </span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-0.5">Intelligent Consultation System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                currentTab === 'home'
                  ? 'text-teal-700 bg-teal-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setCurrentTab('doctors')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                currentTab === 'doctors'
                  ? 'text-teal-700 bg-teal-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t.findDoctor}
            </button>

            {user?.role === 'PATIENT' && (
              <>
                <button
                  onClick={() => setCurrentTab('patient-dashboard')}
                  className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    currentTab === 'patient-dashboard'
                      ? 'text-teal-700 bg-teal-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  My Appointments
                </button>
                <button
                  onClick={() => setCurrentTab('timeline')}
                  className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    currentTab === 'timeline'
                      ? 'text-teal-700 bg-teal-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t.healthTimeline}
                </button>
                <button
                  onClick={() => setCurrentTab('vault')}
                  className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    currentTab === 'vault'
                      ? 'text-teal-700 bg-teal-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t.medicalVault}
                </button>
              </>
            )}

            {user?.role === 'DOCTOR' && (
              <button
                onClick={() => setCurrentTab('doctor-dashboard')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'doctor-dashboard'
                    ? 'text-teal-700 bg-teal-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-teal-600" />
                Doctor Workspace
              </button>
            )}

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => setCurrentTab('admin-dashboard')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'admin-dashboard'
                    ? 'text-teal-700 bg-teal-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Admin Board
              </button>
            )}

            {/* AI Assistant Button */}
            <button
              onClick={openAiModal}
              className="px-3 py-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 font-medium border border-emerald-200/60 cursor-pointer ml-1"
            >
              <Bot className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>AI Triage</span>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1 rounded-sm font-bold">Smart</span>
            </button>
          </nav>

          {/* Right actions: Language Switcher, Notifications, Demo Swapper, Profile */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1 text-xs font-semibold cursor-pointer border border-slate-200"
                title="Switch Language"
              >
                <Globe className="w-4 h-4 text-teal-600" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Language
                  </div>
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      language === 'en' ? 'text-teal-600 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <Check className="w-4 h-4 text-teal-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('te');
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      language === 'te' ? 'text-teal-600 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span>తెలుగు (Telugu)</span>
                    {language === 'te' && <Check className="w-4 h-4 text-teal-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('hi');
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      language === 'hi' ? 'text-teal-600 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span>हिंदी (Hindi)</span>
                    {language === 'hi' && <Check className="w-4 h-4 text-teal-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-teal-600 hover:text-teal-800 cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 py-1">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">No notifications right now</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.linkUrl) {
                              if (n.linkUrl.includes('room')) {
                                const roomId = n.linkUrl.split('/').pop();
                                setCurrentTab(`room:${roomId}`);
                              } else if (n.linkUrl.includes('appointments')) {
                                setCurrentTab(user?.role === 'DOCTOR' ? 'doctor-dashboard' : 'patient-dashboard');
                              } else if (n.linkUrl.includes('prescriptions')) {
                                setCurrentTab('prescriptions');
                              }
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            n.isRead ? 'bg-white hover:bg-slate-50' : 'bg-teal-50/70 hover:bg-teal-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-semibold text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 border border-indigo-200/80 cursor-pointer"
                title="Switch Demo Role"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Role:</span>
                <span className="capitalize">{user?.role ? user.role.toLowerCase() : 'Demo'}</span>
                <ChevronDown className="w-3 h-3 text-indigo-500" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Test Account (1-Click)
                  </div>
                  <div className="py-1 space-y-1">
                    <button
                      onClick={() => handleDemoSwitch('PATIENT')}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                        user?.role === 'PATIENT' ? 'bg-teal-50 text-teal-800 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium">Naveen Gunti</div>
                        <div className="text-[10px] text-slate-400">Patient (Has active queue today)</div>
                      </div>
                      {user?.role === 'PATIENT' && <Check className="w-4 h-4 text-teal-600" />}
                    </button>

                    <button
                      onClick={() => handleDemoSwitch('DOCTOR', 'ananya')}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                        user?.email === 'doctor.ananya@medilink.com'
                          ? 'bg-teal-50 text-teal-800 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium">Dr. Ananya Rao</div>
                        <div className="text-[10px] text-slate-400">General Physician (Available Now)</div>
                      </div>
                      {user?.email === 'doctor.ananya@medilink.com' && <Check className="w-4 h-4 text-teal-600" />}
                    </button>

                    <button
                      onClick={() => handleDemoSwitch('DOCTOR', 'rahul')}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                        user?.email === 'doctor.rahul@medilink.com'
                          ? 'bg-teal-50 text-teal-800 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium">Dr. Rahul Sharma</div>
                        <div className="text-[10px] text-slate-400">Cardiologist (In Consultation)</div>
                      </div>
                      {user?.email === 'doctor.rahul@medilink.com' && <Check className="w-4 h-4 text-teal-600" />}
                    </button>

                    <button
                      onClick={() => handleDemoSwitch('ADMIN')}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                        user?.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-800 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium">System Admin</div>
                        <div className="text-[10px] text-slate-400">Medical Board Director</div>
                      </div>
                      {user?.role === 'ADMIN' && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar & Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/20"
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="font-semibold text-slate-900 text-sm truncate">{user.name}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      {user.role === 'PATIENT' && (
                        <button
                          onClick={() => {
                            setCurrentTab('patient-dashboard');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          My Appointments
                        </button>
                      )}
                      {user.role === 'DOCTOR' && (
                        <button
                          onClick={() => {
                            setCurrentTab('doctor-dashboard');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-teal-600" />
                          Doctor Workspace
                        </button>
                      )}
                      {user.role === 'ADMIN' && (
                        <button
                          onClick={() => {
                            setCurrentTab('admin-dashboard');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          Admin Board
                        </button>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                          setCurrentTab('home');
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 cursor-pointer mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setCurrentTab('login')}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
