import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaTasks, FaExclamationTriangle } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <FaExclamationTriangle className="text-yellow-500 text-6xl mb-6" />
      
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
      
      <p className="text-gray-600 max-w-md mb-8">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>
      
      <div className="flex gap-4">
        <Link to="/" className="btn btn-primary flex items-center">
          <FaHome className="mr-2" /> Go to Dashboard
        </Link>
        
        <Link to="/tasks" className="btn btn-secondary flex items-center">
          <FaTasks className="mr-2" /> Browse Tasks
        </Link>
      </div>
    </div>
  );
} 