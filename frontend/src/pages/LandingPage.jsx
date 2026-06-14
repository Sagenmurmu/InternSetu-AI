import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Sparkles, Building2, ShieldAlert, BarChart3, Users, HelpCircle } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white selection:bg-indigo-500 selection:text-white overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">InternSetu AI</h1>
              <p className="text-[10px] text-indigo-400 font-medium -mt-1">Smart Internship Allocation</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation National Allocation Framework</span>
        </div>
        <h2 className="text-5xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent max-w-4xl mx-auto leading-tight lg:leading-none">
          Bridge the Gap Between Talent & Opportunity with AI
        </h2>
        <p className="text-gray-400 text-lg lg:text-xl max-w-2xl mx-auto mt-6">
          InternSetu AI leverages state-of-the-art matching algorithms to deliver fair, diversity-conscious, and optimized internship allocations for students and corporations nationwide.
        </p>

        {/* Portals Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
          {/* Candidate Card */}
          <div 
            onClick={() => navigate('/login')}
            className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 text-left hover:bg-white/10 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden shadow-2xl"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-600/10 rounded-full blur-xl group-hover:bg-indigo-600/20 transition-all" />
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mt-6 group-hover:text-indigo-300 transition-colors">Candidate Portal</h3>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              Find AI-ranked internship opportunities, view detailed match analysis, complete your profile, and track your application status.
            </p>
            <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-sm mt-6">
              <span>Access Candidate Space</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Employer Card */}
          <div 
            onClick={() => navigate('/login')}
            className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 text-left hover:bg-white/10 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden shadow-2xl"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-600/10 rounded-full blur-xl group-hover:bg-purple-600/20 transition-all" />
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mt-6 group-hover:text-purple-300 transition-colors">Employer Portal</h3>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              Post internships, review candidates ranked by our smart matching algorithm, manage applicant shortlists, and confirm matches.
            </p>
            <div className="flex items-center gap-1.5 text-purple-400 font-semibold text-sm mt-6">
              <span>Access Employer Space</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Admin Card */}
          <div 
            onClick={() => navigate('/login')}
            className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 text-left hover:bg-white/10 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden shadow-2xl"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-600/10 rounded-full blur-xl group-hover:bg-rose-600/20 transition-all" />
            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold mt-6 group-hover:text-rose-300 transition-colors">Government & Admin</h3>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              Monitor national dashboards, run matches, evaluate fairness and diversity scores, track capacity utilization, and inspect system audit logs.
            </p>
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-sm mt-6">
              <span>Access Admin Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="relative z-10 py-16 border-t border-white/10 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold">Engineered for Fairness, Scale, & Impact</h2>
            <p className="text-gray-400 mt-3">Leveraging multiple factors to optimize allocations nationwide.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-5">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <h4 className="text-lg font-bold mb-2">AI-Driven Matching</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Calculates compatibility scores based on candidate skills, education, location preferences, and industry sector interests.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center mb-5">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <h4 className="text-lg font-bold mb-2">Fairness Guardrails</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Builds in inclusion bonuses to elevate underrepresented categories, rural candidates, and female applicants.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-5">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="text-lg font-bold mb-2">Capacity Constraints</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Enforces strict corporate and sector seat capacities, preventing overallocation and monitoring utilization.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
              <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center mb-5">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              </div>
              <h4 className="text-lg font-bold mb-2">Transparent Audit Logs</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Records all allocation updates, status changes, matching runs, and logins for ultimate compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-10 text-center text-gray-500 text-sm">
        <p>© 2026 InternSetu AI — Ministry of Skill Development and Entrepreneurship Prototype.</p>
      </footer>
    </div>
  );
}
