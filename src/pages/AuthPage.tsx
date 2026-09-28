import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Lock, Mail, User, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('MBBS, MD');
  const [fee, setFee] = useState('500');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          phone,
          role,
          doctorData: role === 'DOCTOR' ? { qualification, consultationFee: Number(fee) } : undefined,
        });
      } else {
        await login(email, password);
      }
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (targetRole: any, docKey?: string) => {
    setIsLoading(true);
    try {
      await demoLogin(targetRole, docKey);
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md shadow-teal-500/20">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isRegister ? 'Create MediLink Account' : 'Sign in to MediLink'}
          </h2>
          <p className="text-xs text-slate-500">
            {isRegister
              ? 'Join as a patient or submit doctor credentials for medical board verification'
              : 'Enter your credentials or choose a 1-click test profile'}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1-Click Fast Evaluation Profiles */}
        <div className="bg-teal-50/80 border border-teal-200/80 p-4 rounded-2xl space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Instant Demo Profiles (1-Click Test):
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('PATIENT')}
              className="p-2 rounded-xl bg-white border border-teal-200 hover:border-teal-400 font-bold text-teal-900 transition-colors cursor-pointer text-left"
            >
              <div>Patient</div>
              <div className="text-[10px] font-normal text-slate-500">Naveen Gunti</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('DOCTOR', 'ananya')}
              className="p-2 rounded-xl bg-white border border-teal-200 hover:border-teal-400 font-bold text-teal-900 transition-colors cursor-pointer text-left"
            >
              <div>Dr. Ananya Rao</div>
              <div className="text-[10px] font-normal text-slate-500">General Physician</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('DOCTOR', 'rahul')}
              className="p-2 rounded-xl bg-white border border-teal-200 hover:border-teal-400 font-bold text-teal-900 transition-colors cursor-pointer text-left"
            >
              <div>Dr. Rahul Sharma</div>
              <div className="text-[10px] font-normal text-slate-500">Cardiologist</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="p-2 rounded-xl bg-white border border-teal-200 hover:border-teal-400 font-bold text-indigo-900 transition-colors cursor-pointer text-left"
            >
              <div>System Admin</div>
              <div className="text-[10px] font-normal text-slate-500">Medical Board</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setRole('PATIENT')}
                className={`flex-1 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
                  role === 'PATIENT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setRole('DOCTOR')}
                className={`flex-1 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
                  role === 'DOCTOR' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Doctor (Practitioner)
              </button>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'DOCTOR' ? 'Dr. First Last' : 'First Last'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:border-teal-500"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:border-teal-500"
            />
          </div>

          {isRegister && role === 'DOCTOR' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Qualifications</label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="MBBS, MD"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Consultation Fee (₹)</label>
                <input
                  type="number"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="500"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer text-xs"
          >
            {isLoading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage('');
            }}
            className="text-xs text-teal-600 hover:underline font-semibold cursor-pointer"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register as Patient or Doctor"}
          </button>
        </div>
      </div>
    </div>
  );
};
