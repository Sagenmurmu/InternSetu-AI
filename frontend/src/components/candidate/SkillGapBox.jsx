import React, { useState, useEffect } from 'react';
import { matchingService } from '../../services/matchingService';
import { BookOpen, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

export default function SkillGapBox({ internshipId, candidateId, userRole = 'candidate' }) {
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGap() {
      try {
        setLoading(true);
        let res;
        if (userRole === 'candidate') {
          res = await matchingService.getMySkillGap(internshipId);
        } else if (candidateId) {
          res = await matchingService.getSkillGap(candidateId, internshipId);
        }
        setGapData(res);
      } catch (err) {
        console.error('Failed to load skill gap analysis:', err);
      } finally {
        setLoading(false);
      }
    }

    if (internshipId) {
      fetchGap();
    }
  }, [internshipId, candidateId, userRole]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 py-4 justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
        <span className="text-sm text-gray-500 font-medium">Analyzing skill gaps...</span>
      </div>
    );
  }

  if (!gapData) return null;

  const { matched_skills, missing_skills, match_percentage, priority_skills, recommendations } = gapData;

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <BookOpen className="h-4 w-4 text-indigo-600 mr-1.5" />
          Skill Gap Analysis
        </h3>
        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
          {match_percentage}% Skill Fit
        </span>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mr-1" />
          Matched Skills ({matched_skills.length})
        </h4>
        {matched_skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {matched_skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">No skills matched yet.</span>
        )}
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mr-1" />
          Missing Skills ({missing_skills.length})
        </h4>
        {missing_skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {missing_skills.map((skill) => {
              const isPriority = priority_skills.includes(skill);
              return (
                <span
                  key={skill}
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                    isPriority
                      ? 'bg-red-50 text-red-700 ring-red-600/20 font-bold'
                      : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                  }`}
                >
                  {skill} {isPriority && '★'}
                </span>
              );
            })}
          </div>
        ) : (
          <span className="text-xs text-green-600 font-medium">You have met all skill requirements!</span>
        )}
      </div>

      {recommendations.length > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
            <Lightbulb className="h-3.5 w-3.5 text-indigo-500 mr-1" />
            Learning Recommendations
          </h4>
          <ul className="list-disc list-inside space-y-1.5">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="text-xs text-gray-600 font-medium leading-relaxed">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
