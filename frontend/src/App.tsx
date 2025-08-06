import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumePreview from './pages/ResumePreview';
import TemplatesPreview from './pages/TemplatesPreview';
import TemplateSelection from './pages/TemplateSelection';
import Signup from './components/Signup';
import Login from './components/Login';
import PasswordReset from './components/PasswordReset';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/builder" element={
              <ProtectedRoute>
                <ResumeBuilder />
              </ProtectedRoute>
            } />
            <Route path="/preview" element={
              <ProtectedRoute>
                <ResumePreview />
              </ProtectedRoute>
            } />
            <Route path="/templates" element={<TemplateSelection />} />
            <Route path="/signup" element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute>
                <PasswordReset />
              </PublicRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
