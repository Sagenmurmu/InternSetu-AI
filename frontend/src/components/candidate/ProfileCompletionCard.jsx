import React, { useMemo } from 'react';
import { CheckCircle, Circle, AlertCircle, Sparkles } from 'lucide-react';
import { calculateClientProfileCompletion } from '../../utils/profileCompletion';

export default function ProfileCompletionCard({ percentage = 0, data = null }) {
  const completionStats = useMemo(() => {
    if (data && typeof data === 'object') {
      return calculateClientProfileCompletion(data);
    }
    const pct = typeof percentage === 'number' ? percentage : 0;
    return {
      percentage: pct,
      allRequiredFilled: pct >= 90,
      missingRequired: [],
      sections: {
        basic: pct >= 20,
        education: pct >= 40,
        skills: pct >= 60,
        location: pct >= 80,
        fullProfile: pct >= 100,
      },
    };
  }, [data, percentage]);

  const livePercentage = completionStats.percentage;
  const sections = completionStats.sections;

  const fields = [
    { label: 'Basic Info', completed: sections.basic },
    { label: 'Education', completed: sections.education },
    { label: 'Skills', completed: sections.skills },
    { label: 'Location & Preferences', completed: sections.location },
    { label: 'Full Profile', completed: sections.fullProfile },
  ];

  const getColor = () => {
    if (livePercentage >= 90) return 'text-green-500';
    if (livePercentage >= 60) return 'text-blue-500';
    if (livePercentage >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTrackColor = () => {
    if (livePercentage >= 90) return 'stroke-green-500';
    if (livePercentage >= 60) return 'stroke-blue-500';
    if (livePercentage >= 40) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (livePercentage / 100) * circumference;

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
              style={{ transition: 'stroke-dashoffset 0.6s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${getColor()}`}>{livePercentage}%</span>
          </div>
        </div>

        {/* Checklist */}
        <div className="flex-1 space-y-2">
          {fields.map((field) => (
            <div key={field.label} className="flex items-center gap-2.5">
              {field.completed ? (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${
                  field.completed ? 'text-gray-700 font-medium' : 'text-gray-400'
                }`}
              >
                {field.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Warning for Missing Required Fields */}
      {completionStats.missingRequired.length > 0 && (
        <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200/60 text-amber-800 px-3 py-2.5 rounded-lg text-xs leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Required fields pending: </span>
            <span>{completionStats.missingRequired.join(', ')}</span>
          </div>
        </div>
      )}

      {/* 100% Complete celebratory note */}
      {livePercentage === 100 && (
        <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs">
          <Sparkles className="w-4 h-4 flex-shrink-0 text-green-600" />
          <span className="font-medium">Profile 100% complete! Optimized for AI matching.</span>
        </div>
      )}
    </div>
  );
}
