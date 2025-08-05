
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Filter, Clock, Zap, Heart, Brain, Moon } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface ChallengeFilterProps {
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

const durationFilters: FilterOption[] = [
  { id: '5min', label: '5 min', icon: <Clock className="h-3 w-3" />, color: 'bg-green-100 text-green-800' },
  { id: '15min', label: '15 min', icon: <Clock className="h-3 w-3" />, color: 'bg-blue-100 text-blue-800' },
  { id: '30min', label: '30 min', icon: <Clock className="h-3 w-3" />, color: 'bg-purple-100 text-purple-800' },
];

const energyFilters: FilterOption[] = [
  { id: 'low', label: 'Faible', icon: <Zap className="h-3 w-3" />, color: 'bg-gray-100 text-gray-800' },
  { id: 'medium', label: 'Moyenne', icon: <Zap className="h-3 w-3" />, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'high', label: 'Élevée', icon: <Zap className="h-3 w-3" />, color: 'bg-red-100 text-red-800' },
];

const themeFilters: FilterOption[] = [
  { id: 'stress', label: 'Stress', icon: <Brain className="h-3 w-3" />, color: 'bg-red-100 text-red-800' },
  { id: 'sleep', label: 'Sommeil', icon: <Moon className="h-3 w-3" />, color: 'bg-purple-100 text-purple-800' },
  { id: 'energy', label: 'Énergie', icon: <Zap className="h-3 w-3" />, color: 'bg-orange-100 text-orange-800' },
  { id: 'mindfulness', label: 'Pleine conscience', icon: <Heart className="h-3 w-3" />, color: 'bg-wellness-mint text-white' },
];

const ChallengeFilter = ({ activeFilters, onFilterChange }: ChallengeFilterProps) => {
  const toggleFilter = (filterId: string) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(id => id !== filterId)
      : [...activeFilters, filterId];
    onFilterChange(newFilters);
  };

  const renderFilterSection = (title: string, filters: FilterOption[]) => (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-muted-foreground mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilters.includes(filter.id) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter(filter.id)}
            className="h-8 text-xs"
          >
            {filter.icon}
            <span className="ml-1">{filter.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="p-4 glass-card border-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filtres</h3>
        </div>
        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange([])}
            className="text-xs"
          >
            Tout effacer
          </Button>
        )}
      </div>

      {renderFilterSection('Durée', durationFilters)}
      {renderFilterSection('Énergie requise', energyFilters)}
      {renderFilterSection('Thématiques', themeFilters)}

      {activeFilters.length > 0 && (
        <div className="pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            {activeFilters.length} filtre{activeFilters.length > 1 ? 's' : ''} actif{activeFilters.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </Card>
  );
};

export default ChallengeFilter;
