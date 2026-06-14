import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { adminService } from '../../services/adminService';
import DistrictChart from '../../components/admin/DistrictChart';
import Button from '../../components/common/Button';
import { exportService } from '../../services/exportService';

export default function AllocationAnalytics() {
  const [districtData, setDistrictData] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [sectorData, setSectorData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dist = await adminService.getDistrictAnalytics();
        const state = await adminService.getStateAnalytics();
        const sector = await adminService.getSectorAnalytics();
        setDistrictData(dist);
        setStateData(state);
        setSectorData(sector);
      } catch (err) {
        console.error('Failed to load allocation analytics:', err);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Allocation Analytics</h1>
          </div>
          <p className="text-sm text-gray-500">
            District, state, and sector-level allocation insights
          </p>
        </div>
        <Button onClick={() => exportService.exportAdminMatches()} variant="outline" size="sm">
          Export Match Results
        </Button>
      </div>

      {/* District Chart */}
      <DistrictChart data={districtData} />

      {/* State & Sector Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* State Allocation */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            State-wise Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stateData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="state" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="candidates" name="Candidates" fill="#c7d2fe" radius={[4, 4, 0, 0]} />
              <Bar dataKey="internships" name="Internships" fill="#818cf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="selected" name="Selected" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Allocation */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Sector-wise Capacity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorData.filter(s => s.capacity > 0)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="sector" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="capacity" name="Capacity" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="allocated" name="Allocated" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* State Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            State Allocation Detail
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">State</th>
                <th className="text-center py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Candidates</th>
                <th className="text-center py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Internships</th>
                <th className="text-center py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Selected</th>
              </tr>
            </thead>
            <tbody>
              {stateData.map((row) => (
                <tr key={row.state} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-5 font-medium text-gray-800">{row.state}</td>
                  <td className="py-3 px-5 text-center text-gray-600">{row.candidates}</td>
                  <td className="py-3 px-5 text-center text-gray-600">{row.internships}</td>
                  <td className="py-3 px-5 text-center">
                    <span className="font-bold text-indigo-600">{row.selected}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
