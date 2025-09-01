import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderSuccess = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const t = setTimeout(() => navigate('/profile/orders'), 3000);
    return () => clearTimeout(t);
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4 md:p-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-10 text-center max-w-md w-full border border-white/20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-10 animate-pulse delay-1000"></div>
        
        <div className="relative z-10">
          {/* Success Icon */}
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <svg className="w-10 h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Order Placed Successfully!
          </h2>
          
          <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed">
            Thank you for your purchase! We're processing your order and will notify you once it's shipped.
          </p>
          
          {/* Progress indicator */}
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse delay-400"></div>
          </div>
          
          <p className="text-xs md:text-sm text-gray-500 bg-gray-50 rounded-lg p-3 border-l-4 border-blue-400">
            <span className="inline-block w-4 h-4 mr-2">⏰</span>
            Redirecting to your orders in a few seconds...
          </p>
          
          {/* Quick action button */}
          <button 
            onClick={() => navigate('/profile/orders')}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            View Orders Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;