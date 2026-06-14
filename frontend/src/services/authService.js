import api, { getFromStorage, saveToStorage, addAuditLog, KEYS, isMockFallbackEnabled } from './api';
import { AUDIT_ACTIONS } from '../utils/constants';
import { mapCandidateFromApi, mapCompanyFromApi } from '../utils/apiMappers';

// Copy of original mock data fallback behaviors
import { demoCandidates, demoCompanies } from '../data/demoData';

export const authService = {
  normalizeUser: (user) => {
    if (!user) return null;
    const normalized = { ...user };
    if (user.role === 'candidate') {
      if (user.candidate) {
        normalized.candidateData = mapCandidateFromApi(user.candidate);
      } else if (user.candidateData) {
        normalized.candidateData = mapCandidateFromApi(user.candidateData);
      }
    } else if (user.role === 'employer') {
      if (user.company) {
        normalized.companyData = mapCompanyFromApi(user.company);
        normalized.companyId = user.company.id;
      } else if (user.companyData) {
        normalized.companyData = mapCompanyFromApi(user.companyData);
        normalized.companyId = user.companyData.id;
      }
    }
    return normalized;
  },

  login: async (email, password, role) => {
    // 1. Check if mock fallback is enabled
    if (isMockFallbackEnabled()) {
      try {
        return await authService.mockLogin(email, password, role);
      } catch (e) {
        console.warn('Mock login fallback error:', e);
      }
    }

    // 2. Real API Login
    const response = await api.post('/auth/login', { email, password });
    const data = response.data; // success_response wrapper returns { success: true, data: { access_token, user } }
    
    // Check if backend success wrapper format is used
    const payload = data.success ? data.data : data;
    
    const { access_token, user } = payload;

    // Save token
    localStorage.setItem(KEYS.TOKEN, access_token);

    // Fetch full profile info right away
    try {
      const meResponse = await api.get('/auth/me');
      const meData = meResponse.data;
      const meUser = meData.success ? meData.data : meData;
      const normalizedUser = authService.normalizeUser(meUser);
      saveToStorage(KEYS.CURRENT_USER, normalizedUser);
      return normalizedUser;
    } catch (e) {
      console.warn('Failed to fetch full profile during login, using base user info:', e);
      const normalizedUser = authService.normalizeUser(user);
      saveToStorage(KEYS.CURRENT_USER, normalizedUser);
      return normalizedUser;
    }
  },

  register: async (userData) => {
    if (isMockFallbackEnabled()) {
      try {
        return await authService.mockRegister(userData);
      } catch (e) {
        console.warn('Mock register fallback error:', e);
      }
    }

    // Send register request with required fields
    const payload = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
    };

    const response = await api.post('/auth/register', payload);
    const data = response.data;
    
    const result = data.success ? data.data : data;

    // Save token and user if returned (auth_service.py register returns access_token & user)
    if (result.access_token && result.user) {
      localStorage.setItem(KEYS.TOKEN, result.access_token);
      try {
        const meResponse = await api.get('/auth/me');
        const meData = meResponse.data;
        const meUser = meData.success ? meData.data : meData;
        const normalizedUser = authService.normalizeUser(meUser);
        saveToStorage(KEYS.CURRENT_USER, normalizedUser);
        return normalizedUser;
      } catch (e) {
        console.warn('Failed to fetch full profile during registration, using base user info:', e);
        const normalizedUser = authService.normalizeUser(result.user);
        saveToStorage(KEYS.CURRENT_USER, normalizedUser);
        return normalizedUser;
      }
    }

    return result;
  },

  logout: () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      // Log logout locally
      addAuditLog(AUDIT_ACTIONS.USER_LOGIN, currentUser.role, `${currentUser.name} logged out.`);
    }
    localStorage.removeItem(KEYS.TOKEN);
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  getCurrentUser: () => {
    return getFromStorage(KEYS.CURRENT_USER);
  },

  getToken: () => {
    return localStorage.getItem(KEYS.TOKEN);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(KEYS.TOKEN);
  },

  updateCurrentUserProfile: (profileData) => {
    const user = getFromStorage(KEYS.CURRENT_USER);
    if (!user) return null;

    if (profileData.name) {
      user.name = profileData.name;
    }

    if (user.role === 'candidate') {
      user.candidateData = { ...user.candidateData, ...profileData };
    } else if (user.role === 'employer') {
      user.companyData = { ...user.companyData, ...profileData };
    }

    // Keep in sync with user state
    saveToStorage(KEYS.CURRENT_USER, user);
    return user;
  },

  // Mock Authentication Fallbacks (Original mockup implementations)
  mockLogin: async (email, password, role) => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (role === 'admin') {
      if (email === 'admin@internsetu.gov.in' && password === 'admin123') {
        const adminUser = {
          id: 'ADMIN001',
          name: 'Central Admin Officer',
          email: 'admin@internsetu.gov.in',
          role: 'admin',
        };
        localStorage.setItem(KEYS.TOKEN, 'mock_admin_token');
        saveToStorage(KEYS.CURRENT_USER, adminUser);
        addAuditLog(AUDIT_ACTIONS.USER_LOGIN, 'admin', 'Admin logged in.');
        return adminUser;
      } else {
        throw new Error('Invalid Admin credentials. Use admin@internsetu.gov.in / admin123');
      }
    }

    if (role === 'candidate') {
      const candidates = getFromStorage(KEYS.CANDIDATES) || demoCandidates;
      const candidate = candidates.find((c) => c.email.toLowerCase() === email.toLowerCase());
      
      if (candidate) {
        const user = {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          role: 'candidate',
          candidateData: candidate,
        };
        localStorage.setItem(KEYS.TOKEN, 'mock_candidate_token');
        saveToStorage(KEYS.CURRENT_USER, user);
        addAuditLog(AUDIT_ACTIONS.USER_LOGIN, 'candidate', `Candidate ${candidate.name} logged in.`);
        return user;
      } else {
        throw new Error('Candidate not found. Please register or use a demo email (e.g. priya.sharma@example.com)');
      }
    }

    if (role === 'employer') {
      const companies = getFromStorage(KEYS.COMPANIES) || demoCompanies;
      const emailDomain = email.split('@')[1];
      const company = companies.find(
        (c) => c.website && c.website.toLowerCase().includes(emailDomain.toLowerCase())
      );

      if (company) {
        const user = {
          id: company.id,
          name: `${company.name} HR`,
          email: email,
          role: 'employer',
          companyId: company.id,
          companyData: company,
        };
        localStorage.setItem(KEYS.TOKEN, 'mock_employer_token');
        saveToStorage(KEYS.CURRENT_USER, user);
        addAuditLog(AUDIT_ACTIONS.USER_LOGIN, 'employer', `${company.name} HR logged in.`);
        return user;
      } else {
        throw new Error('Company not found. Please register or use hr@technova.example.com');
      }
    }

    throw new Error('Invalid role specified');
  },

  mockRegister: async (userData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const { name, email, password, role, ...extraData } = userData;

    if (role === 'candidate') {
      const candidates = getFromStorage(KEYS.CANDIDATES) || [];
      if (candidates.some((c) => c.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email is already registered');
      }

      const newCandidate = {
        id: `C${Date.now().toString(36).toUpperCase()}`,
        name,
        email,
        age: extraData.age ? Number(extraData.age) : 21,
        gender: extraData.gender || 'Female',
        category: extraData.category || 'General',
        ruralOrUrban: extraData.ruralOrUrban || 'Urban',
        district: extraData.district || 'Ranchi',
        state: extraData.state || 'Jharkhand',
        qualification: extraData.qualification || 'B.Tech',
        course: extraData.course || 'Computer Science',
        college: extraData.college || 'College Tech',
        skills: extraData.skills || [],
        sectorInterest: extraData.sectorInterest || 'IT',
        locationPreference: extraData.locationPreference || 'Ranchi',
        willingToRelocate: extraData.willingToRelocate !== undefined ? extraData.willingToRelocate : true,
        pastParticipation: false,
        profileCompletion: 50,
      };

      candidates.push(newCandidate);
      saveToStorage(KEYS.CANDIDATES, candidates);

      const user = {
        id: newCandidate.id,
        name: newCandidate.name,
        email: newCandidate.email,
        role: 'candidate',
        candidateData: newCandidate,
      };

      localStorage.setItem(KEYS.TOKEN, 'mock_candidate_token');
      saveToStorage(KEYS.CURRENT_USER, user);
      addAuditLog(AUDIT_ACTIONS.USER_LOGIN, 'candidate', `Candidate ${newCandidate.name} registered.`);
      return user;
    }

    if (role === 'employer') {
      const companies = getFromStorage(KEYS.COMPANIES) || [];
      const companyName = extraData.companyName || name;
      
      const newCompany = {
        id: `CO${Date.now().toString(36).toUpperCase()}`,
        name: companyName,
        sector: extraData.sector || 'IT',
        location: extraData.location || 'Bengaluru',
        state: extraData.state || 'Karnataka',
        website: extraData.website || `https://${companyName.toLowerCase().replace(/\s+/g, '')}.example.com`,
        description: extraData.description || 'Company description',
        logo: null,
      };

      companies.push(newCompany);
      saveToStorage(KEYS.COMPANIES, companies);

      const user = {
        id: newCompany.id,
        name: `${newCompany.name} HR`,
        email: email,
        role: 'employer',
        companyId: newCompany.id,
        companyData: newCompany,
      };

      localStorage.setItem(KEYS.TOKEN, 'mock_employer_token');
      saveToStorage(KEYS.CURRENT_USER, user);
      addAuditLog(AUDIT_ACTIONS.USER_LOGIN, 'employer', `Employer ${newCompany.name} registered.`);
      return user;
    }

    throw new Error('Registration failed: invalid role');
  },
};
