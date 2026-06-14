import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, ArrowRight, ShieldAlert, Sparkles, Building2, User } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const DEMO_ACCOUNTS = {
  candidate: {
    email: 'priya@example.com',
    password: 'password123',
    label: 'Demo Candidate (Priya Sharma)',
  },
  employer: {
    email: 'technova@example.com',
    password: 'password123',
    label: 'Demo Employer (TechNova Solutions HR)',
  },
  admin: {
    email: 'admin@example.com',
    password: 'adminpassword',
    label: 'Demo Admin (Central Officer)',
  },
};

export default function LoginPage() {
  const [role, setRole] = useState('candidate');
  const [email, setEmail] = useState(DEMO_ACCOUNTS.candidate.email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS.candidate.password);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setEmail(DEMO_ACCOUNTS[selectedRole].email);
    setPassword(DEMO_ACCOUNTS[selectedRole].password);
    setError(null);
  };

  const handleDemoFill = () => {
    setEmail(DEMO_ACCOUNTS[role].email);
    setPassword(DEMO_ACCOUNTS[role].password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const user = await login(email, password, role);
      if (user) {
        const userRole = user.role || role;
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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-white relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[90px] pointer-events-none" />

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

      <div className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-2xl shadow-2xl p-6 lg:p-8 backdrop-blur-xl relative z-10">
        <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-gray-400 text-sm text-center mb-6">Select your portal role to sign in</p>

        {/* Role Select Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange('candidate')}
            className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-xs font-semibold transition-all ${
              role === 'candidate'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4 mb-1" />
            Candidate
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('employer')}
            className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-xs font-semibold transition-all ${
              role === 'employer'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-4 h-4 mb-1" />
            Employer
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-xs font-semibold transition-all ${
              role === 'admin'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldAlert className="w-4 h-4 mb-1" />
            Admin
          </button>
        </div>

        {/* Demo Account Indicator */}
        <div className="mb-6 p-3 bg-white/5 border border-white/5 rounded-xl text-center flex flex-col items-center justify-center">
          <p className="text-[11px] text-gray-400 font-medium">Quick Fill Demo User:</p>
          <button
            type="button"
            onClick={handleDemoFill}
            className="mt-1 text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            {DEMO_ACCOUNTS[role].label}
          </button>
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
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-indigo-500"
            />
          </div>

          <Button
            type="submit"
            loading={submitting}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-6 ${
              role === 'candidate'
                ? 'bg-indigo-600 hover:bg-indigo-500'
                : role === 'employer'
                ? 'bg-purple-600 hover:bg-purple-500'
                : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {role !== 'admin' && (
          <p className="text-center text-xs text-gray-400 mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-indigo-400 font-semibold hover:underline"
            >
              Register now
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
