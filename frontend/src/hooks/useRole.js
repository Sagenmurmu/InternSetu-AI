import { useAuth } from './useAuth';
import { ROLES } from '../utils/constants';

export function useRole() {
  const { user } = useAuth();

  const isCandidate = user?.role === ROLES.CANDIDATE;
  const isEmployer = user?.role === ROLES.EMPLOYER;
  const isAdmin = user?.role === ROLES.ADMIN;

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case ROLES.CANDIDATE:
        return '/candidate/dashboard';
      case ROLES.EMPLOYER:
        return '/employer/dashboard';
      case ROLES.ADMIN:
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return { role: user?.role, isCandidate, isEmployer, isAdmin, getDashboardPath };
}
