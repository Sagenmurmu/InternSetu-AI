import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { candidateService } from '../../services/candidateService';
import ProfileCompletionCard from '../../components/candidate/ProfileCompletionCard';
import InternshipCard from '../../components/candidate/InternshipCard';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/helpers';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const candidateData = user?.candidateData || {};

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const [recs, apps] = await Promise.all([
          candidateService.getRecommendations(user.id),
          candidateService.getApplications(user.id),
        ]);
        setRecommendations(recs.slice(0, 3));
        setApplications(apps);
      } catch (err) {
        console.error('Failed to load candidate dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Match Score (Best)',
      value: recommendations[0]?.matchDetails?.finalScore || '—',
      icon: Target,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Recommendations',
      value: recommendations.length,
      icon: Sparkles,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Applications',
      value: applications.length,
      icon: FileText,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Profile Score',
      value: `${candidateData.profileCompletion || 0}%`,
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {candidateData.name?.split(' ')[0] || 'Candidate'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here's your internship activity overview
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
          >
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

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Profile Completion + Applications */}
        <div className="space-y-6">
          <ProfileCompletionCard percentage={candidateData.profileCompletion || 0} />

          {/* Recent Applications */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Recent Applications
              </h3>
              <button
                onClick={() => navigate('/candidate/applications')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All
              </button>
            </div>
            {applications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No applications yet. Start exploring internships!
              </p>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 4).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {app.internshipTitle}
                      </p>
                      <p className="text-[11px] text-gray-400">{app.companyName}</p>
                    </div>
                    <Badge status={app.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Top Recommendations */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Top AI Recommendations
              </h3>
            </div>
            <button
              onClick={() => navigate('/candidate/recommendations')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All →
            </button>
          </div>
          <div className="grid gap-4">
            {recommendations.map((rec) => (
              <InternshipCard
                key={rec.id}
                internship={rec}
                matchScore={rec.matchDetails?.finalScore}
              />
            ))}
            {recommendations.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">Complete your profile to get AI recommendations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
