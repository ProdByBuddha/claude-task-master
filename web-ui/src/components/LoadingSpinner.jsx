import React from 'react';

export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4"
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div className="flex justify-center items-center p-4">
      <div
        className={`${sizeClass} ${className} rounded-full border-blue-600 border-solid border-t-transparent animate-spin`}
        role="status"
        aria-label="Loading"
      ></div>
    </div>
  );
} 