import React from 'react';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HomeIcon from '@mui/icons-material/Home';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();
  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4 relative overflow-hidden font-inter">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-100 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-pink-100 rounded-full blur-2xl"></div>
      </div>

      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 border-2 border-blue-200 rotate-45 animate-bounce opacity-60"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">

        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-8xl md:text-9xl font-black text-gray-800 leading-none tracking-tight">
            4<span className="text-blue-500">0</span>4
          </h1>
          <div className="absolute inset-0 text-8xl md:text-9xl font-black text-gray-200 blur-sm -z-10">
            404
          </div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-md mx-auto">
            Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        {/* Icons below */}
        <div className="flex justify-center gap-8 mb-12 text-gray-500">
          <div className="flex flex-col items-center">
            <SearchOffIcon className="text-2xl mb-2 text-blue-400" />
            <span className="text-sm">Not Found</span>
          </div>
          <div className="flex flex-col items-center">
            <VerifiedUserIcon className="text-2xl mb-2 text-green-400" />
            <span className="text-sm">Secure</span>
          </div>
          <div className="flex flex-col items-center">
            <SupportAgentIcon className="text-2xl mb-2 text-purple-400" />
            <span className="text-sm">Help Available</span>
          </div>
        </div>

        {/* Go Home Button */}
        <button
          onClick={handleGoHome}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl text-lg transition-all duration-300 hover:bg-blue-700 hover:scale-105 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          <HomeIcon className="text-xl group-hover:animate-pulse" />
          <span>Go to Home</span>
          <ArrowForwardIcon className="text-xl group-hover:translate-x-1 transition-transform" />
          <div className="absolute inset-0 bg-blue-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-100/50 to-transparent pointer-events-none"></div>

      <style jsx>{`
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
