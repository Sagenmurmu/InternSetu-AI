import api, { getFromStorage, saveToStorage, KEYS, isMockFallbackEnabled } from './api';
import { mapCandidateFromApi, mapCandidateToApi, mapRecommendationFromApi, mapApplicationFromApi } from '../utils/apiMappers';
import { internshipService } from './internshipService';

// Fallback mock imports
import { demoCandidates } from '../data/demoData';

export const candidateService = {
  getProfile: async (id) => {
    if (isMockFallbackEnabled()) {
      const candidates = getFromStorage(KEYS.CANDIDATES) || demoCandidates;
      return candidates.find((c) => c.id === id) || null;
    }

    try {
      const response = await api.get('/candidates/me');
      const data = response.data;
      const payload = data.success ? data.data : data;
      // Backend profile endpoint returns either candidate model or full profile details
      const candidateProfile = payload.candidate || payload;
      return mapCandidateFromApi(candidateProfile);
    } catch (e) {
      if (e.response && (e.response.status === 404 || e.response.status === 400)) {
        return null; // Resolve to null if profile doesn't exist yet
      }
      throw e;
    }
  },

  updateProfile: async (id, data, fromParser = false) => {
    if (isMockFallbackEnabled()) {
      return await candidateService.mockUpdateProfile(id, data);
    }

    const payload = mapCandidateToApi(data);
    
    // Check if profile exists first
    const existingProfile = await candidateService.getProfile(id);
    let response;
    
    if (existingProfile) {
      // Update
      response = await api.put(`/candidates/me?from_parser=${fromParser}`, payload);
    } else {
      // Create
      response = await api.post('/candidates/profile', payload);
    }

    const resData = response.data;
    const result = resData.success ? resData.data : resData;
    return mapCandidateFromApi(result.candidate || result);
  },

  parseResume: async (file) => {
    if (isMockFallbackEnabled()) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        name: "Mock Parsed Name",
        email: "mock.parsed@example.com",
        phone: "+91 9876543210",
        skills: ["React", "SQL", "Excel"],
        qualification: "B.Tech / B.E.",
        projects: [],
        raw_text_preview: "Mock PDF content: John Doe\nEmail: mock.parsed@example.com\nPhone: +91 9876543210\nQualification: B.Tech / B.E.\nSkills: React, SQL, Excel, Python."
      };
    }
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/candidates/me/resume/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const resData = response.data;
    return resData.success ? resData.data : resData;
  },

  getRecommendations: async (id) => {
    if (isMockFallbackEnabled()) {
      const matches = await candidateService.mockGetRecommendations(id);
      return matches;
    }

    // 1. Fetch active internships
    const internships = await internshipService.getAll();

    // 2. Fetch recommendations from backend
    const response = await api.get('/candidates/me/recommendations');
    const resData = response.data;
    const recs = resData.success ? resData.data : resData;

    const mappedRecs = recs.map(mapRecommendationFromApi);

    // 3. Match internships with recommendations
    const matches = internships.map((internship) => {
      const matchDetails = mappedRecs.find((r) => r.internshipId === internship.id);
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

    // Sort by finalScore descending
    return matches.sort((a, b) => b.matchDetails.finalScore - a.matchDetails.finalScore);
  },

  getApplications: async (id) => {
    if (isMockFallbackEnabled()) {
      return internshipService.getApplications(id);
    }

    const response = await api.get('/candidates/me/applications');
    const resData = response.data;
    const apps = resData.success ? resData.data : resData;
    return apps.map(mapApplicationFromApi);
  },

  // Mock Fallbacks
  mockUpdateProfile: async (id, data) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const candidates = getFromStorage(KEYS.CANDIDATES) || demoCandidates;
    const idx = candidates.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Candidate profile not found.');

    const currentCandidate = candidates[idx];
    const fields = [
      'name', 'email', 'age', 'gender', 'category', 'ruralOrUrban',
      'district', 'state', 'qualification', 'course', 'college',
      'skills', 'sectorInterest', 'locationPreference',
    ];
    
    const combinedData = { ...currentCandidate, ...data };
    const filledFields = fields.filter((field) => {
      const val = combinedData[field];
      if (Array.isArray(val)) return val.length > 0;
      return val !== undefined && val !== null && val !== '';
    });
    
    const profileCompletion = Math.round((filledFields.length / fields.length) * 100);
    const updatedCandidate = {
      ...combinedData,
      profileCompletion,
    };

    candidates[idx] = updatedCandidate;
    saveToStorage(KEYS.CANDIDATES, candidates);
    return updatedCandidate;
  },

  mockGetRecommendations: async (id) => {
    const { matchingService } = await import('./matchingService');
    return matchingService.getRecommendedInternships(id);
  },
};
