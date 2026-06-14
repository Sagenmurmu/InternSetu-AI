import api, { getFromStorage, saveToStorage, KEYS, isMockFallbackEnabled } from './api';
import { mapInternshipFromApi, mapInternshipToApi, mapApplicationFromApi } from '../utils/apiMappers';

// Fallback mock imports
import { demoInternships, demoCompanies, demoApplications } from '../data/demoData';

export const internshipService = {
  getAll: async () => {
    if (isMockFallbackEnabled()) {
      const internships = getFromStorage(KEYS.INTERNSHIPS) || demoInternships;
      return internships;
    }

    const response = await api.get('/internships/');
    const data = response.data;
    const list = data.success ? data.data : data;
    return list.map(mapInternshipFromApi);
  },

  getById: async (id) => {
    if (isMockFallbackEnabled()) {
      const internships = getFromStorage(KEYS.INTERNSHIPS) || demoInternships;
      const companies = getFromStorage(KEYS.COMPANIES) || demoCompanies;
      const internship = internships.find((i) => i.id === id);
      if (!internship) return null;
      const company = companies.find((c) => c.id === internship.companyId);
      return { ...internship, company };
    }

    const response = await api.get(`/internships/${id}`);
    const data = response.data;
    const item = data.success ? data.data : data;
    return mapInternshipFromApi(item);
  },

  create: async (data, companyId) => {
    if (isMockFallbackEnabled()) {
      return await internshipService.mockCreate(data, companyId);
    }

    const payload = mapInternshipToApi(data);
    const response = await api.post('/internships/', payload);
    const resData = response.data;
    const result = resData.success ? resData.data : resData;
    return mapInternshipFromApi(result);
  },

  update: async (id, data) => {
    if (isMockFallbackEnabled()) {
      return await internshipService.mockUpdate(id, data);
    }

    const payload = mapInternshipToApi(data);
    const response = await api.put(`/internships/${id}`, payload);
    const resData = response.data;
    const result = resData.success ? resData.data : resData;
    return mapInternshipFromApi(result);
  },

  delete: async (id) => {
    if (isMockFallbackEnabled()) {
      return await internshipService.mockDelete(id);
    }
    
    // Fallback: If backend does not support deleting posts yet, return true or log it
    console.warn("Delete endpoint not implemented in backend, simulating success.");
    return true;
  },

  apply: async (candidateId, internshipId) => {
    if (isMockFallbackEnabled()) {
      return await internshipService.mockApply(candidateId, internshipId);
    }

    const payload = {
      internship_id: internshipId,
    };
    
    const response = await api.post('/applications/', payload);
    const resData = response.data;
    const result = resData.success ? resData.data : resData;
    return mapApplicationFromApi(result);
  },

  getApplications: async (candidateId) => {
    if (isMockFallbackEnabled()) {
      const apps = getFromStorage(KEYS.APPLICATIONS) || demoApplications;
      return apps.filter((a) => a.candidateId === candidateId);
    }

    const response = await api.get('/candidates/me/applications');
    const data = response.data;
    const list = data.success ? data.data : data;
    return list.map(mapApplicationFromApi);
  },

  // Mock Fallbacks
  mockCreate: async (data, companyId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const internships = getFromStorage(KEYS.INTERNSHIPS) || demoInternships;
    const companies = getFromStorage(KEYS.COMPANIES) || demoCompanies;
    const company = companies.find((c) => c.id === companyId) || { name: 'Unknown Company' };

    const newInternship = {
      id: `INT${Date.now().toString(36).toUpperCase()}`,
      companyId,
      companyName: company.name,
      title: data.title,
      description: data.description,
      sector: data.sector,
      requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills : data.requiredSkills.split(',').map(s => s.trim()),
      requiredQualification: data.requiredQualification,
      location: data.location,
      district: data.district || data.location,
      state: data.state,
      duration: data.duration || '3 months',
      stipend: Number(data.stipend) || 0,
      capacity: Number(data.capacity) || 5,
      selectedCount: 0,
      mode: data.mode || 'Remote',
    };

    internships.unshift(newInternship);
    saveToStorage(KEYS.INTERNSHIPS, internships);
    return newInternship;
  },

  mockUpdate: async (id, data) => {
    const internships = getFromStorage(KEYS.INTERNSHIPS) || demoInternships;
    const idx = internships.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Internship not found');
    const updated = { ...internships[idx], ...data };
    internships[idx] = updated;
    saveToStorage(KEYS.INTERNSHIPS, internships);
    return updated;
  },

  mockDelete: async (id) => {
    let internships = getFromStorage(KEYS.INTERNSHIPS) || demoInternships;
    internships = internships.filter((i) => i.id !== id);
    saveToStorage(KEYS.INTERNSHIPS, internships);
    return true;
  },

  mockApply: async (candidateId, internshipId) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const apps = getFromStorage(KEYS.APPLICATIONS) || demoApplications;
    const alreadyApplied = apps.some((a) => a.candidateId === candidateId && a.internshipId === internshipId);
    if (alreadyApplied) {
      throw new Error('You have already applied for this internship.');
    }

    const candidates = getFromStorage(KEYS.CANDIDATES) || demoCandidates;
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) throw new Error('Candidate profile not found.');

    const internships = getFromStorage(KEYS.INTERNSHIPS) || demoInternships;
    const internship = internships.find((i) => i.id === internshipId);
    if (!internship) throw new Error('Internship not found.');

    const newApp = {
      id: `APP${Date.now().toString(36).toUpperCase()}`,
      candidateId,
      candidateName: candidate.name,
      internshipId,
      internshipTitle: internship.title,
      companyName: internship.companyName,
      status: 'applied',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    apps.unshift(newApp);
    saveToStorage(KEYS.APPLICATIONS, apps);
    return newApp;
  },
};
