
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeeklyData {
  day: string;
  activities: number;
  mood: number;
}

interface WeeklyHeatmapProps {
  data: WeeklyData[];
}

const WeeklyHeatmap = ({ data }: WeeklyHeatmapProps) => {
  const getIntensityColor = (activities: number) => {
    if (activities >= 4) return 'bg-wellness-gradient';
    if (activities >= 3) return 'bg-green-200';
    if (activities >= 2) return 'bg-green-100';
    if (activities >= 1) return 'bg-gray-100';
    return 'bg-gray-50';
  };

  const getIntensityText = (activities: number) => {
    if (activities >= 4) return 'text-white';
    if (activities >= 3) return 'text-green-800';
    if (activities >= 2) return 'text-green-700';
    return 'text-gray-600';
  };

  return (
    <Card className="glass-card border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Activité de la semaine</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {data.map((item, index) => (
            <div
              key={index}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center
                ${getIntensityColor(item.activities)}
                ${getIntensityText(item.activities)}
                transition-all duration-200 hover:scale-105
              `}
            >
              <span className="text-xs font-medium mb-1">{item.day}</span>
              <div className="flex flex-col items-center">
                <span className="text-xs opacity-75">{item.activities}</span>
                <span className="text-xs opacity-75">act.</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Moins actif</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-50 rounded-sm" />
            <div className="w-3 h-3 bg-gray-100 rounded-sm" />
            <div className="w-3 h-3 bg-green-100 rounded-sm" />
            <div className="w-3 h-3 bg-green-200 rounded-sm" />
            <div className="w-3 h-3 bg-wellness-gradient rounded-sm" />
          </div>
          <span>Plus actif</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyHeatmap;
