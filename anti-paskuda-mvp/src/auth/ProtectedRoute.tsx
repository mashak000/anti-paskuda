import { Navigate, Outlet } from 'react-router';
import { useAuth } from './auth-context';

export default function ProtectedRoute() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <p role="status">Checking your session…</p>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
