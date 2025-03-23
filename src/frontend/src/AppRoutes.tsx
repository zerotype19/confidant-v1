import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Challenges } from './pages/Challenges';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import SessionGuard from './components/SessionGuard';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/auth/login" element={<Navigate to="/signin" replace />} />
      <Route path="/auth/register" element={<Navigate to="/signup" replace />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <SessionGuard>
          <Navigate to="/dashboard" replace />
        </SessionGuard>
      } />
      <Route path="/dashboard" element={
        <SessionGuard>
          <Dashboard />
        </SessionGuard>
      } />
      <Route path="/challenges" element={
        <SessionGuard>
          <Challenges />
        </SessionGuard>
      } />
    </Routes>
  );
} 