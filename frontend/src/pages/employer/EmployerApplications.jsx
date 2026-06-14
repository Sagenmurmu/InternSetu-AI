import React, { useState, useEffect } from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { employerService } from '../../services/employerService';
import { APPLICATION_STATUS } from '../../utils/constants';
import Badge from '../../components/common/Badge';
import { formatDate, getScoreColor } from '../../utils/helpers';

export default function EmployerApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState('');

  const companyId = user?.companyId;

  const fetchApps = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    try {
      const apps = await employerService.getApplications(companyId);
      setApplications(apps);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [companyId]);

  const filtered = filter
    ? applications.filter((a) => a.status === filter)
    : applications;

  const handleStatusChange = async (appId, newStatus) => {
    setUpdating(appId);
    try {
      await employerService.updateApplicationStatus(appId, newStatus);
      // Reload applications list
      const apps = await employerService.getApplications(companyId);
      setApplications(apps);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statuses = Object.values(APPLICATION_STATUS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        </div>
        <p className="text-sm text-gray-500">
          Manage and update application statuses for your internship postings
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            !filter ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          All ({applications.length})
        </button>
        {statuses.map((status) => {
          const count = applications.filter((a) => a.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filter === status ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-400">No applications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Candidate</th>
                  <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Internship</th>
                  <th className="text-center py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">Match</th>
                  <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Applied</th>
                  <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-center py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-medium text-gray-800">{app.candidateName}</p>
                    </td>
                    <td className="py-3.5 px-5 text-gray-600">{app.internshipTitle}</td>
                    <td className="py-3.5 px-5 text-center hidden sm:table-cell">
                      <span className={`font-bold ${getScoreColor(app.matchScore)}`}>{app.matchScore}</span>
                    </td>
                    <td className="py-3.5 px-5 text-gray-500 hidden md:table-cell">{formatDate(app.appliedAt)}</td>
                    <td className="py-3.5 px-5"><Badge status={app.status} /></td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="relative inline-block">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          disabled={updating === app.id}
                          className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
