import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Banknote, Users, Sparkles, Building2, ArrowRight } from 'lucide-react';
import Badge from '../common/Badge';
import { formatCurrency, getScoreColor, calculateRemainingCapacity } from '../../utils/helpers';

export default function InternshipCard({ internship, matchScore, showMatch = true }) {
  const navigate = useNavigate();
  const remaining = calculateRemainingCapacity(internship.capacity, internship.selectedCount);

  return (
    <div
      onClick={() => navigate(`/candidate/internship/${internship.id}`)}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Building2 className="w-4.5 h-4.5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{internship.companyName}</p>
                <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                  {internship.title}
                </h3>
              </div>
            </div>
          </div>
          {showMatch && matchScore !== undefined && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 ${getScoreColor(matchScore)}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-sm font-bold">{matchScore}%</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {internship.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(internship.requiredSkills || []).slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-indigo-50 text-indigo-700"
            >
              {skill}
            </span>
          ))}
          {(internship.requiredSkills || []).length > 4 && (
            <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-gray-100 text-gray-500">
              +{internship.requiredSkills.length - 4} more
            </span>
          )}
        </div>

        {/* Info Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{internship.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{internship.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Banknote className="w-3.5 h-3.5" />
            <span>{formatCurrency(internship.stipend)}/mo</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{remaining} seat{remaining !== 1 ? 's' : ''} left</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between">
        <Badge status={internship.mode} />
        <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
