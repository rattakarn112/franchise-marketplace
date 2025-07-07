'use client'

import React from 'react';

const FranchiseHubLogo = ({ 
  size = 'normal', 
  variant = 'default', 
  className = '',
  onClick = null 
}) => {
  const sizeClasses = {
    small: {
      icon: 'w-6 h-6',
      text: 'text-lg',
      container: 'gap-2'
    },
    normal: {
      icon: 'w-8 h-8', 
      text: 'text-2xl',
      container: 'gap-2'
    },
    large: {
      icon: 'w-12 h-12',
      text: 'text-4xl',
      container: 'gap-3'
    }
  };

  const colorClasses = {
    default: {
      icon: 'text-red-500',
      text: 'text-gray-800'
    },
    white: {
      icon: 'text-white',
      text: 'text-white'
    }
  };

  return (
    <div 
      className={`flex items-center ${sizeClasses[size].container} ${className} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      {/* Store Icon */}
      <div className={`${sizeClasses[size].icon} ${colorClasses[variant].icon} flex-shrink-0`}>
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-full h-full"
        >
          <path d="M4 7V6C4 4.9 4.9 4 6 4H18C19.1 4 20 4.9 20 6V7H4Z" />
          <path d="M3 7H21C21.6 7 22 7.4 22 8V9C22 9.6 21.6 10 21 10H20V19C20 19.6 19.6 20 19 20H5C4.4 20 4 19.6 4 19V10H3C2.4 10 2 9.6 2 9V8C2 7.4 2.4 7 3 7Z" />
          <rect x="6" y="7" width="2" height="3" fill="white" opacity="0.3" />
          <rect x="10" y="7" width="2" height="3" fill="white" opacity="0.3" />
          <rect x="14" y="7" width="2" height="3" fill="white" opacity="0.3" />
          <rect x="18" y="7" width="2" height="3" fill="white" opacity="0.3" />
          <rect x="10" y="14" width="4" height="6" fill="white" opacity="0.7" />
          <circle cx="12.5" cy="17" r="0.5" fill="currentColor" />
        </svg>
      </div>
      
      {/* Brand Name */}
      <div className={`${sizeClasses[size].text} ${colorClasses[variant].text} font-bold`}>
        franchisehub
      </div>
    </div>
  );
};

export default FranchiseHubLogo;