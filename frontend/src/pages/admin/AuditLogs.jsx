import React, { useState, useEffect } from 'react';
import { ScrollText, Search, Filter } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AUDIT_ACTIONS } from '../../utils/constants';
import { formatDateTime } from '../../utils/helpers';

const actionColors = {
  USER_LOGIN: 'bg-blue-100 text-blue-700',
  APPLICATION_SUBMITTED: 'bg-indigo-100 text-indigo-700',
  INTERNSHIP_CREATED: 'bg-purple-100 text-purple-700',
  CANDIDATE_SHORTLISTED: 'bg-amber-100 text-amber-700',
  CANDIDATE_SELECTED: 'bg-green-100 text-green-700',
  CANDIDATE_REJECTED: 'bg-red-100 text-red-700',
  CANDIDATE_WAITLISTED: 'bg-yellow-100 text-yellow-700',
  MATCHING_RUN: 'bg-cyan-100 text-cyan-700',
  FAIRNESS_AUDIT: 'bg-teal-100 text-teal-700',
  CAPACITY_UPDATE: 'bg-orange-100 text-orange-700',
  PROFILE_UPDATE: 'bg-pink-100 text-pink-700',
};

export default function AuditLogs() {
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logs = await adminService.getAuditLogs();
        setAllLogs(logs);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filtered = allLogs.filter((log) => {
    const matchSearch =
      !search ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());

    const matchRole = !roleFilter || log.userRole === roleFilter;

    return matchSearch && matchRole;
  });

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
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ScrollText className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        </div>
        <p className="text-sm text-gray-500">
          Complete system activity log for compliance and transparency
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="candidate">Candidate</option>
            <option value="employer">Employer</option>
            <option value="admin">Admin</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400">
        Showing {filtered.length} of {allLogs.length} log entries
      </p>

      {/* Logs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ScrollText className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-400">No log entries found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((log) => (
              <div key={log.id} className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        actionColors[log.action] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {AUDIT_ACTIONS[log.action] || log.action}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{log.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-gray-400">
                        {formatDateTime(log.timestamp)}
                      </span>
                      <span className="text-[11px] text-gray-400 capitalize">
                        Role: {log.userRole}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
