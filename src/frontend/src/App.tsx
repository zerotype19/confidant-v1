import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import SessionGuard from './components/SessionGuard'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import OnboardingWelcome from './components/onboarding/OnboardingWelcome'
import ParentSetupForm from './components/onboarding/ParentSetupForm'
import ChildProfileForm from './components/onboarding/ChildProfileForm'
import { Toaster } from '@/components/ui/toaster'

export default function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout><Outlet /></Layout>}>
            <Route index element={<Home />} />
            <Route path="signin" element={<SignIn />} />
            <Route path="signup" element={<SignUp />} />
          </Route>

          {/* Protected routes */}
          <Route path="/" element={
            <SessionGuard>
              <Layout>
                <Outlet />
              </Layout>
            </SessionGuard>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Onboarding routes */}
          <Route path="/onboarding">
            <Route path="welcome" element={
              <SessionGuard>
                <OnboardingWelcome />
              </SessionGuard>
            } />
            <Route path="parent-setup" element={
              <SessionGuard>
                <ParentSetupForm />
              </SessionGuard>
            } />
            <Route path="child-profile" element={
              <SessionGuard>
                <ChildProfileForm />
              </SessionGuard>
            } />
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  )
} 