import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Challenges } from './pages/Challenges';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/challenges" element={<Challenges />} />
    </Routes>
  );
} 