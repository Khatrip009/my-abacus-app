// src/App.jsx
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './layouts/Layout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Public Pages
import Home from './pages/home';
import About from './pages/About';
import Courses from './components/Courses';
import Contact from './pages/Contact';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Authenticated Pages
import StudentDashboard from './pages/StudentDashboard';
import Worksheets from './pages/Worksheets';
import Results from './pages/Results';
import Fees from './pages/Fees';
import Profile from './pages/Profile';

// Legacy worksheet routes
import OneDigitWorksheet from './pages/OneDigitWorksheet';
import OneDigitNoFormulaWorksheet from './pages/OneDigitNoFormulaWorksheet';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes with Main Layout (Header + Footer) */}
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/results" element={<Results />} />
          </Route>

          {/* Login Route – PublicRoute redirects to /dashboard if already logged in */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes with Dashboard Layout (Sidebar + Header) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/worksheets" element={<Worksheets />} />
              <Route path="/results" element={<Results />} />
              <Route path="/fees" element={<Fees />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/worksheets/1-digit" element={<OneDigitWorksheet />} />
              <Route path="/worksheets/1-digit-direct" element={<OneDigitNoFormulaWorksheet />} />
            </Route>
          </Route>

          {/* 404 Not Found Page */}
          <Route path="/404" element={<NotFound />} />

          {/* Root – redirect to /login (PublicRoute handles authenticated redirect) */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch all unknown routes – redirect to 404 */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;