import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PendingApproval from './pages/PendingApproval';
import Profile from './pages/Profile';
import HackathonList from './pages/HackathonList';
import HackathonDetail from './pages/HackathonDetail';
import TeamPage from './pages/TeamPage';
import SubmissionPage from './pages/SubmissionPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminDashboard from './pages/AdminDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import ParticipantDashboard from './pages/ParticipantDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import NotFound from './pages/NotFound';

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Paths that explicitly use Top Navbar (auth & public landing)
  const authPaths = ['/login', '/signup', '/pending-approval'];

  // When authenticated, show Sidebar on Explore & all app pages (except login/signup)
  const showSidebar = isAuthenticated && !authPaths.includes(location.pathname);
  const showNavbar = !showSidebar;

  return (
    <div className="min-h-screen flex flex-col bg-[#030303] text-[#e5e2e1]">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0D0D12',
            color: '#F5F5F7',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />

      {/* Top Navbar: Shown when logged out or on auth pages */}
      {showNavbar && <Navbar />}

      <div className="flex flex-1 relative">
        {/* Left Sidebar: Shown when logged in on Explore & Dashboard pages */}
        {showSidebar && <Sidebar />}

        <main className={`flex-1 w-full ${showSidebar ? 'lg:pl-64' : ''}`}>


          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/hackathons" element={<HackathonList />} />
            <Route path="/hackathons/:id" element={<HackathonDetail />} />
            <Route path="/hackathons/:id/leaderboard" element={<LeaderboardPage />} />

            {/* Protected Common Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Participant Routes */}
            <Route element={<ProtectedRoute allowedRoles={['participant']} />}>
              <Route path="/participant/dashboard" element={<ParticipantDashboard />} />
              <Route path="/teams/:hackathonId" element={<TeamPage />} />
              <Route path="/hackathons/:id/submit" element={<SubmissionPage />} />
            </Route>

            {/* Organizer Routes (Require Admin Approval) */}
            <Route element={<ProtectedRoute allowedRoles={['organizer', 'admin']} requireApprovedStatus />}>
              <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
            </Route>

            {/* Judge Routes (Require Admin Approval) */}
            <Route element={<ProtectedRoute allowedRoles={['judge', 'admin']} requireApprovedStatus />}>
              <Route path="/judge/dashboard" element={<JudgeDashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      <div className={showSidebar ? 'lg:pl-64' : ''}>
        <Footer />
      </div>
    </div>
  );
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

