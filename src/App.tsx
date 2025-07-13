import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import LoadingSpinner from './components/UI/LoadingSpinner';
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import SubscriptionsPage from './pages/Subscriptions/SubscriptionsPage';
import PlansPage from './pages/Subscriptions/PlansPage';
import FeedbackPage from './pages/Feedback/FeedbackPage';
import PaymentsPage from './pages/Payments/PaymentsPage';
import LeavesPage from './pages/Leaves/LeavesPage';
import ProfilePage from './pages/Profile/ProfilePage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import NotificationsPage from './pages/Notifications/NotificationsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { addNotification } = useNotification();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Enforce status-based protection
  if (user.status === 'unverified') {
    if (location.pathname !== '/register' && location.pathname !== '/login') {
      addNotification({
        type: 'warning',
        title: 'OTP Not Verified',
        message: 'Please complete OTP verification to activate your account.'
      });
      return <Navigate to="/register" replace state={{ from: location }} />;
    }
  } else if (user.status === 'registration_complete') {
    if (location.pathname !== '/profile') {
      addNotification({
        type: 'info',
        title: 'Profile Incomplete',
        message: 'Please complete your profile to continue.'
      });
      return <Navigate to="/profile" replace state={{ from: location }} />;
    }
  }

  // Only allow full access if profile is complete
  return <>{children}</>;
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {user?.user_type === 'mess_owner' ? <AdminDashboard /> : <DashboardPage />}
            </ProtectedRoute>
          } />
          <Route path="/subscriptions" element={
            <ProtectedRoute>
              <SubscriptionsPage />
            </ProtectedRoute>
          } />
          <Route path="/plans" element={
            <ProtectedRoute>
              <PlansPage />
            </ProtectedRoute>
          } />
          <Route path="/feedback" element={
            <ProtectedRoute>
              <FeedbackPage />
            </ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute>
              <PaymentsPage />
            </ProtectedRoute>
          } />
          <Route path="/leaves" element={
            <ProtectedRoute>
              <LeavesPage />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;