import React from 'react';
import { getScoreColor, getInitials } from '../../utils/helpers';
import Badge from '../common/Badge';

export default function CandidateRankTable({ candidates = [], onViewCandidate, internship }) {
  if (candidates.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <p className="text-gray-400">No candidates matched for this internship yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider w-10">
                Rank
              </th>
              <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Candidate
              </th>
              <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">
                Skills
              </th>
              <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">
                Qualification
              </th>
              <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">
                Skill Fit
              </th>
              <th className="text-center py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Match Score
              </th>
              <th className="text-center py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">
                Category
              </th>
              <th className="text-center py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, index) => (
              <tr
                key={candidate.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-3 px-5">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-amber-100 text-amber-700' :
                    index === 1 ? 'bg-gray-200 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="py-3 px-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {getInitials(candidate.name)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{candidate.name}</p>
                      <p className="text-[11px] text-gray-400">{candidate.district}, {candidate.state}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-5 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {(candidate.skills || []).slice(0, 3).map((s) => (
                      <span key={s} className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-indigo-50 text-indigo-600">{s}</span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-5 text-gray-600 hidden sm:table-cell">{candidate.qualification}</td>
                <td className="py-3 px-5 hidden lg:table-cell">
                  {(() => {
                    const reqSkills = internship?.requiredSkills || [];
                    const candSkills = candidate.skills || [];
                    if (reqSkills.length === 0) return <span className="text-xs text-gray-400">—</span>;
                    const matched = reqSkills.filter(s => candSkills.some(c => c.toLowerCase() === s.toLowerCase()));
                    const missingCount = reqSkills.length - matched.length;
                    return (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-green-600">
                          {matched.length}/{reqSkills.length} matched
                        </span>
                        {missingCount > 0 && (
                          <span className="text-[10px] text-amber-600">
                            {missingCount} missing
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </td>
                <td className="py-3 px-5 text-center">
                  <span className={`text-lg font-bold ${getScoreColor(candidate.matchDetails?.finalScore)}`}>
                    {candidate.matchDetails?.finalScore || '—'}
                  </span>
                </td>
                <td className="py-3 px-5 text-center hidden lg:table-cell">
                  <span className="text-xs text-gray-500">{candidate.category} / {candidate.ruralOrUrban}</span>
                </td>
                <td className="py-3 px-5 text-center">
                  <button
                    onClick={() => onViewCandidate && onViewCandidate(candidate)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
