import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Resume Builder
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/builder"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/builder') 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Builder
            </Link>
            <Link
              to="/preview"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/preview') 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Preview
            </Link>
            <Link
              to="/templates"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/templates') 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Templates
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
