import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { DoctorsPage } from './pages/DoctorsPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { HealthTimelinePage } from './pages/HealthTimelinePage';
import { MedicalVaultPage } from './pages/MedicalVaultPage';
import { FollowupsPage } from './pages/FollowupsPage';
import { ReferralsPage } from './pages/ReferralsPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { AuthPage } from './pages/AuthPage';
import { ConsultationRoomPage } from './pages/ConsultationRoomPage';
import { AIAssistantModal } from './components/AIAssistantModal';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MediLink Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-800">Something went wrong</h2>
            <p className="text-sm text-slate-600">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors cursor-pointer"
            >
              Reload MediLink
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [doctorSearchState, setDoctorSearchState] = useState<{ query: string; specialty: string }>({
    query: '',
    specialty: '',
  });

  const handleSearchDoctors = (query: string, specialty?: string) => {
    setDoctorSearchState({ query, specialty: specialty || '' });
    setCurrentTab('doctors');
  };

  const handleEnterRoom = (roomId: string) => {
    setCurrentTab(`room:${roomId}`);
  };

  const isRoomActive = currentTab.startsWith('room:');
  const activeRoomId = isRoomActive ? currentTab.replace('room:', '') : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* Hide Navbar when inside fullscreen video consultation room */}
      {!isRoomActive && (
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          openAiModal={() => setIsAiModalOpen(true)}
        />
      )}

      <main className="flex-1">
        {isRoomActive && activeRoomId ? (
          <ConsultationRoomPage
            roomId={activeRoomId}
            onLeave={() =>
              setCurrentTab(user?.role === 'DOCTOR' ? 'doctor-dashboard' : 'patient-dashboard')
            }
          />
        ) : (
          <>
            {currentTab === 'home' && (
              <HomePage
                setCurrentTab={setCurrentTab}
                openAiModal={() => setIsAiModalOpen(true)}
                onSearchDoctors={handleSearchDoctors}
              />
            )}

            {currentTab === 'doctors' && (
              <DoctorsPage
                initialQuery={doctorSearchState.query}
                initialSpecialty={doctorSearchState.specialty}
                onBookSuccess={() => setCurrentTab('patient-dashboard')}
              />
            )}

            {currentTab === 'patient-dashboard' && (
              <PatientDashboard
                setCurrentTab={setCurrentTab}
                onEnterRoom={handleEnterRoom}
              />
            )}

            {currentTab === 'doctor-dashboard' && (
              <DoctorDashboard onStartCall={handleEnterRoom} />
            )}

            {currentTab === 'admin-dashboard' && <AdminDashboard />}

            {currentTab === 'timeline' && <HealthTimelinePage />}

            {currentTab === 'vault' && <MedicalVaultPage />}

            {currentTab === 'prescriptions' && (
              <PatientDashboard
                setCurrentTab={setCurrentTab}
                onEnterRoom={handleEnterRoom}
              />
            )}

            {currentTab === 'followups' && (
              <FollowupsPage
                onBookFollowup={(docId) => {
                  setDoctorSearchState({ query: '', specialty: '' });
                  setCurrentTab('doctors');
                }}
              />
            )}

            {currentTab === 'referrals' && <ReferralsPage />}

            {currentTab === 'emergency' && (
              <EmergencyPage onBackToSafety={() => setCurrentTab('home')} />
            )}

            {currentTab === 'login' && (
              <AuthPage
                onSuccess={() =>
                  setCurrentTab(
                    user?.role === 'DOCTOR'
                      ? 'doctor-dashboard'
                      : user?.role === 'ADMIN'
                      ? 'admin-dashboard'
                      : 'patient-dashboard'
                  )
                }
              />
            )}
          </>
        )}
      </main>

      {!isRoomActive && <Footer setCurrentTab={setCurrentTab} />}

      {/* Floating AI Health Navigation Assistant Modal */}
      <AIAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSelectSpecialty={(spec) => {
          handleSearchDoctors('', spec);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <MainApp />
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
