import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, ArrowRight, ShieldAlert, Building2, User, ArrowLeft, Lock } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const PORTALS = {
  candidate: {
    key: 'candidate',
    title: 'Candidate Portal',
    badge: 'Candidate Space',
    subtitle: 'Sign in to access your applications, profile & AI internship recommendations',
    icon: User,
    accentColor: 'indigo',
    themeBg: 'bg-indigo-600',
    themeHover: 'hover:bg-indigo-500',
    themeText: 'text-indigo-400',
    themeBorder: 'border-indigo-500/30',
    buttonLabel: 'Sign In to Candidate Space',
    registerPrompt: "Don't have a candidate account?",
    registerLink: 'Register as Candidate',
    registerUrl: '/register?role=candidate',
  },
  employer: {
    key: 'employer',
    title: 'Employer Portal',
    badge: 'Employer Space',
    subtitle: 'Sign in to post internships, manage shortlists & review AI rankings',
    icon: Building2,
    accentColor: 'purple',
    themeBg: 'bg-purple-600',
    themeHover: 'hover:bg-purple-500',
    themeText: 'text-purple-400',
    themeBorder: 'border-purple-500/30',
    buttonLabel: 'Sign In to Employer Space',
    registerPrompt: 'Looking to hire top talent?',
    registerLink: 'Register Company',
    registerUrl: '/register?role=employer',
  },
  admin: {
    key: 'admin',
    title: 'Government & Admin Portal',
    badge: 'Administrative Space',
    subtitle: 'Sign in for national allocation analytics, fairness audit logs & policy controls',
    icon: ShieldAlert,
    accentColor: 'rose',
    themeBg: 'bg-rose-600',
    themeHover: 'hover:bg-rose-500',
    themeText: 'text-rose-400',
    themeBorder: 'border-rose-500/30',
    buttonLabel: 'Sign In as Administrator',
    adminNotice: 'Restricted administrative zone. Authorized personnel only.',
  },
};

export default function LoginPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawRole = searchParams.get('role');
  const validRole = rawRole && PORTALS[rawRole] ? rawRole : null;

  const [selectedRole, setSelectedRole] = useState(validRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (validRole) {
      setSelectedRole(validRole);
      setError(null);
    }
  }, [validRole]);

  const selectPortal = (roleKey) => {
    setSearchParams({ role: roleKey });
    setSelectedRole(roleKey);
    setError(null);
  };

  const handleClearPortal = () => {
    setSearchParams({});
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select a portal first.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const user = await login(email.trim(), password, selectedRole);
      if (user) {
        const userRole = user.role || selectedRole;
        if (userRole === 'candidate') navigate('/candidate/dashboard');
        else if (userRole === 'employer') navigate('/employer/dashboard');
        else if (userRole === 'admin') navigate('/admin/dashboard');
      }
    } catch (err) {
      const { getApiErrorMessage } = await import('../services/api');
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const currentPortal = selectedRole ? PORTALS[selectedRole] : null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-white relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand logo */}
      <div className="flex items-center gap-3 mb-8 cursor-pointer relative z-10" onClick={() => navigate('/')}>
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">InternSetu AI</h1>
          <p className="text-[10px] text-indigo-400 font-medium -mt-1">National Internship Allocation</p>
        </div>
      </div>

      {/* VIEW A: No role chosen yet — Portal selector */}
      {!currentPortal ? (
        <div className="w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-2xl shadow-2xl p-6 lg:p-8 backdrop-blur-xl relative z-10">
          <h2 className="text-2xl font-bold text-center mb-2">Select Your Portal</h2>
          <p className="text-gray-400 text-sm text-center mb-8">Choose your dedicated space to proceed to sign in</p>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Candidate option */}
            <button
              onClick={() => selectPortal('candidate')}
              className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-indigo-600/10 hover:border-indigo-500/40 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20 mb-3 group-hover:scale-105 transition-transform">
                  <User className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300">Candidate Space</h3>
                <p className="text-xs text-gray-400 mt-1">Applications & recommendations</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs text-indigo-400 font-semibold">
                <span>Enter Space</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Employer option */}
            <button
              onClick={() => selectPortal('employer')}
              className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-purple-600/10 hover:border-purple-500/40 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20 mb-3 group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-300">Employer Space</h3>
                <p className="text-xs text-gray-400 mt-1">Internship listings & candidates</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs text-purple-400 font-semibold">
                <span>Enter Space</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Admin option */}
            <button
              onClick={() => selectPortal('admin')}
              className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-rose-600/10 hover:border-rose-500/40 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-rose-500/10 rounded-lg flex items-center justify-center border border-rose-500/20 mb-3 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-rose-300">Admin Portal</h3>
                <p className="text-xs text-gray-400 mt-1">Fairness audits & allocation</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs text-rose-400 font-semibold">
                <span>Enter Space</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* VIEW B: Dedicated Space Login — Clean input fields without demo auto-fill */
        <div className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-2xl shadow-2xl p-6 lg:p-8 backdrop-blur-xl relative z-10">
          
          {/* Header navigation back */}
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={handleClearPortal}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Switch portal</span>
            </button>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${currentPortal.themeBorder} ${currentPortal.themeText} bg-white/5`}>
              {currentPortal.badge}
            </span>
          </div>

          {/* Portal Identity */}
          <div className="text-center mb-6">
            <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center border ${currentPortal.themeBorder} bg-white/5 mb-3`}>
              <currentPortal.icon className={`w-6 h-6 ${currentPortal.themeText}`} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{currentPortal.title}</h2>
            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">{currentPortal.subtitle}</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoComplete="email"
                inputClassName="!bg-white/5 !border-white/10 !text-white placeholder-gray-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                inputClassName="!bg-white/5 !border-white/10 !text-white placeholder-gray-500 focus:border-indigo-500"
              />
            </div>

            <Button
              type="submit"
              loading={submitting}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-6 ${currentPortal.themeBg} ${currentPortal.themeHover}`}
            >
              <span>{currentPortal.buttonLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Context-aware footer */}
          {currentPortal.key === 'admin' ? (
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>{currentPortal.adminNotice}</span>
            </div>
          ) : (
            <p className="text-center text-xs text-gray-400 mt-6">
              {currentPortal.registerPrompt}{' '}
              <button
                type="button"
                onClick={() => navigate(currentPortal.registerUrl)}
                className={`font-semibold hover:underline ${currentPortal.themeText}`}
              >
                {currentPortal.registerLink}
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
