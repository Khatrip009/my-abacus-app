// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Authenticated Pages
import StudentDashboard from './pages/StudentDashboard';
import Worksheets from './pages/Worksheets';
import Results from './pages/Results';
import Fees from './pages/Fees';
import Profile from './pages/Profile';

// Legacy worksheet routes (optional – kept for compatibility)
import OneDigitWorksheet from './pages/OneDigitWorksheet';
import OneDigitNoFormulaWorksheet from './pages/OneDigitNoFormulaWorksheet';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes with Main Layout (Header + Footer) */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/results" element={<Results />} /> {/* Public results view if needed */}
          </Route>

          {/* Auth Route (no header/footer) */}
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

          {/* Redirect root to home */}
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* Catch all – redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;