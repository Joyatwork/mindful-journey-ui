
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  unit: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, unit, change, trend, icon, color }: StatCardProps) => {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trend === 'up' ? 'text-green-500' : 'text-red-500';
  
  return (
    <Card className="glass-card border-0 shadow-lg">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg bg-opacity-20 ${color.replace('text-', 'bg-')}`}>
            {React.cloneElement(icon as React.ReactElement, { className: `h-4 w-4 ${color}` })}
          </div>
          <div className={`flex items-center space-x-1 ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            <span className="text-xs font-medium">{change}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{title}</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
