import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';
import axios from 'axios';

// Auth context
import { AuthProvider } from './contexts/AuthContext';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Auth components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Page components
import HomePage from './pages/HomePage';
import PoliticiansPage from './pages/PoliticiansPage';
import PoliticianDetailPage from './pages/PoliticianDetailPage';
import PoliticianFormPage from './pages/PoliticianFormPage';
import StatementsPage from './pages/StatementsPage';
import StatementDetailPage from './pages/StatementDetailPage';
import ScoresPage from './pages/ScoresPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';
import SubmitEvidencePage from './pages/SubmitEvidencePage';
import ModerationQueuePage from './pages/ModerationQueuePage';

// Analytics pages
import DashboardPage from './pages/analytics/DashboardPage';
import NetworkAnalysisPage from './pages/analytics/NetworkAnalysisPage';
import PredictiveAnalyticsPage from './pages/analytics/PredictiveAnalyticsPage';
import DistrictPage from './pages/DistrictPage';

// These components will be implemented later
const StatementFormPage = () => <div>Statement Form Page (Coming Soon)</div>;
const ScoreFormPage = () => <div>Score Form Page (Coming Soon)</div>;

// Set up axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/politicians" element={<PoliticiansPage />} />
                <Route path="/politicians/:id" element={<PoliticianDetailPage />} />
                <Route path="/statements" element={<StatementsPage />} />
                <Route path="/statements/:id" element={<StatementDetailPage />} />
                <Route path="/submit-evidence" element={<SubmitEvidencePage />} />
                <Route path="/scores" element={<ScoresPage />} />
                <Route path="/analytics/dashboard" element={<DashboardPage />} />
                <Route path="/analytics/network" element={<NetworkAnalysisPage />} />
                <Route path="/districts/:stateCode/:districtNumber" element={<DistrictPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                
                {/* Protected routes - require authentication */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
                
                {/* Admin routes - require admin role */}
                <Route element={<ProtectedRoute requiredRole="admin" />}>
                  <Route path="/politicians/add" element={<PoliticianFormPage />} />
                  <Route path="/politicians/:id/edit" element={<PoliticianFormPage />} />
                </Route>
                
                {/* Researcher routes - require researcher or admin role */}
                <Route element={<ProtectedRoute requiredRole={['researcher', 'admin']} />}>
                  <Route path="/politicians/:id/statements/add" element={<StatementFormPage />} />
                  <Route path="/politicians/:id/scores/add" element={<ScoreFormPage />} />
                  <Route path="/moderation-queue" element={<ModerationQueuePage />} />
                  <Route path="/analytics/predictive" element={<PredictiveAnalyticsPage />} />
                </Route>
                
                {/* 404 route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
