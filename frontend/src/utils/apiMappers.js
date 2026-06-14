/**
 * API Mappers for converting between backend snake_case and frontend camelCase data formats.
 */

// Helper to safely parse JSON strings to arrays/objects
const safeParseJson = (data, fallback = []) => {
  if (!data) return fallback;
  if (Array.isArray(data) || typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    return fallback;
  }
};

// Helper to safely serialize arrays/objects to JSON strings
const safeStringify = (data) => {
  if (typeof data === 'string') return data;
  try {
    return JSON.stringify(data);
  } catch (e) {
    return '[]';
  }
};

// Candidate Mapper
export const mapCandidateFromApi = (apiCand) => {
  if (!apiCand) return null;
  return {
    id: apiCand.id,
    userId: apiCand.user_id,
    age: apiCand.age || 21,
    gender: apiCand.gender || 'Female',
    category: apiCand.category || 'General',
    ruralOrUrban: apiCand.rural_or_urban || 'Urban',
    district: apiCand.district || '',
    state: apiCand.state || '',
    qualification: apiCand.qualification || 'B.Tech / B.E.',
    course: apiCand.course || '',
    college: apiCand.college || '',
    skills: safeParseJson(apiCand.skills, []),
    sectorInterest: apiCand.sector_interest || '',
    locationPreference: apiCand.location_preference || '',
    willingToRelocate: apiCand.willing_to_relocate !== undefined ? apiCand.willing_to_relocate : true,
    pastParticipation: apiCand.past_participation !== undefined ? apiCand.past_participation : false,
    profileCompletion: apiCand.profile_completion || 0,
    createdAt: apiCand.created_at,
    updatedAt: apiCand.updated_at,
  };
};

export const mapCandidateToApi = (feCand) => {
  if (!feCand) return null;
  return {
    age: feCand.age ? Number(feCand.age) : null,
    gender: feCand.gender,
    category: feCand.category,
    rural_or_urban: feCand.ruralOrUrban,
    district: feCand.district,
    state: feCand.state,
    qualification: feCand.qualification,
    course: feCand.course,
    college: feCand.college,
    skills: feCand.skills, // service/repository handles json serialization
    sector_interest: feCand.sectorInterest,
    location_preference: feCand.locationPreference,
    willing_to_relocate: feCand.willingToRelocate,
    past_participation: feCand.pastParticipation,
  };
};

// Company / Employer Mapper
export const mapCompanyFromApi = (apiComp) => {
  if (!apiComp) return null;
  const companyName = apiComp.company_name || 'Unknown Company';
  return {
    id: apiComp.id,
    userId: apiComp.user_id,
    name: companyName,
    sector: apiComp.sector || '',
    description: apiComp.description || '',
    district: apiComp.district || '',
    state: apiComp.state || '',
    location: apiComp.district || '', // mapping district as location for frontend UI compatibility
    address: apiComp.address || '',
    contactPerson: apiComp.contact_person || '',
    totalCapacity: apiComp.total_capacity || 0,
    website: `https://${companyName.toLowerCase().replace(/\s+/g, '')}.example.com`,
    logo: null,
  };
};

export const mapCompanyToApi = (feComp) => {
  if (!feComp) return null;
  return {
    company_name: feComp.name,
    sector: feComp.sector,
    description: feComp.description,
    district: feComp.district || feComp.location,
    state: feComp.state,
    address: feComp.address || '',
    contact_person: feComp.contactPerson || '',
    total_capacity: feComp.totalCapacity ? Number(feComp.totalCapacity) : 0,
  };
};

// Internship Mapper
export const mapInternshipFromApi = (apiInt) => {
  if (!apiInt) return null;
  return {
    id: apiInt.id,
    companyId: apiInt.company_id,
    companyName: apiInt.company_name || 'TechNova Solutions', // fallback or joined name
    title: apiInt.title,
    description: apiInt.description,
    sector: apiInt.sector,
    requiredSkills: safeParseJson(apiInt.required_skills, []),
    requiredQualification: apiInt.required_qualification,
    location: apiInt.location || apiInt.district || '',
    district: apiInt.district || '',
    state: apiInt.state || '',
    duration: apiInt.duration || '3 Months',
    stipend: apiInt.stipend || 0,
    capacity: apiInt.capacity || 5,
    selectedCount: apiInt.selected_count || 0,
    mode: apiInt.mode || 'Remote',
    isActive: apiInt.is_active !== undefined ? apiInt.is_active : true,
    createdAt: apiInt.created_at,
    updatedAt: apiInt.updated_at,
  };
};

export const mapInternshipToApi = (feInt) => {
  if (!feInt) return null;
  return {
    title: feInt.title,
    description: feInt.description,
    sector: feInt.sector,
    required_skills: feInt.requiredSkills, // service/repository serialization
    required_qualification: feInt.requiredQualification,
    location: feInt.location,
    district: feInt.district || feInt.location,
    state: feInt.state,
    duration: feInt.duration,
    stipend: feInt.stipend ? Number(feInt.stipend) : 0.0,
    capacity: feInt.capacity ? Number(feInt.capacity) : 1,
    mode: feInt.mode || 'Remote',
    is_active: feInt.isActive !== undefined ? feInt.isActive : true,
  };
};

// Application Mapper
export const mapApplicationFromApi = (apiApp) => {
  if (!apiApp) return null;
  return {
    id: apiApp.id,
    candidateId: apiApp.candidate_id,
    candidateName: apiApp.candidate_name || '',
    internshipId: apiApp.internship_id,
    internshipTitle: apiApp.internship_title || '',
    companyName: apiApp.company_name || '',
    status: apiApp.status || 'applied',
    decisionReason: apiApp.decision_reason || '',
    appliedAt: apiApp.applied_at,
    updatedAt: apiApp.updated_at,
    matchScore: apiApp.match_score || 75, // default fallback
  };
};

// Recommendation / Match Result Mapper
export const mapRecommendationFromApi = (apiMatch) => {
  if (!apiMatch) return null;
  return {
    id: apiMatch.id,
    candidateId: apiMatch.candidate_id,
    internshipId: apiMatch.internship_id,
    skillScore: apiMatch.skill_score || 0,
    qualificationScore: apiMatch.qualification_score || 0,
    locationScore: apiMatch.location_score || 0,
    sectorScore: apiMatch.sector_score || 0,
    fairnessScore: apiMatch.fairness_score || 0,
    finalScore: apiMatch.final_score || 0,
    explanation: safeParseJson(apiMatch.explanation, []),
    createdAt: apiMatch.created_at,
  };
};

// Audit Log Mapper
export const mapAuditLogFromApi = (apiLog) => {
  if (!apiLog) return null;
  return {
    id: `LOG${apiLog.id}`,
    action: apiLog.action,
    userRole: apiLog.user_role || 'system',
    description: apiLog.description || '',
    timestamp: apiLog.timestamp,
  };
};
