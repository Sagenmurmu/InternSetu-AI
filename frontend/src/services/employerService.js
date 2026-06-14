import api, { getFromStorage, saveToStorage, addAuditLog, KEYS, isMockFallbackEnabled } from './api';
import { AUDIT_ACTIONS, APPLICATION_STATUS } from '../utils/constants';
import { mapCompanyFromApi, mapCompanyToApi, mapApplicationFromApi, mapCandidateFromApi, mapRecommendationFromApi } from '../utils/apiMappers';
import { internshipService } from './internshipService';

// Fallback mock imports
import { demoCompanies, demoInternships, demoApplications, demoCandidates } from '../data/demoData';

export const employerService = {
  getInternships: async (companyId) => {
    if (isMockFallbackEnabled()) {
      const internships = getFromStorage(KEYS.INTERNSHIPS) || demoInternships;
      return internships.filter((i) => i.companyId === companyId);
    }

    const response = await api.get('/internships/company/my');
    const data = response.data;
    const list = data.success ? data.data : data;
    return list.map(mapInternshipFromApi);
  },

  getApplications: async (companyId) => {
    if (isMockFallbackEnabled()) {
      const apps = getFromStorage(KEYS.APPLICATIONS) || demoApplications;
      const internships = getFromStorage(KEYS.INTERNSHIPS) || demoInternships;
      const companyInternshipIds = internships
        .filter((i) => i.companyId === companyId)
        .map((i) => i.id);

      return apps
        .filter((a) => companyInternshipIds.includes(a.internshipId))
        .map((app) => ({
          ...app,
          matchScore: app.matchScore || 70,
        }));
    }

    const response = await api.get('/applications/company');
    const data = response.data;
    const list = data.success ? data.data : data;
    return list.map(mapApplicationFromApi);
  },

  getDashboardStats: async (companyId) => {
    // 1. Fetch live data
    const internships = await employerService.getInternships(companyId);
    const applications = await employerService.getApplications(companyId);

    const totalPostings = internships.length;
    const totalApplicants = applications.length;
    const shortlistedCount = applications.filter((a) => a.status === APPLICATION_STATUS.SHORTLISTED || a.status === 'shortlisted').length;
    const selectedCount = applications.filter((a) => a.status === APPLICATION_STATUS.SELECTED || a.status === 'selected').length;

    const totalCapacity = internships.reduce((sum, i) => sum + i.capacity, 0);
    const usedCapacity = internships.reduce((sum, i) => sum + i.selectedCount, 0);

    return {
      totalPostings,
      totalApplicants,
      shortlistedCount,
      selectedCount,
      totalCapacity,
      remainingCapacity: Math.max(0, totalCapacity - usedCapacity),
    };
  },

  getCompanyProfile: async () => {
    if (isMockFallbackEnabled()) {
      const companies = getFromStorage(KEYS.COMPANIES) || demoCompanies;
      const user = getFromStorage(KEYS.CURRENT_USER);
      const company = companies.find((c) => c.id === user?.companyId);
      return company || null;
    }

    try {
      const response = await api.get('/employers/company');
      const data = response.data;
      const result = data.success ? data.data : data;
      return mapCompanyFromApi(result);
    } catch (e) {
      if (e.response && (e.response.status === 404 || e.response.status === 400)) {
        return null; // Return null if company profile doesn't exist yet
      }
      throw e;
    }
  },

  createCompanyProfile: async (data) => {
    if (isMockFallbackEnabled()) {
      const companies = getFromStorage(KEYS.COMPANIES) || demoCompanies;
      const newCompany = {
        id: `CO${Date.now().toString(36).toUpperCase()}`,
        ...data,
      };
      companies.push(newCompany);
      saveToStorage(KEYS.COMPANIES, companies);
      return newCompany;
    }

    const payload = mapCompanyToApi(data);
    const response = await api.post('/employers/company', payload);
    const resData = response.data;
    const result = resData.success ? resData.data : resData;
    return mapCompanyFromApi(result);
  },

  updateCompanyProfile: async (data) => {
    if (isMockFallbackEnabled()) {
      const companies = getFromStorage(KEYS.COMPANIES) || demoCompanies;
      const user = getFromStorage(KEYS.CURRENT_USER);
      const idx = companies.findIndex((c) => c.id === user?.companyId);
      if (idx === -1) throw new Error('Company not found');
      companies[idx] = { ...companies[idx], ...data };
      saveToStorage(KEYS.COMPANIES, companies);
      return companies[idx];
    }

    const payload = mapCompanyToApi(data);
    const response = await api.put('/employers/company', payload);
    const resData = response.data;
    const result = resData.success ? resData.data : resData;
    return mapCompanyFromApi(result);
  },

  updateApplicationStatus: async (applicationId, status, decisionReason = null) => {
    if (isMockFallbackEnabled()) {
      return await employerService.mockUpdateApplicationStatus(applicationId, status);
    }

    const payload = {
      status,
      decision_reason: decisionReason,
    };
    const response = await api.put(`/applications/${applicationId}/status`, payload);
    const resData = response.data;
    const result = resData.success ? resData.data : resData;
    return mapApplicationFromApi(result);
  },

  getRankedCandidates: async (internshipId) => {
    if (isMockFallbackEnabled()) {
      return await employerService.mockGetRankedCandidates(internshipId);
    }

    // Call matching API endpoint for internship rankings
    let response;
    try {
      response = await api.get(`/matching/internship/${internshipId}`);
    } catch (e) {
      // If matches don't exist yet, trigger matching generation first
      response = await api.post(`/matching/internship/${internshipId}/generate`);
    }

    const resData = response.data;
    const matches = resData.success ? resData.data : resData;

    // Map candidates and matches
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

    // Sort by final score
    return rankedList.sort((a, b) => b.matchDetails.finalScore - a.matchDetails.finalScore);
  },

  // Mock Fallbacks
  mockUpdateApplicationStatus: async (applicationId, status) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const apps = getFromStorage(KEYS.APPLICATIONS) || demoApplications;
    const appIdx = apps.findIndex((a) => a.id === applicationId);
    if (appIdx === -1) throw new Error('Application not found');

    const app = apps[appIdx];
    app.status = status;
    app.updatedAt = new Date().toISOString();
    apps[appIdx] = app;
    saveToStorage(KEYS.APPLICATIONS, apps);
    return app;
  },

  mockGetRankedCandidates: async (internshipId) => {
    const { matchingService } = await import('./matchingService');
    return matchingService.getRankedCandidatesForInternship(internshipId);
  },
};
