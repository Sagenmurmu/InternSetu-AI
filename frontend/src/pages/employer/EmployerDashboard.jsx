import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, UserCheck, ClipboardList, BarChart3, PlusCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { employerService } from '../../services/employerService';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { exportService } from '../../services/exportService';
import { formatDate } from '../../utils/helpers';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const companyId = user?.companyId;
  const [stats, setStats] = useState(null);
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) {
        // If company profile doesn't exist yet, we can set loading to false.
        setLoading(false);
        return;
      }
      try {
        const [statsRes, internshipsRes, applicationsRes] = await Promise.all([
          employerService.getDashboardStats(companyId),
          employerService.getInternships(companyId),
          employerService.getApplications(companyId),
        ]);
        setStats(statsRes);
        setInternships(internshipsRes);
        setApplications(applicationsRes);
      } catch (err) {
        console.error('Failed to load employer dashboard details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Handle case where company profile hasn't been created yet
  if (!companyId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Setup Company Profile</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          Please complete your company registration to view the dashboard and manage internships.
        </p>
        <Button onClick={() => navigate('/register')}>
          Register Company Profile
        </Button>
      </div>
    );
  }

  const statCards = stats ? [
    { label: 'Active Postings', value: stats.totalPostings, icon: Briefcase, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Total Applicants', value: stats.totalApplicants, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Shortlisted', value: stats.shortlistedCount, icon: ClipboardList, color: 'bg-purple-50 text-purple-600' },
    { label: 'Selected', value: stats.selectedCount, icon: UserCheck, color: 'bg-green-50 text-green-600' },
    { label: 'Total Capacity', value: stats.totalCapacity, icon: BarChart3, color: 'bg-amber-50 text-amber-600' },
    { label: 'Remaining Seats', value: stats.remainingCapacity, icon: Users, color: 'bg-rose-50 text-rose-600' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.companyData?.name || 'Employer'} 🏢
          </h1>
          <p className="text-sm text-gray-500 mt-1">Your hiring activity at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => exportService.exportEmployerSelectedCandidates()} variant="outline">
            Export Selected
          </Button>
          <Button onClick={() => navigate('/employer/create-internship')} icon={PlusCircle}>
            Create Internship
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-[11px] text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Your Internships */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Your Internships</h3>
            <button onClick={() => navigate('/employer/create-internship')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              + New
            </button>
          </div>
          {internships.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No internships created yet</p>
          ) : (
            <div className="space-y-3">
              {internships.slice(0, 5).map((intern) => (
                <div key={intern.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{intern.title}</p>
                    <p className="text-[11px] text-gray-400">{intern.sector} • {intern.location} • {intern.selectedCount}/{intern.capacity} filled</p>
                  </div>
                  <Badge status={intern.mode} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Applications</h3>
            <button onClick={() => navigate('/employer/applications')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View All
            </button>
          </div>
          {applications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No applications received yet</p>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{app.candidateName}</p>
                    <p className="text-[11px] text-gray-400">{app.internshipTitle} • Score: {app.matchScore}</p>
                  </div>
                  <Badge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
