import React, { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';
import { adminService } from '../../services/adminService';
import FairnessScoreCard from '../../components/admin/FairnessScoreCard';
import Button from '../../components/common/Button';
import { exportService } from '../../services/exportService';
import CategoryChart from '../../components/admin/CategoryChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#6366f1', '#f59e0b'];

export default function FairnessDashboard() {
  const [stats, setStats] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [ruralUrbanData, setRuralUrbanData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await adminService.getDashboardStats();
        const categoryRes = await adminService.getCategoryAnalytics();
        const ruralUrbanRes = await adminService.getRuralUrbanSplit();
        setStats(statsRes);
        setCategoryData(categoryRes);
        setRuralUrbanData(ruralUrbanRes);
      } catch (err) {
        console.error('Failed to load fairness dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Gender data (mock — would come from real data in production)
  const genderData = [
    { name: 'Female', value: 4 },
    { name: 'Male', value: 4 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Fairness Dashboard</h1>
          </div>
          <p className="text-sm text-gray-500">
            Monitor diversity, inclusion, and fairness across all allocations
          </p>
        </div>
        <Button onClick={() => exportService.exportAdminFairness()} variant="outline" size="sm">
          Export Fairness Report
        </Button>
      </div>

      {/* Main Fairness Score */}
      <FairnessScoreCard
        score={stats.fairnessScore}
        categoryData={categoryData}
        ruralUrbanData={ruralUrbanData}
      />

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <CategoryChart data={categoryData} title="Category-wise Representation" />

        {/* Gender & Rural-Urban */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Rural vs Urban Split
          </h3>
          <div className="flex items-center justify-around">
            {ruralUrbanData.map((item) => (
              <div key={item.type} className="text-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  item.type === 'Rural' ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-blue-50 border-2 border-blue-200'
                }`}>
                  <div>
                    <p className={`text-2xl font-extrabold ${item.type === 'Rural' ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {item.percentage}%
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700">{item.type}</p>
                <p className="text-xs text-gray-400">{item.count} candidates</p>
              </div>
            ))}
          </div>

          {/* Equity Assessment */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Equity Assessment</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">SC/ST Representation</span>
                <span className="font-bold text-green-600">
                  {categoryData.filter(c => c.category === 'SC' || c.category === 'ST')
                    .reduce((sum, c) => sum + c.percentage, 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">OBC/EWS Representation</span>
                <span className="font-bold text-blue-600">
                  {categoryData.filter(c => c.category === 'OBC' || c.category === 'EWS')
                    .reduce((sum, c) => sum + c.percentage, 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Rural Participation</span>
                <span className="font-bold text-emerald-600">
                  {ruralUrbanData.find(r => r.type === 'Rural')?.percentage || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
