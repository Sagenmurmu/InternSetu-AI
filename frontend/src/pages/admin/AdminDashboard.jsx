import React, { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, FileText, Target, BarChart3, Shield, Zap } from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatsCard from '../../components/admin/StatsCard';
import DistrictChart from '../../components/admin/DistrictChart';
import CategoryChart from '../../components/admin/CategoryChart';
import Button from '../../components/common/Button';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [districtData, setDistrictData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [matchCount, setMatchCount] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await adminService.getDashboardStats();
        const districtRes = await adminService.getDistrictAnalytics();
        const categoryRes = await adminService.getCategoryAnalytics();
        setStats(statsRes);
        setDistrictData(districtRes);
        setCategoryData(categoryRes);
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRunMatching = async () => {
    setRunning(true);
    try {
      const results = await adminService.triggerMatchingRun();
      setMatchCount(results.length || 'All');
      const statsRes = await adminService.getDashboardStats();
      setStats(statsRes);
    } catch (err) {
      alert(err.message);
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = stats ? [
    { label: 'Total Candidates', value: stats.totalCandidates, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Total Companies', value: stats.totalCompanies, icon: Building2, color: 'bg-purple-50 text-purple-600' },
    { label: 'Active Internships', value: stats.totalInternships, icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
    { label: 'Applications', value: stats.totalApplications, icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Selected', value: stats.selectedCandidates, icon: Target, color: 'bg-green-50 text-green-600' },
    { label: 'Remaining Seats', value: stats.remainingSeats, icon: BarChart3, color: 'bg-amber-50 text-amber-600' },
    { label: 'Avg Match Score', value: `${stats.averageMatchScore}%`, icon: Zap, color: 'bg-rose-50 text-rose-600' },
    { label: 'Fairness Score', value: `${stats.fairnessScore}%`, icon: Shield, color: 'bg-teal-50 text-teal-600' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard 🏛️</h1>
          <p className="text-sm text-gray-500 mt-1">System-wide overview and controls</p>
        </div>
        <div className="flex items-center gap-3">
          {matchCount !== null && (
            <span className="text-xs text-green-600 font-medium">
              ✓ {matchCount} matches computed
            </span>
          )}
          <Button onClick={handleRunMatching} disabled={running} icon={Zap} variant="primary">
            {running ? 'Running...' : 'Run AI Matching'}
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <DistrictChart data={districtData} />
        <CategoryChart data={categoryData} />
      </div>
    </div>
  );
}
