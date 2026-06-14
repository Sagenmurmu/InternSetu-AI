import React from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

export default function ProfileCompletionCard({ percentage = 0 }) {
  const fields = [
    { label: 'Basic Info', threshold: 20 },
    { label: 'Education', threshold: 40 },
    { label: 'Skills', threshold: 60 },
    { label: 'Location & Preferences', threshold: 80 },
    { label: 'Full Profile', threshold: 100 },
  ];

  const getColor = () => {
    if (percentage >= 90) return 'text-green-500';
    if (percentage >= 60) return 'text-blue-500';
    if (percentage >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTrackColor = () => {
    if (percentage >= 90) return 'stroke-green-500';
    if (percentage >= 60) return 'stroke-blue-500';
    if (percentage >= 40) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Profile Completion
      </h3>
      <div className="flex items-center gap-6">
        {/* Circular Progress */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              className={getTrackColor()}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${getColor()}`}>{percentage}%</span>
          </div>
        </div>

        {/* Checklist */}
        <div className="flex-1 space-y-2">
          {fields.map((field) => {
            const completed = percentage >= field.threshold;
            return (
              <div key={field.label} className="flex items-center gap-2.5">
                {completed ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    completed ? 'text-gray-700 font-medium' : 'text-gray-400'
                  }`}
                >
                  {field.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {percentage < 80 && (
        <div className="mt-4 flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Complete your profile to get better match recommendations!</span>
        </div>
      )}
    </div>
  );
}
