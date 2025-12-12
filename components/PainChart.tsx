import React from 'react';

interface PainChartProps {
  logs: { date: string, score: number }[];
  title: string;
}

export const PainChart: React.FC<PainChartProps> = ({ logs, title }) => {
  if (logs.length === 0) return null;

  // Constants
  const height = 120;
  const width = 300;
  const padding = 20;
  const maxScore = 10;

  // Calculate coordinates
  const getX = (index: number) => {
    return padding + (index * (width - 2 * padding) / (logs.length - 1));
  };

  const getY = (score: number) => {
    return height - padding - (score / maxScore) * (height - 2 * padding);
  };

  // Generate path for the line
  const pathData = logs.map((log, index) => {
    return `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(log.score)}`;
  }).join(' ');

  // Generate fill area (gradient under line)
  const areaPath = `
    ${pathData} 
    L ${getX(logs.length - 1)} ${height - padding} 
    L ${getX(0)} ${height - padding} 
    Z
  `;

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in mt-4 transition-colors duration-300">
      <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-4">{title}</h3>
      <div className="w-full overflow-hidden">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            {/* Gradients */}
            <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 5, 10].map((val) => (
                <line 
                    key={val}
                    x1={padding} 
                    y1={getY(val)} 
                    x2={width - padding} 
                    y2={getY(val)} 
                    className="stroke-gray-200 dark:stroke-gray-700"
                    strokeDasharray="4"
                    strokeWidth="1"
                />
            ))}

            {/* Area Fill */}
            <path d={areaPath} fill="url(#chartGradient)" />

            {/* Line */}
            <path 
                d={pathData} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />

            {/* Points */}
            {logs.map((log, index) => (
                <g key={index}>
                    <circle 
                        cx={getX(index)} 
                        cy={getY(log.score)} 
                        r="4" 
                        className="fill-white dark:fill-gray-800 stroke-blue-600 dark:stroke-blue-500"
                        strokeWidth="2" 
                    />
                    {/* X Axis Labels */}
                    <text 
                        x={getX(index)} 
                        y={height} 
                        textAnchor="middle" 
                        fontSize="10" 
                        className="fill-gray-400 dark:fill-gray-500"
                    >
                        {log.date}
                    </text>
                </g>
            ))}
        </svg>
      </div>
    </div>
  );
};