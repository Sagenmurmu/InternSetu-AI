import React, { useState, useEffect } from 'react';
import { FileText, Building2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { candidateService } from '../../services/candidateService';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { exportService } from '../../services/exportService';
import { formatDate, getStatusDotColor } from '../../utils/helpers';

export default function ApplicationStatus() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      if (!user?.id) return;
      try {
        const apps = await candidateService.getApplications(user.id);
        setApplications(apps);
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statusCounts = {
    Applied: applications.filter((a) => a.status === 'Applied' || a.status === 'applied').length,
    Shortlisted: applications.filter((a) => a.status === 'Shortlisted' || a.status === 'shortlisted').length,
    Selected: applications.filter((a) => a.status === 'Selected' || a.status === 'selected').length,
    Rejected: applications.filter((a) => a.status === 'Rejected' || a.status === 'rejected').length,
    Waitlisted: applications.filter((a) => a.status === 'Waitlisted' || a.status === 'waitlisted').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track all your internship applications in one place
          </p>
        </div>
        <Button onClick={() => exportService.exportCandidateApplications()} variant="outline" size="sm">
          Export Applications History
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center gap-3"
          >
            <div className={`w-3 h-3 rounded-full ${getStatusDotColor(status)}`} />
            <div>
              <p className="text-xl font-bold text-gray-900">{count}</p>
              <p className="text-[11px] text-gray-500">{status}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-400 text-lg font-medium">No applications yet</p>
            <p className="text-gray-400 text-sm">Start exploring internships to apply!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    Internship
                  </th>
                  <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">
                    Company
                  </th>
                  <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">
                    Applied On
                  </th>
                  <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">
                    Last Updated
                  </th>
                  <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <p className="font-medium text-gray-800">{app.internshipTitle}</p>
                      <p className="text-xs text-gray-400 sm:hidden">{app.companyName}</p>
                    </td>
                    <td className="py-3.5 px-5 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{app.companyName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-500 hidden md:table-cell">
                      {formatDate(app.appliedAt)}
                    </td>
                    <td className="py-3.5 px-5 text-gray-500 hidden md:table-cell">
                      {formatDate(app.updatedAt)}
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge status={app.status} />
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
