import api, { isMockFallbackEnabled } from './api';
import { downloadFile } from '../utils/downloadFile';

export const exportService = {
  exportAdminCandidates: async () => {
    if (isMockFallbackEnabled()) {
      const csv = "ID,Name,Email,Age,Gender,Category,State,Qualification,Skills\nCAND1,Ananya Sharma,ananya@example.com,21,Female,General,Delhi,B.Tech / B.E.,\"React,Node.js,SQL\"";
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadFile(blob, 'admin_candidates_report.csv');
      return;
    }
    const response = await api.get('/exports/admin/candidates', { responseType: 'blob' });
    downloadFile(response.data, 'admin_candidates_report.csv');
  },

  exportAdminInternships: async () => {
    if (isMockFallbackEnabled()) {
      const csv = "ID,Company Name,Title,Sector,Stipend,Capacity,Selected Count,Location\nINT1,TechNova Solutions,Web Developer Intern,IT,15000,5,2,Bengaluru";
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadFile(blob, 'admin_internships_report.csv');
      return;
    }
    const response = await api.get('/exports/admin/internships', { responseType: 'blob' });
    downloadFile(response.data, 'admin_internships_report.csv');
  },

  exportAdminApplications: async () => {
    if (isMockFallbackEnabled()) {
      const csv = "Application ID,Candidate Name,Candidate Email,Internship Title,Company Name,Status,Applied At\nAPP1,Ananya Sharma,ananya@example.com,Web Developer Intern,TechNova Solutions,shortlisted,2026-06-12";
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadFile(blob, 'admin_applications_report.csv');
      return;
    }
    const response = await api.get('/exports/admin/applications', { responseType: 'blob' });
    downloadFile(response.data, 'admin_applications_report.csv');
  },

  exportAdminMatches: async () => {
    if (isMockFallbackEnabled()) {
      const csv = "Match ID,Candidate ID,Internship ID,Skill Score,Qualification Score,Location Score,Sector Score,Fairness Score,Final Score,Ranking Score,Explanation\nMATCH1,1,1,90,100,80,100,95,93,93,\"[Matching factors satisfied]\"";
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadFile(blob, 'admin_match_results_report.csv');
      return;
    }
    const response = await api.get('/exports/admin/matches', { responseType: 'blob' });
    downloadFile(response.data, 'admin_match_results_report.csv');
  },

  exportAdminCapacity: async () => {
    if (isMockFallbackEnabled()) {
      const csv = "Company ID,Company Name,Sector,Total Posted Internships,Total Capacity,Total Selected Candidates,Utilization Rate\nCOMP1,TechNova Solutions,IT,3,15,6,40.0%";
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadFile(blob, 'admin_capacity_utilization_report.csv');
      return;
    }
    const response = await api.get('/exports/admin/capacity', { responseType: 'blob' });
    downloadFile(response.data, 'admin_capacity_utilization_report.csv');
  },

  exportAdminFairness: async () => {
    if (isMockFallbackEnabled()) {
      const csv = "Metric Group,Subgroup,Total Applicants,Shortlisted,Selected,Rejection Rate,Selection Rate\nGender,Female,45,20,12,73.3%,26.7%\nGender,Male,60,25,14,76.7%,23.3%\nCategory,General,50,22,10,80.0%,20.0%\nCategory,OBC,30,12,8,73.3%,26.7%";
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadFile(blob, 'admin_fairness_report.csv');
      return;
    }
    const response = await api.get('/exports/admin/fairness', { responseType: 'blob' });
    downloadFile(response.data, 'admin_fairness_report.csv');
  },

  exportAdminAuditLogs: async () => {
    if (isMockFallbackEnabled()) {
      const csv = "Log ID,Action,User Role,Description,Timestamp\nLOG123,POLICY_UPDATE,admin,Admin updated matching policy weights,2026-06-14T10:00:00Z";
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadFile(blob, 'admin_audit_logs_report.csv');
      return;
    }
    const response = await api.get('/exports/admin/audit-logs', { responseType: 'blob' });
    downloadFile(response.data, 'admin_audit_logs_report.csv');
  },

  exportEmployerApplications: async () => {
    if (isMockFallbackEnabled()) {
      const csv = "Application ID,Candidate Name,Candidate Email,Internship Title,Status,Match Score,Applied At\nAPP1,Ananya Sharma,ananya@example.com,Web Developer Intern,shortlisted,93%,2026-06-12";
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadFile(blob, 'employer_applications_report.csv');
      return;
    }
    const response = await api.get('/exports/employer/applications', { responseType: 'blob' });
    downloadFile(response.data, 'employer_applications_report.csv');
  },

  exportEmployerSelectedCandidates: async () => {
    if (isMockFallbackEnabled()) {
      const csv = "Application ID,Candidate Name,Candidate Email,Internship Title,Selected At\nAPP12,Rohan Gupta,rohan@example.com,UI Designer,2026-06-13";
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadFile(blob, 'employer_selected_candidates.csv');
      return;
    }
    const response = await api.get('/exports/employer/selected-candidates', { responseType: 'blob' });
    downloadFile(response.data, 'employer_selected_candidates.csv');
  },

  exportCandidateApplications: async () => {
    if (isMockFallbackEnabled()) {
      const csv = "Application ID,Internship Title,Company Name,Status,Stipend,Applied At\nAPP1,Web Developer Intern,TechNova Solutions,shortlisted,15000,2026-06-12";
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadFile(blob, 'my_applications_report.csv');
      return;
    }
    const response = await api.get('/exports/candidate/applications', { responseType: 'blob' });
    downloadFile(response.data, 'my_applications_report.csv');
  }
};
