import React from 'react';

interface HealthGaugeProps {
  score: number; // 0 - 100
  size?: number;
}

export const HealthGauge: React.FC<HealthGaugeProps> = ({ score, size = 160 }) => {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let colorClass = '#33C481'; // Green
  if (normalizedScore < 50) colorClass = '#EF5A5A'; // Red
  else if (normalizedScore < 75) colorClass = '#E8A63C'; // Amber

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border-subtle)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Filled Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorClass}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tracking-tight" style={{ color: colorClass }}>
          {normalizedScore}
        </span>
        <span className="text-[11px] uppercase tracking-wider font-semibold text-text-tertiary">
          Health Score
        </span>
      </div>
    </div>
  );
};

export default HealthGauge;
