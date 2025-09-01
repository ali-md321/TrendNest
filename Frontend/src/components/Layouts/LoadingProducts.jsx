import React from 'react';

const LoadingProducts = () => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
      {/* Main loader with spinning circles */}
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute top-2 left-2 w-12 h-12 border-4 border-gray-100 border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        <div className="absolute top-4 left-4 w-8 h-8 border-4 border-gray-50 border-t-pink-400 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
      </div>

      {/* Animated text */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold text-gray-700 mb-2 animate-pulse">
          Loading Products
        </h3>
      </div>
    </div>
  );
};

export default LoadingProducts;