import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size: number;
  strokeWidth: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ percentage, size, strokeWidth }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90 transition-all duration-500 ease-in-out">
      {/* Background Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#e5e7eb" // gray-200
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      {/* Progress Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#2563eb" // blue-600
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeLinecap="round"
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: offset,
          transition: 'stroke-dashoffset 0.5s ease-out'
        }}
      />
    </svg>
  );
};