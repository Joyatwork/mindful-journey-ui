
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, Lock } from 'lucide-react';

interface AchievementCardProps {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  date?: string;
  progress?: number;
}

const AchievementCard = ({ 
  title, 
  description, 
  icon, 
  completed, 
  date, 
  progress = 0 
}: AchievementCardProps) => {
  return (
    <Card className={`
      glass-card border-0 shadow-lg transition-all duration-200
      ${completed ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'hover:shadow-xl'}
    `}>
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`
            p-2 rounded-full flex-shrink-0
            ${completed 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 text-gray-400'
            }
          `}>
            {completed ? (
              <Check className="h-5 w-5" />
            ) : (
              React.cloneElement(icon as React.ReactElement, { className: 'h-5 w-5' })
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm">{title}</h3>
              {completed && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Terminé
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">{description}</p>
            
            {!completed && progress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Progression
                  </span>
                  <span className="text-xs font-medium">
                    {progress}/10
                  </span>
                </div>
                <Progress value={(progress / 10) * 100} className="h-2" />
              </div>
            )}
            
            {completed && date && (
              <p className="text-xs text-green-600 font-medium">{date}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AchievementCard;
