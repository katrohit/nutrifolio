
import React from 'react';
import { cn } from '@/lib/utils';

interface CalorieRingProps {
  consumed: number;
  goal: number;
  size?: 'sm' | 'md' | 'lg';
  showRemaining?: boolean;
}

const CalorieRing: React.FC<CalorieRingProps> = ({
  consumed,
  goal,
  size = 'md',
  showRemaining = true
}) => {
  // Calculate percentage and clamp it to max 100%
  const percentage = Math.min(100, Math.round((consumed / goal) * 100)) || 0;
  const remaining = goal - consumed;
  
  // Calculate size and stroke width based on size prop
  let dimensions = 120;
  let strokeWidth = 8;
  let fontSize = 'text-lg';
  let labelSize = 'text-xs';
  
  if (size === 'sm') {
    dimensions = 80;
    strokeWidth = 6;
    fontSize = 'text-sm';
    labelSize = 'text-xs';
  } else if (size === 'lg') {
    dimensions = 180;
    strokeWidth = 10;
    fontSize = 'text-3xl';
    labelSize = 'text-sm';
  }
  
  // Calculate circle properties
  const radius = (dimensions / 2) - (strokeWidth / 2);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative"
        style={{ 
          width: dimensions, 
          height: dimensions 
        }}
      >
        {/* Background circle */}
        <svg
          className="absolute inset-0"
          width={dimensions}
          height={dimensions}
          viewBox={`0 0 ${dimensions} ${dimensions}`}
        >
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            className="text-muted"
          />
        </svg>
        
        {/* Progress circle */}
        <svg
          className="absolute inset-0 -rotate-90 transform"
          width={dimensions}
          height={dimensions}
          viewBox={`0 0 ${dimensions} ${dimensions}`}
        >
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
            className={cn(
              "transition-all duration-500 ease-out",
              percentage < 85 ? "text-nutrifolio-primary" : "text-nutrifolio-secondary"
            )}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-medium", fontSize)}>
            {consumed}
          </span>
          <span className={cn("text-muted-foreground", labelSize)}>
            {showRemaining ? `${remaining} left` : 'calories'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CalorieRing;
