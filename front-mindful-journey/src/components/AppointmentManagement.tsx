import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Trash2,
  Edit,
  Phone,
  MoreVertical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppointments } from '@/hooks/useApi';

interface Appointment {
  id: string;
  specialistName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'video' | 'inPerson' | 'phone';
  status: 'confirmed' | 'pending' | 'cancelled';
  price: string;
  notes?: string;
}

interface AppointmentManagementProps {
  onClose?: () => void;
}

const AppointmentManagement = ({ onClose }: AppointmentManagementProps) => {
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();

  // Utiliser uniquement l'API: pas de fallback local par défaut
  const {
    appointments,
    isLoading,
    cancelAppointment,
    deleteAppointment,
    updateAppointment,
  } = useAppointments();

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
    // Toujours via l'API
    cancelAppointment(appointmentId);
    toast({
      title: "Rendez-vous annulé",
      description: "Votre rendez-vous a été annulé avec succès.",
    });
    window.dispatchEvent(new CustomEvent('bellNotification', {
      detail: {
        title: 'Rendez-vous annulé',
        description: 'Votre rendez-vous a été annulé.'
      }
    }));
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    // Toujours via l'API
    deleteAppointment(appointmentId);

    toast({
      title: "Rendez-vous supprimé",
      description: "Le rendez-vous a été supprimé définitivement.",
    });
    window.dispatchEvent(new CustomEvent('bellNotification', {
      detail: {
        title: 'Rendez-vous supprimé',
        description: 'Le rendez-vous a été supprimé.'
      }
    }));
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
  };

  const handleSaveEdit = (updatedAppointment: Appointment) => {
    // Toujours via l'API
    updateAppointment({
      id: updatedAppointment.id,
      data: {
        date: updatedAppointment.date,
        time: updatedAppointment.time,
        type: updatedAppointment.type,
        notes: updatedAppointment.notes,
      }
    });

    setEditingAppointment(null);

    toast({
      title: "Rendez-vous modifié",
      description: "Votre rendez-vous a été modifié avec succès.",
    });
    window.dispatchEvent(new CustomEvent('bellNotification', {
      detail: {
        title: 'Rendez-vous modifié',
        description: `Nouveau créneau: ${new Date(updatedAppointment.date).toLocaleDateString()} ${updatedAppointment.time}`
      }
    }));
  };

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

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
        {/* Afficher un indicateur de chargement si nécessaire */}
        {isLoading && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Chargement des rendez-vous...
          </p>
        )}

        {/* Si aucun rendez-vous, afficher l'état vide (pas de praticiens) */}
        {appointments.length === 0 && !isLoading ? (
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAppointment(appointment)}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Modifier le rendez-vous</DialogTitle>
                          </DialogHeader>
                          {editingAppointment && (
                            <EditAppointmentForm
                              appointment={editingAppointment}
                              onSave={handleSaveEdit}
                              onCancel={() => setEditingAppointment(null)}
                              availableTimes={availableTimes}
                              onCancelAppointment={handleCancelAppointment}
                            />
                          )}
                        </DialogContent>
                      </Dialog>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Annuler
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

// Composant pour l'édition d'un rendez-vous
const EditAppointmentForm = ({
  appointment,
  onSave,
  onCancel,
  availableTimes,
  onCancelAppointment
}: {
  appointment: Appointment;
  onSave: (appointment: Appointment) => void;
  onCancel: () => void;
  availableTimes: string[];
  onCancelAppointment?: (appointmentId: string) => void;
}) => {
  const [date, setDate] = useState(appointment.date);
  const [time, setTime] = useState(appointment.time);
  const [type, setType] = useState(appointment.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...appointment,
      date,
      time,
      type: type as 'video' | 'inPerson' | 'phone'
    });
  };

  const handleTypeChange = (value: string) => {
    setType(value as 'video' | 'inPerson' | 'phone');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-date">Date</Label>
        <Input
          id="edit-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-time">Heure</Label>
        <Select value={time} onValueChange={setTime} required>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableTimes.map((timeSlot) => (
              <SelectItem key={timeSlot} value={timeSlot}>
                {timeSlot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-type">Type de consultation</Label>
        <Select value={type} onValueChange={handleTypeChange} required>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">
              <div className="flex items-center space-x-2">
                <Video className="h-4 w-4" />
                <span>Visioconférence</span>
              </div>
            </SelectItem>
            <SelectItem value="inPerson">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>En présentiel</span>
              </div>
            </SelectItem>
            <SelectItem value="phone">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Téléphone</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex space-x-2 pt-4">
        <Button type="submit" className="flex-1">
          Sauvegarder
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
      </div>

      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            if (onCancelAppointment) {
              onCancelAppointment(appointment.id);
              onCancel();
            }
          }}
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Annuler le rendez-vous
        </Button>
      </div>
    </form>
  );
};

export default AppointmentManagement;
