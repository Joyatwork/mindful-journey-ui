
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Clock,
  MapPin,
  Video,
  MessageCircle,
  Euro,
  AlertCircle,
  CheckCircle,
  XCircle,
  Phone
} from 'lucide-react';
import { BookingData } from './BookingForm';
import { HealthProfessional } from './HealthProfessionalCard';

export interface Booking extends BookingData {
  id: string;
  professional: HealthProfessional;
  status: 'upcoming' | 'completed' | 'cancelled';
  bookedAt: Date;
}

interface BookingManagementProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
  onBack: () => void;
}

const BookingManagement: React.FC<BookingManagementProps> = ({
  bookings,
  onCancelBooking,
  onBack
}) => {
  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getConsultationTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'inPerson': return <MapPin className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12 border-2 border-purple-200 dark:border-purple-700">
            <AvatarImage src={booking.professional.avatar} alt={booking.professional.name} />
            <AvatarFallback className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
              {booking.professional.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {booking.professional.name}
                </h3>
                <p className="text-purple-600 dark:text-purple-400 text-sm">
                  {booking.professional.specialty}
                </p>
              </div>
              
              <Badge className={getStatusColor(booking.status)}>
                {getStatusIcon(booking.status)}
                <span className="ml-1 capitalize">
                  {booking.status === 'upcoming' && 'À venir'}
                  {booking.status === 'completed' && 'Terminé'}
                  {booking.status === 'cancelled' && 'Annulé'}
                </span>
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{booking.date.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{booking.time}</span>
              </div>
              <div className="flex items-center gap-2">
                {getConsultationTypeIcon(booking.consultationType)}
                <span>
                  {booking.consultationType === 'video' && 'Consultation vidéo'}
                  {booking.consultationType === 'inPerson' && 'Présentiel'}
                  {booking.consultationType === 'phone' && 'Téléphone'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Euro className="w-4 h-4" />
                <span>{booking.professional.price}€</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Motif :</strong> {booking.reason}
            </div>
            
            {booking.notes && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Notes :</strong> {booking.notes}
              </div>
            )}
            
            {booking.status === 'upcoming' && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancelBooking(booking.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900"
                >
                  Annuler le rendez-vous
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mes rendez-vous
        </h1>
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            À venir ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Terminés ({completedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Annulés ({cancelledBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length === 0 ? (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucun rendez-vous à venir
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Vous n'avez pas de consultation programmée pour le moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            upcomingBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedBookings.length === 0 ? (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucune consultation terminée
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Vos consultations passées apparaîtront ici.
                </p>
              </CardContent>
            </Card>
          ) : (
            completedBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledBookings.length === 0 ? (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
              <CardContent className="p-8 text-center">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucun rendez-vous annulé
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Les rendez-vous que vous annulez apparaîtront ici.
                </p>
              </CardContent>
            </Card>
          ) : (
            cancelledBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingManagement;
