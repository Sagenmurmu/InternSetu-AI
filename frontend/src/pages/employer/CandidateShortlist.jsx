import React, { useState, useEffect } from 'react';
import { Users, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { employerService } from '../../services/employerService';
import CandidateRankTable from '../../components/employer/CandidateRankTable';
import CandidateCard from '../../components/employer/CandidateCard';
import Modal from '../../components/common/Modal';

export default function CandidateShortlist() {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [rankedCandidates, setRankedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(false);

  useEffect(() => {
    const fetchInternships = async () => {
      if (!user?.companyId) {
        setLoading(false);
        return;
      }
      try {
        const list = await employerService.getInternships(user.companyId);
        setInternships(list);
        if (list.length > 0) {
          setSelectedInternship(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load internships:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInternships();
  }, [user?.companyId]);

  useEffect(() => {
    const fetchRankings = async () => {
      if (!selectedInternship) return;
      setRankingLoading(true);
      try {
        const list = await employerService.getRankedCandidates(selectedInternship);
        setRankedCandidates(list);
      } catch (err) {
        console.error('Failed to load ranked candidates:', err);
      } finally {
        setRankingLoading(false);
      }
    };
    fetchRankings();
  }, [selectedInternship]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const currentInternship = internships.find((i) => String(i.id) === String(selectedInternship));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">AI Candidate Ranking</h1>
        </div>
        <p className="text-sm text-gray-500">
          Candidates ranked by our AI matching algorithm for each internship
        </p>
      </div>

      {/* Internship Selector */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="text-sm font-medium text-gray-600 mb-2 block">Select Internship</label>
        <select
          value={selectedInternship}
          onChange={(e) => setSelectedInternship(e.target.value)}
          className="w-full sm:w-96 px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {internships.length === 0 && <option value="">No internships available</option>}
          {internships.map((intern) => (
            <option key={intern.id} value={intern.id}>
              {intern.title} — {intern.selectedCount}/{intern.capacity} filled
            </option>
          ))}
        </select>
      </div>

      {/* Ranked Table */}
      {currentInternship && (
        <div>
          <p className="text-xs text-gray-400 mb-3">
            Showing {rankedCandidates.length} candidates ranked for "{currentInternship.title}"
          </p>
          {rankingLoading ? (
            <div className="flex items-center justify-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <CandidateRankTable
              candidates={rankedCandidates}
              onViewCandidate={(candidate) => setSelectedCandidate(candidate)}
              internship={currentInternship}
            />
          )}
        </div>
      )}

      {/* Candidate Detail Modal */}
      <Modal
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        title="Candidate Profile"
        size="lg"
      >
        {selectedCandidate && <CandidateCard candidate={selectedCandidate} />}
      </Modal>
    </div>
  );
}
