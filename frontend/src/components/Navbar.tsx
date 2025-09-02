import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useResumeManagerStore } from '../store/resumeManagerStore';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { resumes, activeResumeId, setActiveResume } = useResumeManagerStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200" role="navigation" aria-label="Primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center" aria-label="Go to home">
              <img src="/logo.svg" alt="Forward Resume Builder" className="w-8 h-8" />
              <span className="ml-2 text-xl font-bold text-gray-900">Forward Resume Builder</span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-current={isActive('/') ? 'page' : undefined}
              >
                Home
              </Link>
              <Link
                to="/templates"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/templates')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-current={isActive('/templates') ? 'page' : undefined}
              >
                Templates
              </Link>
              {isAuthenticated && (
                <>
                  {/* Quick resume switcher */}
                  {resumes.length > 0 && (
                    <div className="relative">
                      <label htmlFor="resume-switcher" className="sr-only">Active resume</label>
                      <select
                        id="resume-switcher"
                        value={activeResumeId ?? ''}
                        onChange={(e) => setActiveResume(e.target.value)}
                        className="px-3 py-2 rounded-md text-sm border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Switch active resume"
                      >
                        {resumes.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <Link
                    to="/builder"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/builder')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    aria-current={isActive('/builder') ? 'page' : undefined}
                  >
                    Builder
                  </Link>
                  <Link
                    to="/preview"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/preview')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    aria-current={isActive('/preview') ? 'page' : undefined}
                  >
                    Preview
                  </Link>
                  <Link
                    to="/jobs"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/jobs')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    aria-current={isActive('/jobs') ? 'page' : undefined}
                  >
                    Job Search
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* User Menu / Auth Links */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-700">
                      Welcome, {user?.first_name || user?.email}
                    </span>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="bg-gray-100 flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-2"
                      aria-haspopup="menu"
                      aria-expanded={showUserMenu}
                      aria-controls="user-menu"
                    >
                      <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {getInitials(user?.first_name, user?.last_name)}
                      </span>
                    </button>
                  </div>

                  {showUserMenu && (
                    <div id="user-menu" role="menu" aria-label="User menu" className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-xs text-gray-500 border-b">
                          {user?.email}
                        </div>
                        <button
                          onClick={() => setShowUserMenu(false)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => setShowUserMenu(false)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Toggle navigation menu"
              aria-expanded={showMobileMenu}
              aria-controls="mobile-menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div id="mobile-menu" className="md:hidden" role="menu" aria-label="Mobile">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-current={isActive('/') ? 'page' : undefined}
            >
              Home
            </Link>
            <Link
              to="/templates"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/templates')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-current={isActive('/templates') ? 'page' : undefined}
            >
              Templates
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/builder"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/builder')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Builder
                </Link>
                <Link
                  to="/preview"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/preview')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Preview
                </Link>
                <Link
                  to="/jobs"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/jobs')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Job Search
                </Link>
                <div className="border-t pt-4 pb-3">
                  <div className="flex items-center px-5">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {getInitials(user?.first_name, user?.last_name)}
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {user?.first_name} {user?.last_name}
                      </div>
                      <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 px-2 space-y-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="border-t pt-4 pb-3">
                <div className="px-2 space-y-1">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
