
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface MacroProgressProps {
  label: string;
  current: number;
  target: number;
  color: string;
  unit?: string;
}

const MacroProgress = ({
  label,
  current,
  target,
  color,
  unit = 'g',
}: MacroProgressProps) => {
  // Calculate percentage, capped at 100%
  const percentage = Math.min(100, Math.round((current / target) * 100)) || 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {current.toFixed(1)}{unit} / {target}{unit}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-muted/50">
        <div 
          className={cn("h-full rounded-full transition-all", color)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default MacroProgress;
