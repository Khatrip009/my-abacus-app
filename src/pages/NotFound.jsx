// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6F2] to-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-black text-[#E2592D] opacity-20 mb-4">404</div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-2">
            Page Not Found
          </h1>
          <p className="text-[#555555] text-lg">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E2592D] text-white font-bold rounded-xl hover:bg-[#C94E26] transition shadow-md"
          >
            <Home size={18} />
            Back to Home
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#E2592D] text-[#E2592D] font-bold rounded-xl hover:bg-[#FDE3DA] transition"
          >
            <ArrowLeft size={18} />
            Go to Dashboard
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-sm text-[#BFC8C6] mt-8">
          If you think this is a mistake, please{' '}
          <Link to="/contact" className="text-[#E2592D] hover:underline font-medium">
            contact support
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default NotFound;