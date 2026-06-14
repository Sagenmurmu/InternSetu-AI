import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, User, Building2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import { ROLES, SECTORS, STATES, QUALIFICATIONS, CATEGORIES, GENDERS, RURAL_URBAN, SKILLS } from '../utils/constants';
import { validateEmail, validateRequired, validatePassword } from '../utils/validators';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, updateProfile } = useAuth();
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    // Candidate fields
    age: '',
    gender: '',
    category: '',
    ruralOrUrban: '',
    district: '',
    state: '',
    qualification: '',
    course: '',
    college: '',
    skills: [],
    sectorInterest: '',
    locationPreference: '',
    willingToRelocate: true,
    // Employer fields
    companyName: '',
    sector: '',
    location: '',
    website: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSkillToggle = (skill) => {
    setFormData((prev) => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  const validate = () => {
    const errs = {};
    errs.name = validateRequired(formData.name, 'Name');
    errs.email = validateEmail(formData.email);
    errs.password = validatePassword(formData.password);

    if (role === ROLES.CANDIDATE) {
      errs.state = validateRequired(formData.state, 'State');
      errs.qualification = validateRequired(formData.qualification, 'Qualification');
    }

    if (role === ROLES.EMPLOYER) {
      errs.companyName = validateRequired(formData.companyName, 'Company Name');
      errs.sector = validateRequired(formData.sector, 'Sector');
    }

    // Remove null errors
    Object.keys(errs).forEach((key) => {
      if (!errs[key]) delete errs[key];
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    if (!role) {
      setGlobalError('Please select a role first.');
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await register({ ...formData, role });
      
      if (user) {
        try {
          const { isMockFallbackEnabled } = await import('../services/api');
          if (!isMockFallbackEnabled()) {
            if (role === ROLES.CANDIDATE) {
              const { candidateService } = await import('../services/candidateService');
              const updatedProfile = await candidateService.updateProfile(user.id, {
                age: formData.age,
                gender: formData.gender,
                category: formData.category,
                ruralOrUrban: formData.ruralOrUrban,
                state: formData.state,
                qualification: formData.qualification,
                course: formData.course,
                college: formData.college,
                skills: formData.skills,
                sectorInterest: formData.sectorInterest,
                locationPreference: formData.locationPreference,
                willingToRelocate: formData.willingToRelocate,
              });
              updateProfile(updatedProfile);
            } else if (role === ROLES.EMPLOYER) {
              const { employerService } = await import('../services/employerService');
              const companyProfile = await employerService.createCompanyProfile({
                name: formData.companyName,
                sector: formData.sector,
                location: formData.location,
                state: formData.state,
                description: formData.description,
              });
              updateProfile(companyProfile);
            }
          }
        } catch (profileErr) {
          console.warn("Profile auto-creation warning after registration:", profileErr);
        }

        if (user.role === ROLES.CANDIDATE) navigate('/candidate/dashboard');
        else if (user.role === ROLES.EMPLOYER) navigate('/employer/dashboard');
      }
    } catch (err) {
      const { getApiErrorMessage } = await import('../services/api');
      setGlobalError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">InternSetu AI</h1>
            <p className="text-[10px] text-indigo-400 font-medium -mt-1">Create Account</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/[0.07] border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          {/* Role Selection */}
          {!role && (
            <div>
              <h2 className="text-xl font-bold text-white text-center mb-2">Join InternSetu AI</h2>
              <p className="text-gray-400 text-sm text-center mb-8">Select your role to get started</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setRole(ROLES.CANDIDATE)}
                  className="group p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-indigo-600/10 hover:border-indigo-500/30 transition-all text-left"
                >
                  <User className="w-8 h-8 text-indigo-400 mb-3" />
                  <h3 className="text-white font-bold text-lg">Candidate</h3>
                  <p className="text-gray-400 text-xs mt-1">Looking for internship opportunities</p>
                </button>
                <button
                  onClick={() => setRole(ROLES.EMPLOYER)}
                  className="group p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-purple-600/10 hover:border-purple-500/30 transition-all text-left"
                >
                  <Building2 className="w-8 h-8 text-purple-400 mb-3" />
                  <h3 className="text-white font-bold text-lg">Employer</h3>
                  <p className="text-gray-400 text-xs mt-1">Post internships and find talent</p>
                </button>
              </div>
            </div>
          )}

          {/* Registration Form */}
          {role && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white capitalize">{role} Registration</h2>
                <button
                  type="button"
                  onClick={() => setRole('')}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Change Role
                </button>
              </div>

              {globalError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-300 text-sm">
                  {globalError}
                </div>
              )}

              {/* Common Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-300">Full Name *</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-300">Email *</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Password *</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
              </div>

              {/* Candidate-specific fields */}
              {role === ROLES.CANDIDATE && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-300">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select</option>
                        {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-300">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select</option>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-300">Rural / Urban</label>
                      <select
                        name="ruralOrUrban"
                        value={formData.ruralOrUrban}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select</option>
                        {RURAL_URBAN.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-300">State *</label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select State</option>
                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.state && <p className="text-xs text-red-400">{errors.state}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-300">Qualification *</label>
                      <select
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select</option>
                        {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                      </select>
                      {errors.qualification && <p className="text-xs text-red-400">{errors.qualification}</p>}
                    </div>
                  </div>
                </>
              )}

              {/* Employer-specific fields */}
              {role === ROLES.EMPLOYER && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-300">Company Name *</label>
                    <input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Company name"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.companyName && <p className="text-xs text-red-400">{errors.companyName}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-300">Sector *</label>
                    <select
                      name="sector"
                      value={formData.sector}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Sector</option>
                      {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.sector && <p className="text-xs text-red-400">{errors.sector}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-300">Location</label>
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-300">State</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select State</option>
                      {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-base"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <p className="text-center text-gray-400 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                  Sign In
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
