
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Navbar from './components/Navbar';
import { ToastProvider } from './components/ToastProvider';
import { useState, useMemo } from 'react';
import Home from './pages/Home';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumePreview from './pages/ResumePreview';

import TemplateSelection from './pages/TemplateSelection';
import DragDropTest from './components/DragDropTest';
import Signup from './components/Signup';
import Login from './components/Login';
import PasswordReset from './components/PasswordReset';
import CoverLetter from './pages/CoverLetter';

function App() {
  const [highContrast, setHighContrast] = useState(false);
  const themeClass = useMemo(() => (highContrast ? 'hc' : ''), [highContrast]);
  return (
    
      <Router>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-3 py-2 rounded">
          Skip to main content
        </a>
        <ToastProvider>
          <div className={`min-h-screen ${highContrast ? 'bg-white' : 'bg-gray-50'}`} data-theme={themeClass}>
            <Navbar />
            <div className="sr-only" aria-live="polite">{highContrast ? 'High contrast enabled' : 'High contrast disabled'}</div>
            <div className="fixed bottom-4 left-4 z-40 no-print">
              <label className="inline-flex items-center space-x-2 bg-white border border-gray-300 rounded px-3 py-2 shadow-sm">
                <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} />
                <span className="text-sm text-gray-700">High contrast</span>
              </label>
            </div>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/builder" element={
              <ProtectedRoute>
                <main id="main">
                  <ResumeBuilder />
                </main>
              </ProtectedRoute>
            } />
            <Route path="/preview" element={
              <ProtectedRoute>
                <main id="main">
                  <ResumePreview />
                </main>
              </ProtectedRoute>
            } />
            <Route path="/templates" element={<main id="main"><TemplateSelection /></main>} />
            <Route path="/test-dnd" element={<main id="main"><DragDropTest /></main>} />
            <Route path="/signup" element={
              <PublicRoute>
                <main id="main">
                  <Signup />
                </main>
              </PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <main id="main">
                  <Login />
                </main>
              </PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute>
                <main id="main">
                  <PasswordReset />
                </main>
              </PublicRoute>
            } />
            <Route path="/cover-letter" element={
              <ProtectedRoute>
                <main id="main">
                  <CoverLetter />
                </main>
              </ProtectedRoute>
            } />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </ToastProvider>
      </Router>
    
  );
}

export default App;
