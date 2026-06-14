import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from '../utils/constants';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import CandidateLayout from '../layouts/CandidateLayout';
import EmployerLayout from '../layouts/EmployerLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Candidate pages
import CandidateDashboard from '../pages/candidate/CandidateDashboard';
import CandidateProfile from '../pages/candidate/CandidateProfile';
import RecommendedInternships from '../pages/candidate/RecommendedInternships';
import InternshipDetails from '../pages/candidate/InternshipDetails';
import ApplicationStatus from '../pages/candidate/ApplicationStatus';

// Employer pages
import EmployerDashboard from '../pages/employer/EmployerDashboard';
import CreateInternship from '../pages/employer/CreateInternship';
import CandidateShortlist from '../pages/employer/CandidateShortlist';
import EmployerApplications from '../pages/employer/EmployerApplications';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AllocationAnalytics from '../pages/admin/AllocationAnalytics';
import FairnessDashboard from '../pages/admin/FairnessDashboard';
import CapacityUtilization from '../pages/admin/CapacityUtilization';
import AuditLogs from '../pages/admin/AuditLogs';
import PolicySettings from '../pages/admin/PolicySettings';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Candidate Routes */}
      <Route
        path="/candidate"
        element={
          <ProtectedRoute allowedRole={ROLES.CANDIDATE}>
            <CandidateLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CandidateDashboard />} />
        <Route path="profile" element={<CandidateProfile />} />
        <Route path="recommendations" element={<RecommendedInternships />} />
        <Route path="internship/:id" element={<InternshipDetails />} />
        <Route path="applications" element={<ApplicationStatus />} />
      </Route>

      {/* Employer Routes */}
      <Route
        path="/employer"
        element={
          <ProtectedRoute allowedRole={ROLES.EMPLOYER}>
            <EmployerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<EmployerDashboard />} />
        <Route path="create-internship" element={<CreateInternship />} />
        <Route path="shortlist" element={<CandidateShortlist />} />
        <Route path="applications" element={<EmployerApplications />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole={ROLES.ADMIN}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="allocation" element={<AllocationAnalytics />} />
        <Route path="fairness" element={<FairnessDashboard />} />
        <Route path="capacity" element={<CapacityUtilization />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="policy-settings" element={<PolicySettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
