import React from 'react';

export default function StatsCard({ label, value, icon: Icon, color = 'bg-indigo-50 text-indigo-600', subtext }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3.5 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        {Icon && <Icon className="w-5.5 h-5.5" />}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-[11px] text-gray-500 truncate">{label}</p>
        {subtext && <p className="text-[10px] text-gray-400 mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}
