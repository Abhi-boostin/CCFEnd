import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'orange' | 'white' | 'gray';
}

export default function LoadingSpinner({ size = 'md', color = 'orange' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    orange: 'border-orange-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent'
  };

  return (
    <div className="flex justify-center items-center min-h-32">
      <div className={`animate-spin rounded-full border-2 ${sizeClasses[size]} ${colorClasses[color]}`}></div>
    </div>
  );
}