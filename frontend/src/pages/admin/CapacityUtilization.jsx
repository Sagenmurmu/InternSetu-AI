import React, { useState, useEffect } from 'react';
import { Gauge } from 'lucide-react';
import { adminService } from '../../services/adminService';
import CapacityChart from '../../components/admin/CapacityChart';

export default function CapacityUtilization() {
  const [capacityData, setCapacityData] = useState([]);
  const [sectorData, setSectorData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const capacity = await adminService.getCapacityAnalytics();
        const sector = await adminService.getSectorAnalytics();
        setCapacityData(capacity);
        setSectorData(sector.filter(s => s.capacity > 0));
      } catch (err) {
        console.error('Failed to load capacity analytics:', err);
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

  const totalCapacity = capacityData.reduce((sum, c) => sum + c.total, 0);
  const totalUsed = capacityData.reduce((sum, c) => sum + c.used, 0);
  const utilization = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Gauge className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Capacity Utilization</h1>
        </div>
        <p className="text-sm text-gray-500">
          Monitor seat allocation and remaining capacity across companies and sectors
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{totalCapacity}</p>
          <p className="text-xs text-gray-500 mt-1">Total Seats</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-indigo-600">{totalUsed}</p>
          <p className="text-xs text-gray-500 mt-1">Seats Used</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-amber-600">{utilization}%</p>
          <p className="text-xs text-gray-500 mt-1">Utilization Rate</p>
        </div>
      </div>

      {/* Company Capacity Chart */}
      <CapacityChart data={capacityData} />

      {/* Company Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Company Capacity Detail
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase">Company</th>
                <th className="text-center py-3 px-5 font-semibold text-gray-500 text-xs uppercase">Total</th>
                <th className="text-center py-3 px-5 font-semibold text-gray-500 text-xs uppercase">Used</th>
                <th className="text-center py-3 px-5 font-semibold text-gray-500 text-xs uppercase">Remaining</th>
                <th className="text-center py-3 px-5 font-semibold text-gray-500 text-xs uppercase">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {capacityData.map((row) => {
                const pct = row.total > 0 ? Math.round((row.used / row.total) * 100) : 0;
                return (
                  <tr key={row.company} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-3 px-5 font-medium text-gray-800">{row.company}</td>
                    <td className="py-3 px-5 text-center text-gray-600">{row.total}</td>
                    <td className="py-3 px-5 text-center font-bold text-indigo-600">{row.used}</td>
                    <td className="py-3 px-5 text-center text-gray-600">{row.remaining}</td>
                    <td className="py-3 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sector Capacity Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Sector Capacity Overview
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase">Sector</th>
                <th className="text-center py-3 px-5 font-semibold text-gray-500 text-xs uppercase">Capacity</th>
                <th className="text-center py-3 px-5 font-semibold text-gray-500 text-xs uppercase">Allocated</th>
                <th className="text-center py-3 px-5 font-semibold text-gray-500 text-xs uppercase">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {sectorData.map((row) => {
                const pct = row.capacity > 0 ? Math.round((row.allocated / row.capacity) * 100) : 0;
                return (
                  <tr key={row.sector} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-3 px-5 font-medium text-gray-800">{row.sector}</td>
                    <td className="py-3 px-5 text-center text-gray-600">{row.capacity}</td>
                    <td className="py-3 px-5 text-center font-bold text-indigo-600">{row.allocated}</td>
                    <td className="py-3 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-purple-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
