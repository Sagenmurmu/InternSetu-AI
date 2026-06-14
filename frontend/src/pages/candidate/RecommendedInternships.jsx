import React, { useState, useEffect } from 'react';
import { Sparkles, Search, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { candidateService } from '../../services/candidateService';
import InternshipCard from '../../components/candidate/InternshipCard';
import { SECTORS } from '../../utils/constants';

export default function RecommendedInternships() {
  const { user } = useAuth();
  const [allRecommendations, setAllRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.id) return;
      try {
        const recs = await candidateService.getRecommendations(user.id);
        setAllRecommendations(recs);
      } catch (err) {
        console.error('Failed to load recommended internships:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filtered = allRecommendations.filter((rec) => {
    const matchSearch =
      !search ||
      rec.title.toLowerCase().includes(search.toLowerCase()) ||
      rec.companyName.toLowerCase().includes(search.toLowerCase()) ||
      (rec.requiredSkills || []).some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchSector = !sectorFilter || rec.sector === sectorFilter;

    return matchSearch && matchSector;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">AI Recommended Internships</h1>
        </div>
        <p className="text-sm text-gray-500">
          Personalized matches ranked by our AI algorithm based on your profile
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, company, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Sectors</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400">
        Showing {filtered.length} of {allRecommendations.length} internships
      </p>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((rec) => (
          <InternshipCard
            key={rec.id}
            internship={rec}
            matchScore={rec.matchDetails?.finalScore}
            showSkillGap={true}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No internships match your filters</p>
        </div>
      )}
    </div>
  );
}
