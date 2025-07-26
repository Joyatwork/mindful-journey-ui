
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search,
  Filter,
  Star,
  Clock,
  Calendar,
  Video,
  MapPin,
  UserCheck,
  ArrowLeft
} from 'lucide-react';

interface HealthProfessional {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  price: string;
  availability: string;
  consultationType: 'video' | 'inPerson' | 'both';
  image?: string;
  description: string;
  location: string;
}

interface HealthProfessionalsListProps {
  onBack: () => void;
  onBookAppointment: (specialist: HealthProfessional) => void;
  onViewProfile: (specialist: HealthProfessional) => void;
}

const HealthProfessionalsList = ({ 
  onBack, 
  onBookAppointment, 
  onViewProfile 
}: HealthProfessionalsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedConsultationType, setSelectedConsultationType] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'experience'>('rating');

  const allProfessionals: HealthProfessional[] = [
    {
      id: '1',
      name: 'Dr. Marie Dubois',
      specialty: 'Psychologue clinicienne',
      rating: 4.9,
      experience: '12 ans',
      price: '80€',
      availability: 'Disponible cette semaine',
      consultationType: 'both',
      description: 'Spécialisée dans la gestion du stress et de l\'anxiété',
      location: 'Paris 8ème'
    },
    {
      id: '2',
      name: 'Dr. Pierre Martin',
      specialty: 'Médecin généraliste',
      rating: 4.7,
      experience: '15 ans',
      price: '50€',
      availability: 'Disponible demain',
      consultationType: 'both',
      description: 'Expert en médecine préventive et troubles du sommeil',
      location: 'Lyon 2ème'
    },
    {
      id: '3',
      name: 'Dr. Sophie Laurent',
      specialty: 'Psychiatre',
      rating: 4.8,
      experience: '10 ans',
      price: '120€',
      availability: 'Disponible dans 3 jours',
      consultationType: 'video',
      description: 'Spécialisée en thérapies comportementales et cognitives',
      location: 'Consultation en ligne'
    },
    {
      id: '4',
      name: 'Dr. Jean Moreau',
      specialty: 'Coach bien-être',
      rating: 4.6,
      experience: '8 ans',
      price: '60€',
      availability: 'Disponible cette semaine',
      consultationType: 'both',
      description: 'Accompagnement personnalisé pour le développement personnel',
      location: 'Marseille 1er'
    },
    {
      id: '5',
      name: 'Dr. Anne Rousseau',
      specialty: 'Nutritionniste',
      rating: 4.8,
      experience: '11 ans',
      price: '70€',
      availability: 'Disponible lundi prochain',
      consultationType: 'inPerson',
      description: 'Spécialisée en nutrition thérapeutique et bien-être',
      location: 'Toulouse Centre'
    },
    {
      id: '6',
      name: 'Dr. Marc Durand',
      specialty: 'Thérapeute',
      rating: 4.5,
      experience: '9 ans',
      price: '75€',
      availability: 'Disponible cette semaine',
      consultationType: 'video',
      description: 'Thérapie individuelle et de couple, gestion des émotions',
      location: 'Consultation en ligne'
    }
  ];

  const specialties = Array.from(new Set(allProfessionals.map(p => p.specialty)));

  const filteredProfessionals = allProfessionals
    .filter(professional => {
      const matchesSearch = professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           professional.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           professional.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'all' || professional.specialty === selectedSpecialty;
      const matchesConsultationType = selectedConsultationType === 'all' || 
                                    professional.consultationType === selectedConsultationType ||
                                    (selectedConsultationType === 'both' && professional.consultationType === 'both');
      
      return matchesSearch && matchesSpecialty && matchesConsultationType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return parseInt(a.price) - parseInt(b.price);
        case 'experience':
          return parseInt(b.experience) - parseInt(a.experience);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour</span>
        </Button>
        <h1 className="text-2xl font-bold">Spécialistes de santé</h1>
        <div></div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 glass-card border-0 shadow-lg">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un spécialiste ou une spécialité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les spécialités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les spécialités</SelectItem>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedConsultationType} onValueChange={setSelectedConsultationType}>
              <SelectTrigger>
                <SelectValue placeholder="Type de consultation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="video">Consultation vidéo</SelectItem>
                <SelectItem value="inPerson">En personne</SelectItem>
                <SelectItem value="both">Les deux</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: 'rating' | 'price' | 'experience') => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Meilleure note</SelectItem>
                <SelectItem value="price">Prix croissant</SelectItem>
                <SelectItem value="experience">Expérience</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredProfessionals.length} spécialiste{filteredProfessionals.length > 1 ? 's' : ''} trouvé{filteredProfessionals.length > 1 ? 's' : ''}
          </p>
        </div>

        {filteredProfessionals.map((professional) => (
          <Card 
            key={professional.id} 
            className="p-4 glass-card border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => onViewProfile(professional)}
          >
            <div className="flex items-start space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={professional.image} alt={professional.name} />
                <AvatarFallback className="bg-wellness-gradient text-white">
                  {professional.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{professional.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-muted-foreground">{professional.rating}</span>
                  </div>
                </div>
                
                <p className="text-wellness-lavender font-medium mb-2">{professional.specialty}</p>
                <p className="text-sm text-muted-foreground mb-3">{professional.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <UserCheck className="h-4 w-4" />
                    <span>{professional.experience}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{professional.availability}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{professional.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {professional.consultationType === 'video' ? (
                      <Video className="h-4 w-4" />
                    ) : professional.consultationType === 'inPerson' ? (
                      <MapPin className="h-4 w-4" />
                    ) : (
                      <>
                        <Video className="h-4 w-4" />
                        <MapPin className="h-4 w-4" />
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-sm">
                    {professional.price}
                  </Badge>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookAppointment(professional);
                    }}
                    className="bg-wellness-gradient hover:opacity-90 text-white"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Réserver
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HealthProfessionalsList;
