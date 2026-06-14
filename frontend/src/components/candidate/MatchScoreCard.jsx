import React from 'react';
import { getScoreColor, getScoreBgColor } from '../../utils/helpers';

export default function MatchScoreCard({ matchDetails }) {
  if (!matchDetails) return null;

  const scores = [
    { label: 'Skill Match', value: matchDetails.skillScore, weight: '35%' },
    { label: 'Qualification', value: matchDetails.qualificationScore, weight: '20%' },
    { label: 'Location', value: matchDetails.locationScore, weight: '15%' },
    { label: 'Sector', value: matchDetails.sectorScore, weight: '15%' },
    { label: 'Fairness', value: matchDetails.fairnessScore, weight: '15%' },
  ];

  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (matchDetails.finalScore / 100) * circumference;

  const getStrokeColor = (score) => {
    if (score >= 90) return '#22c55e';
    if (score >= 75) return '#3b82f6';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">
        AI Match Analysis
      </h3>

      <div className="flex items-center gap-8">
        {/* Circular Score */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={getStrokeColor(matchDetails.finalScore)}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-extrabold ${getScoreColor(matchDetails.finalScore)}`}>
              {matchDetails.finalScore}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">Match Score</span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="flex-1 space-y-3">
          {scores.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600 font-medium">{item.label}</span>
                <span className={`font-bold ${getScoreColor(item.value)}`}>{item.value}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: getStrokeColor(item.value),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
