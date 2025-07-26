
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar,
  Clock,
  Video,
  MapPin,
  Trash2,
  Edit,
  Phone
} from 'lucide-react';

interface Appointment {
  id: string;
  specialistName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'video' | 'inPerson' | 'phone';
  status: 'confirmed' | 'pending' | 'cancelled';
  price: string;
}

interface AppointmentManagementProps {
  onClose?: () => void;
}

const AppointmentManagement = ({ onClose }: AppointmentManagementProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      specialistName: 'Dr. Marie Dubois',
      specialty: 'Psychologue clinicienne',
      date: '2024-01-15',
      time: '14:30',
      type: 'video',
      status: 'confirmed',
      price: '80€'
    },
    {
      id: '2',
      specialistName: 'Dr. Pierre Martin',
      specialty: 'Médecin généraliste',
      date: '2024-01-18',
      time: '09:00',
      type: 'inPerson',
      status: 'pending',
      price: '50€'
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'inPerson': return <MapPin className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status === 'confirmed' ? 'Confirmé' : 
         status === 'pending' ? 'En attente' : 'Annulé'}
      </Badge>
    );
  };

  const handleCancelAppointment = (appointmentId: string) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'cancelled' as const }
          : apt
      )
    );
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Mes rendez-vous
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Fermer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Aucun rendez-vous programmé
          </p>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} className="p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
                      {appointment.specialistName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                      {appointment.specialistName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {appointment.specialty}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(appointment.type)}
                        <span>
                          {appointment.type === 'video' ? 'Visio' :
                           appointment.type === 'phone' ? 'Téléphone' : 'Présentiel'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(appointment.status)}
                      <Badge variant="outline" className="text-xs">
                        {appointment.price}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  {appointment.status !== 'cancelled' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  {appointment.status === 'cancelled' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentManagement;
