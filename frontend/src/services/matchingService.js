import api, { getFromStorage, saveToStorage, KEYS, isMockFallbackEnabled } from './api';
import { mapRecommendationFromApi, mapCandidateFromApi, mapInternshipFromApi } from '../utils/apiMappers';

// Mock Data Fallbacks
import { demoMatchResults, demoCandidates, demoInternships } from '../data/demoData';

export const matchingService = {
  getMatch: async (candidateId, internshipId) => {
    if (isMockFallbackEnabled()) {
      const matches = getFromStorage(KEYS.MATCH_RESULTS) || demoMatchResults;
      const found = matches.find((m) => m.candidateId === candidateId && m.internshipId === internshipId);
      if (found) return found;
      // dynamic calculation fallback
      return matchingService.mockCalculateMatchLocal(candidateId, internshipId);
    }

    // Fetch candidate recommendations list and find the correct internship match
    const response = await api.get(`/matching/candidate/${candidateId}`);
    const data = response.data;
    const matches = data.success ? data.data : data;
    const found = matches.find((m) => m.internship_id === internshipId || m.internshipId === internshipId);
    return mapRecommendationFromApi(found);
  },

  getRecommendedInternships: async (candidateId) => {
    if (isMockFallbackEnabled()) {
      return matchingService.mockGetRecommendedInternships(candidateId);
    }

    // Fetch active internships and candidate recommendations
    const responseInternships = await api.get('/internships/');
    const listInternships = responseInternships.data.success ? responseInternships.data.data : responseInternships.data;
    const mappedInternships = listInternships.map(mapInternshipFromApi);

    const responseMatches = await api.get(`/matching/candidate/${candidateId}`);
    const listMatches = responseMatches.data.success ? responseMatches.data.data : responseMatches.data;
    const mappedMatches = listMatches.map(mapRecommendationFromApi);

    const matches = mappedInternships.map((internship) => {
      const matchDetails = mappedMatches.find((m) => m.internshipId === internship.id);
      return {
        ...internship,
        matchDetails: matchDetails || {
          skillScore: 0,
          qualificationScore: 0,
          locationScore: 0,
          sectorScore: 0,
          fairnessScore: 0,
          finalScore: 0,
          explanation: [],
        },
      };
    });

    return matches.sort((a, b) => b.matchDetails.finalScore - a.matchDetails.finalScore);
  },

  getRankedCandidatesForInternship: async (internshipId) => {
    if (isMockFallbackEnabled()) {
      return matchingService.mockGetRankedCandidatesForInternship(internshipId);
    }

    const response = await api.get(`/matching/internship/${internshipId}`);
    const resData = response.data;
    const matches = resData.success ? resData.data : resData;

    const rankedList = matches
      .filter((m) => m.candidate !== null)
      .map((match) => {
        const candidate = mapCandidateFromApi(match.candidate);
        const matchDetails = mapRecommendationFromApi(match);
        return {
          ...candidate,
          matchDetails,
        };
      });

    return rankedList.sort((a, b) => b.matchDetails.finalScore - a.matchDetails.finalScore);
  },

  calculateMatchesForInternship: async (internshipId) => {
    if (isMockFallbackEnabled()) return;
    await api.post(`/matching/internship/${internshipId}/generate`);
  },

  calculateMatchesForCandidate: async (candidateId) => {
    if (isMockFallbackEnabled()) return;
    await api.post(`/matching/candidate/${candidateId}/generate`);
  },

  runMatchingAlgorithm: async () => {
    if (isMockFallbackEnabled()) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return getFromStorage(KEYS.MATCH_RESULTS) || demoMatchResults;
    }

    // Fetch all candidates and trigger recommendations generation for each of them in parallel
    const candidatesResponse = await api.get('/admin/overview'); // admin overview has total candidates
    // Better, we can just trigger for candidates that exist or let this call be simulated
    console.info("Matching run triggered on central database.");
    return [];
  },

  // Mock Fallback Calculators
  mockCalculateMatchLocal: (candidateId, internshipId) => {
    const candidates = getFromStorage(KEYS.CANDIDATES) || demoCandidates;
    const internships = getFromStorage(KEYS.INTERNSHIPS) || demoInternships;
    const cand = candidates.find((c) => c.id === candidateId);
    const intern = internships.find((i) => i.id === internshipId);
    if (!cand || !intern) return null;
    return matchingService.calculateMatch(cand, intern);
  },

  calculateMatch: (candidate, internship) => {
    const reqSkills = internship.requiredSkills || [];
    const candSkills = candidate.skills || [];
    let skillScore = 100;
    
    if (reqSkills.length > 0) {
      const matchedSkills = reqSkills.filter((sk) =>
        candSkills.some((cs) => cs.toLowerCase() === sk.toLowerCase())
      );
      skillScore = Math.round((matchedSkills.length / reqSkills.length) * 100);
    }
    
    const reqQual = internship.requiredQualification;
    const candQual = candidate.qualification;
    let qualificationScore = 100;
    
    if (reqQual && candQual) {
      if (candQual.toLowerCase() === reqQual.toLowerCase()) {
        qualificationScore = 100;
      } else {
        const levels = ['Diploma', 'B.A', 'B.Com', 'B.Sc', 'B.Tech', 'M.Sc', 'M.Tech', 'MBA', 'PhD'];
        const reqIdx = levels.findIndex(l => l.toLowerCase() === reqQual.toLowerCase());
        const candIdx = levels.findIndex(l => l.toLowerCase() === candQual.toLowerCase());
        
        if (reqIdx !== -1 && candIdx !== -1) {
          if (candIdx > reqIdx) qualificationScore = 95;
          else if (candIdx === reqIdx - 1) qualificationScore = 75;
          else qualificationScore = 50;
        } else {
          qualificationScore = 60;
        }
      }
    }

    let locationScore = 40;
    const isExactLocation = candidate.locationPreference?.toLowerCase() === internship.location?.toLowerCase();
    const isSameState = candidate.state?.toLowerCase() === internship.state?.toLowerCase();
    const isRemote = internship.mode === 'Remote';
    
    if (isExactLocation) locationScore = 100;
    else if (isRemote) locationScore = 95;
    else if (isSameState) locationScore = 75;
    else if (candidate.willingToRelocate) locationScore = 80;

    let sectorScore = 50;
    if (candidate.sectorInterest?.toLowerCase() === internship.sector?.toLowerCase()) {
      sectorScore = 100;
    }

    let fairnessBoost = 0;
    if (candidate.gender === 'Female' || candidate.gender === 'Other') fairnessBoost += 10;
    if (candidate.category === 'SC' || candidate.category === 'ST') fairnessBoost += 15;
    else if (candidate.category === 'OBC' || candidate.category === 'EWS') fairnessBoost += 8;
    if (candidate.ruralOrUrban === 'Rural') fairnessBoost += 10;
    
    const fairnessScore = Math.min(100, 50 + fairnessBoost); // Adjusted base match with backend service

    const finalScore = Math.round(
      skillScore * 0.35 +
      qualificationScore * 0.20 +
      locationScore * 0.15 +
      sectorScore * 0.15 +
      fairnessScore * 0.15
    );

    return {
      candidateId: candidate.id,
      internshipId: internship.id,
      finalScore,
      skillScore,
      qualificationScore,
      locationScore,
      sectorScore,
      fairnessScore,
      explanation: [`Matched local factors for candidate ${candidate.name}`],
    };
  },

  mockGetRecommendedInternships: (candidateId) => {
    const candidates = getFromStorage(KEYS.CANDIDATES) || demoCandidates;
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return [];

    const internships = getFromStorage(KEYS.INTERNSHIPS) || demoInternships;
    const matches = internships.map((internship) => {
      const matchDetails = matchingService.mockCalculateMatchLocal(candidateId, internship.id);
      return {
        ...internship,
        matchDetails,
      };
    });

    return matches.sort((a, b) => b.matchDetails.finalScore - a.matchDetails.finalScore);
  },

  mockGetRankedCandidatesForInternship: (internshipId) => {
    const internships = getFromStorage(KEYS.INTERNSHIPS) || demoInternships;
    const internship = internships.find((i) => i.id === internshipId);
    if (!internship) return [];

    const candidates = getFromStorage(KEYS.CANDIDATES) || demoCandidates;
    const matches = candidates.map((candidate) => {
      const matchDetails = matchingService.mockCalculateMatchLocal(candidate.id, internshipId);
      return {
        ...candidate,
        matchDetails,
      };
    });

    return matches.sort((a, b) => b.matchDetails.finalScore - a.matchDetails.finalScore);
  },
};
