
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumePreview from './pages/ResumePreview';

import TemplateSelection from './pages/TemplateSelection';
import DragDropTest from './components/DragDropTest';
import Signup from './components/Signup';
import Login from './components/Login';
import PasswordReset from './components/PasswordReset';

function App() {
  return (
    
      <Router>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-3 py-2 rounded">
          Skip to main content
        </a>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
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
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    
  );
}

export default App;
