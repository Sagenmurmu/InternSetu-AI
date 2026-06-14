import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Banknote, Users, Building2, Globe, Briefcase, Send } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { internshipService } from '../../services/internshipService';
import { matchingService } from '../../services/matchingService';
import MatchScoreCard from '../../components/candidate/MatchScoreCard';
import ExplanationBox from '../../components/candidate/ExplanationBox';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { formatCurrency, calculateRemainingCapacity } from '../../utils/helpers';

export default function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');
  const [internshipData, setInternshipData] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [internship, match, apps] = await Promise.all([
          internshipService.getById(id),
          matchingService.getMatch(user?.id, id),
          internshipService.getApplications(user?.id)
        ]);
        setInternshipData(internship);
        setMatchDetails(match);
        setAlreadyApplied(apps.some((a) => String(a.internshipId) === String(id)));
      } catch (err) {
        console.error('Failed to load internship details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!internshipData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400 text-lg mb-4">Internship not found</p>
        <Button variant="outline" onClick={() => navigate('/candidate/recommendations')}>
          Back to Recommendations
        </Button>
      </div>
    );
  }

  const remaining = calculateRemainingCapacity(internshipData.capacity, internshipData.selectedCount);

  const handleApply = async () => {
    setApplying(true);
    setError('');
    try {
      await internshipService.apply(user.id, id);
      setApplied(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-7 h-7 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{internshipData.title}</h1>
                <p className="text-base text-gray-500 mt-0.5">{internshipData.companyName}</p>
              </div>
              <Badge status={internshipData.mode} />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-sm font-medium text-gray-800">{internshipData.location}, {internshipData.state}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Duration</p>
                  <p className="text-sm font-medium text-gray-800">{internshipData.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Stipend</p>
                  <p className="text-sm font-medium text-gray-800">{formatCurrency(internshipData.stipend)}/mo</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Seats Left</p>
                  <p className="text-sm font-medium text-gray-800">{remaining} of {internshipData.capacity}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">About This Internship</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{internshipData.description}</p>
            </div>

            {/* Required Skills */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(internshipData.requiredSkills || []).map((skill) => {
                  const hasSkill = (user?.candidateData?.skills || []).some(
                    (s) => s.toLowerCase() === skill.toLowerCase()
                  );
                  return (
                    <span
                      key={skill}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                        hasSkill
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                    >
                      {skill} {hasSkill && '✓'}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Required Qualification */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Required Qualification</h3>
              <span className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 border border-blue-200 text-blue-700">
                {internshipData.requiredQualification}
              </span>
            </div>

            {/* Company Info */}
            {internshipData.company && (
              <div className="mt-5 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">About {internshipData.company.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{internshipData.company.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{internshipData.company.sector}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{internshipData.company.location}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Apply Button */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              {error && (
                <div className="mb-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}
              {alreadyApplied || applied ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 text-sm font-medium">
                  <Send className="w-4 h-4" />
                  <span>Application Submitted! Track it in your Applications page.</span>
                </div>
              ) : (
                <Button
                  onClick={handleApply}
                  disabled={applying || remaining === 0}
                  icon={Send}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {applying ? 'Submitting...' : remaining === 0 ? 'No Seats Available' : 'Apply Now'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Match Analysis */}
        <div className="space-y-6">
          {matchDetails && <MatchScoreCard matchDetails={matchDetails} />}
          {matchDetails?.explanation && (
            <ExplanationBox explanations={matchDetails.explanation} />
          )}
        </div>
      </div>
    </div>
  );
}
