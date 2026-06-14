import React from 'react';
import { Shield, TrendingUp } from 'lucide-react';

export default function FairnessScoreCard({ score = 0, categoryData = [], ruralUrbanData = [] }) {
  const getColor = () => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStroke = () => {
    if (score >= 85) return '#22c55e';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#eab308';
    return '#ef4444';
  };

  const circumference = 2 * Math.PI * 48;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Shield className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Overall Fairness Score
        </h3>
      </div>

      <div className="flex items-center gap-8">
        {/* Circular Score */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="48" fill="none" stroke="#f1f5f9" strokeWidth="9" />
            <circle
              cx="55"
              cy="55"
              r="48"
              fill="none"
              stroke={getStroke()}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-extrabold ${getColor()}`}>{score}%</span>
            <span className="text-[9px] text-gray-400 font-medium">Fairness</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 space-y-4">
          {/* Category representation */}
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">Category Representation</p>
            <div className="space-y-1.5">
              {categoryData.slice(0, 4).map((cat) => (
                <div key={cat.category} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500 w-14">{cat.category}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-gray-600 font-medium w-10 text-right">
                    {cat.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rural/Urban */}
          {ruralUrbanData.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">Rural vs Urban</p>
              <div className="flex gap-3">
                {ruralUrbanData.map((item) => (
                  <div key={item.type} className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-gray-800">{item.percentage}%</p>
                    <p className="text-[10px] text-gray-500">{item.type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
