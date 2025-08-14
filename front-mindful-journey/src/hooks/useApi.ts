import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/lib/api';

// Hook pour l'authentification
export const useAuth = () => {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: apiService.auth.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: apiService.auth.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: apiService.auth.logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });

  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: apiService.auth.user,
    retry: false,
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!userQuery.data,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
};

// Hook pour les rendez-vous
export const useAppointments = () => {
  const queryClient = useQueryClient();

  const appointmentsQuery = useQuery({
    queryKey: ['appointments'],
    queryFn: apiService.appointments.getAll,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: apiService.appointments.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiService.appointments.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: apiService.appointments.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: apiService.appointments.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  return {
    appointments: appointmentsQuery.data || [],
    isLoading: appointmentsQuery.isLoading,
    error: appointmentsQuery.error,
    createAppointment: createAppointmentMutation.mutate,
    updateAppointment: updateAppointmentMutation.mutate,
    cancelAppointment: cancelAppointmentMutation.mutate,
    deleteAppointment: deleteAppointmentMutation.mutate,
    isCreating: createAppointmentMutation.isPending,
    isUpdating: updateAppointmentMutation.isPending,
  };
};

// Hook pour les spécialistes
export const useSpecialists = (filters?: any) => {
  const specialistsQuery = useQuery({
    queryKey: ['specialists', filters],
    queryFn: () => apiService.specialists.getAll(filters),
  });

  return {
    specialists: specialistsQuery.data || [],
    isLoading: specialistsQuery.isLoading,
    error: specialistsQuery.error,
    refetch: specialistsQuery.refetch,
  };
};

// Hook pour un spécialiste spécifique
export const useSpecialist = (id: string) => {
  const specialistQuery = useQuery({
    queryKey: ['specialist', id],
    queryFn: () => apiService.specialists.getById(id),
    enabled: !!id,
  });

  return {
    specialist: specialistQuery.data,
    isLoading: specialistQuery.isLoading,
    error: specialistQuery.error,
  };
};

// Hook pour les données de santé
export const useHealthData = () => {
  const queryClient = useQueryClient();

  const moodDataQuery = useQuery({
    queryKey: ['healthData', 'mood'],
    queryFn: () => apiService.healthData.getMoodData(),
  });

  const progressDataQuery = useQuery({
    queryKey: ['healthData', 'progress'],
    queryFn: () => apiService.healthData.getProgressData(),
  });

  const saveMoodMutation = useMutation({
    mutationFn: apiService.healthData.saveMoodData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthData', 'mood'] });
      queryClient.invalidateQueries({ queryKey: ['healthData', 'progress'] });
    },
  });

  return {
    moodData: moodDataQuery.data || [],
    progressData: progressDataQuery.data || [],
    isLoadingMood: moodDataQuery.isLoading,
    isLoadingProgress: progressDataQuery.isLoading,
    saveMood: saveMoodMutation.mutate,
    isSavingMood: saveMoodMutation.isPending,
  };
};

// Hook pour les activités wellness
export const useWellness = () => {
  const queryClient = useQueryClient();

  const activitiesQuery = useQuery({
    queryKey: ['wellness', 'activities'],
    queryFn: apiService.wellness.getActivities,
  });

  const progressQuery = useQuery({
    queryKey: ['wellness', 'progress'],
    queryFn: apiService.wellness.getProgress,
  });

  const logActivityMutation = useMutation({
    mutationFn: apiService.wellness.logActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellness', 'progress'] });
    },
  });

  return {
    activities: activitiesQuery.data || [],
    progress: progressQuery.data,
    isLoadingActivities: activitiesQuery.isLoading,
    isLoadingProgress: progressQuery.isLoading,
    logActivity: logActivityMutation.mutate,
    isLoggingActivity: logActivityMutation.isPending,
  };
};

// Hook pour le diagnostic
export const useDiagnostic = () => {
  const queryClient = useQueryClient();

  const diagnosticQuery = useQuery({
    queryKey: ['diagnostic'],
    queryFn: apiService.diagnostic.get,
  });

  const saveDiagnosticMutation = useMutation({
    mutationFn: apiService.diagnostic.save,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic'] });
    },
  });

  return {
    diagnostic: diagnosticQuery.data,
    isLoading: diagnosticQuery.isLoading,
    saveDiagnostic: saveDiagnosticMutation.mutate,
    isSaving: saveDiagnosticMutation.isPending,
  };
};
