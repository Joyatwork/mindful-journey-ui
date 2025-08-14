
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Heart } from 'lucide-react';

interface WellnessCardProps {
  title: string;
  description: string;
  duration?: string;
  difficulty: 'Facile' | 'Moyen' | 'Avancé';
  category: string;
  icon: React.ReactNode;
  gradient: string;
  onAction: () => void;
  actionLabel?: string;
}

const WellnessCard = ({
  title,
  description,
  duration,
  difficulty,
  category,
  icon,
  gradient,
  onAction,
  actionLabel = "Commencer"
}: WellnessCardProps) => {
  const difficultyColors = {
    'Facile': 'bg-green-100 text-green-800',
    'Moyen': 'bg-yellow-100 text-yellow-800',
    'Avancé': 'bg-red-100 text-red-800'
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 bg-white/90 backdrop-blur-sm">
      <div className={`h-2 ${gradient}`} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${gradient} bg-opacity-10`}>
              {icon}
            </div>
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          </div>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            {duration && (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{duration}</span>
              </div>
            )}
            <Badge 
              variant="secondary" 
              className={`${difficultyColors[difficulty]} text-xs`}
            >
              {difficulty}
            </Badge>
          </div>
        </div>
        
        <Button 
          onClick={onAction}
          className="w-full bg-wellness-gradient hover:opacity-90 transition-opacity"
        >
          {actionLabel}
        </Button>
      </div>
    </Card>
  );
};

export default WellnessCard;
