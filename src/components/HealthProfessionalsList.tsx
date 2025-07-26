
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, SortAsc } from 'lucide-react';
import HealthProfessionalCard, { HealthProfessional } from './HealthProfessionalCard';
import BookingForm, { BookingData } from './BookingForm';

interface HealthProfessionalsListProps {
  professionals: HealthProfessional[];
  suggestedProfessionalIds?: string[];
  onBook: (bookingData: BookingData) => void;
  onBack: () => void;
}

const HealthProfessionalsList: React.FC<HealthProfessionalsListProps> = ({
  professionals,
  suggestedProfessionalIds = [],
  onBook,
  onBack
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'experience'>('rating');
  const [showSuggestedOnly, setShowSuggestedOnly] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<HealthProfessional | null>(null);

  const specialties = Array.from(new Set(professionals.map(p => p.specialty)));

  const filteredProfessionals = professionals
    .filter(prof => {
      const matchesSearch = prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prof.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prof.bio.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialty = specialtyFilter === 'all' || prof.specialty === specialtyFilter;
      
      const matchesSuggested = !showSuggestedOnly || suggestedProfessionalIds.includes(prof.id);
      
      return matchesSearch && matchesSpecialty && matchesSuggested;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        case 'experience':
          return b.experience - a.experience;
        default:
          return 0;
      }
    });

  const suggestedProfessionals = filteredProfessionals.filter(p => 
    suggestedProfessionalIds.includes(p.id)
  );

  const otherProfessionals = filteredProfessionals.filter(p => 
    !suggestedProfessionalIds.includes(p.id)
  );

  const handleBookingSubmit = (bookingData: BookingData) => {
    onBook(bookingData);
    setSelectedProfessional(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Professionnels de santé
        </h1>
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher un professionnel ou une spécialité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes spécialités</SelectItem>
              {specialties.map(specialty => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Mieux notés</SelectItem>
              <SelectItem value="price">Prix croissant</SelectItem>
              <SelectItem value="experience">Plus expérimentés</SelectItem>
            </SelectContent>
          </Select>

          {suggestedProfessionalIds.length > 0 && (
            <Button
              variant={showSuggestedOnly ? "default" : "outline"}
              onClick={() => setShowSuggestedOnly(!showSuggestedOnly)}
              className="whitespace-nowrap"
            >
              Recommandés pour moi
              <Badge className="ml-2" variant="secondary">
                {suggestedProfessionalIds.length}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Suggested Professionals */}
        {!showSuggestedOnly && suggestedProfessionals.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              Recommandés pour vous
              <Badge className="bg-wellness-gradient text-white">
                {suggestedProfessionals.length}
              </Badge>
            </h2>
            
            <div className="grid gap-4">
              {suggestedProfessionals.map(professional => (
                <HealthProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onBook={setSelectedProfessional}
                  suggested={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Professionals */}
        {!showSuggestedOnly && otherProfessionals.length > 0 && (
          <div className="space-y-4">
            {suggestedProfessionals.length > 0 && (
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Autres professionnels
              </h2>
            )}
            
            <div className="grid gap-4">
              {otherProfessionals.map(professional => (
                <HealthProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onBook={setSelectedProfessional}
                />
              ))}
            </div>
          </div>
        )}

        {/* Suggested Only */}
        {showSuggestedOnly && suggestedProfessionals.length > 0 && (
          <div className="grid gap-4">
            {suggestedProfessionals.map(professional => (
              <HealthProfessionalCard
                key={professional.id}
                professional={professional}
                onBook={setSelectedProfessional}
                suggested={true}
              />
            ))}
          </div>
        )}

        {filteredProfessionals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Aucun professionnel trouvé avec ces critères.
            </p>
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {selectedProfessional && (
        <BookingForm
          professional={selectedProfessional}
          onBook={handleBookingSubmit}
          onCancel={() => setSelectedProfessional(null)}
        />
      )}
    </div>
  );
};

export default HealthProfessionalsList;
