
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
            <Route path="/test-dnd" element={<DragDropTest />} />
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
    
  );
}

export default App;
