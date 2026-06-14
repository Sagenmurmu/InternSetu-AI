import React from 'react';
import { MapPin, GraduationCap, Briefcase, Star } from 'lucide-react';
import { getInitials, getScoreColor, getScoreBgColor } from '../../utils/helpers';

export default function CandidateCard({ candidate, onClose }) {
  const match = candidate.matchDetails;

  return (
    <div className="space-y-5">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center text-xl font-bold">
          {getInitials(candidate.name)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{candidate.name}</h3>
          <p className="text-sm text-gray-500">{candidate.email}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {candidate.district}, {candidate.state}
            </span>
            <span>{candidate.category} / {candidate.ruralOrUrban}</span>
          </div>
        </div>
        {match && (
          <div className={`px-4 py-2 rounded-xl border ${getScoreBgColor(match.finalScore)} text-center`}>
            <span className={`text-2xl font-extrabold ${getScoreColor(match.finalScore)}`}>
              {match.finalScore}
            </span>
            <p className="text-[10px] text-gray-500 font-medium">Match Score</p>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Education</span>
          </div>
          <p className="text-sm font-medium text-gray-800">{candidate.qualification} — {candidate.course}</p>
          <p className="text-xs text-gray-500 mt-0.5">{candidate.college}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </div>
          <p className="text-sm font-medium text-gray-800">{candidate.sectorInterest}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {candidate.locationPreference} • {candidate.willingToRelocate ? 'Will relocate' : 'Local only'}
          </p>
        </div>
      </div>

      {/* Skills */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Skills</p>
        <div className="flex flex-wrap gap-1.5">
          {(candidate.skills || []).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Score Breakdown */}
      {match && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Score Breakdown</p>
          <div className="space-y-2">
            {[
              { label: 'Skill Match', value: match.skillScore },
              { label: 'Qualification', value: match.qualificationScore },
              { label: 'Location', value: match.locationScore },
              { label: 'Sector', value: match.sectorScore },
              { label: 'Fairness', value: match.fairnessScore },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24">{item.label}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
                <span className={`text-xs font-bold w-10 text-right ${getScoreColor(item.value)}`}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      {match?.explanation && match.explanation.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">AI Explanation</p>
          <ul className="space-y-1.5">
            {match.explanation.map((text, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <Star className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
