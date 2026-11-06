import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './auth-context';
import {
  useGetProfileByIdQuery,
  useHasPlanByProfileQuery,
} from '../services/api';
import { skipToken } from '@reduxjs/toolkit/query';

export default function ProtectedRoute() {
  const { session, isLoading } = useAuth();
  const { pathname } = useLocation();

  
  const {
    currentData: profile,
    isLoading: isLoadingProfile,
    error,
  } = useGetProfileByIdQuery(session?.user.id ?? skipToken);

  const { currentData: hasPlan, isLoading: isLoadingPlan } =
    useHasPlanByProfileQuery(session?.user.id ?? skipToken);

  if (isLoading || isLoadingProfile || isLoadingPlan) {
    return <p role="status">Loading...</p>;
  }

  if (error) {
    return <p role="status">Something went wrong, try to reload the window</p>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!profile && pathname !== '/setup/profile') {
    return <Navigate to="/setup/profile" replace />;
  } else if (profile && !hasPlan && pathname !== '/setup/plan') {
    return <Navigate to="/setup/plan" replace />;
  } else if (profile && hasPlan && pathname.startsWith('/setup')) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
