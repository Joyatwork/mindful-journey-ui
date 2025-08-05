
import React from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ProgressData {
  date: string;
  mood: number;
  stress: number;
  energy: number;
  sleep: number;
}

interface ProgressChartProps {
  data: ProgressData[];
  title: string;
  metric: 'mood' | 'stress' | 'energy' | 'sleep';
}

const ProgressChart = ({ data, title, metric }: ProgressChartProps) => {
  const metricColors = {
    mood: '#10b981',
    stress: '#ef4444', 
    energy: '#f59e0b',
    sleep: '#8b5cf6'
  };

  const metricGradients = {
    mood: 'bg-wellness-gradient',
    stress: 'bg-gradient-to-r from-red-400 to-orange-400',
    energy: 'bg-gradient-to-r from-yellow-400 to-orange-400', 
    sleep: 'bg-gradient-to-r from-purple-400 to-pink-400'
  };

  return (
    <Card className="p-6 glass-card border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className={`w-3 h-3 rounded-full ${metricGradients[metric]}`} />
      </div>
      
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metricColors[metric]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={metricColors[metric]} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              fontSize={10}
              tick={{ fill: '#6B7280' }}
            />
            <YAxis hide domain={[0, 5]} />
            <Area
              type="monotone"
              dataKey={metric}
              stroke={metricColors[metric]}
              strokeWidth={2}
              fill={`url(#gradient-${metric})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Derniers 7 jours</span>
        <span className="font-medium text-primary">
          {data[data.length - 1]?.[metric] || 0}/5
        </span>
      </div>
    </Card>
  );
};

export default ProgressChart;
