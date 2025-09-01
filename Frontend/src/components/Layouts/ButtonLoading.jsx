// src/components/Loading.jsx
import React from 'react';

const ButtonLoading = ({ text = "Loading..." }) => (
  <div className="w-full flex justify-center items-center py-2">
    <div className="flex items-center space-x-2">
      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span className="text-white">{text}</span>
    </div>
  </div>
);

export default ButtonLoading;
