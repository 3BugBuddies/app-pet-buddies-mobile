import { useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/authContext';
import {
  createAppointment,
  deleteAppointment,
  getAllAppointments,
  getAppointmentById,
  toggleAttendance,
  updateAppointment,
} from '../repository/appointmentRepository';
import type { CreateAppointmentInput } from '../model/appointment';

const APPOINTMENTS_KEY = 'appointments';

// Sem petId: busca por veterinarioId (lado vet) ou responsavelId (lado tutor),
// conforme o perfil da sessão. Com petId: filtra por animal (prontuário).
export function useAppointments(petId?: string) {
  const { session } = useContext(AuthContext);
  const veterinarioId = session?.veterinarioId || session?.usuarioId;
  const responsavelId = session?.responsavelId || session?.usuarioId;
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, petId ?? veterinarioId ?? responsavelId ?? null],
    queryFn: () => getAllAppointments(petId ?? responsavelId, petId ? undefined : veterinarioId),
    retry: false,
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, id],
    queryFn: () => getAppointmentById(id),
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAppointmentInput) => createAppointment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateAppointmentInput> }) =>
      updateAppointment(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY, variables.id] });
    },
  });
}

export function useToggleAppointmentAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
    },
  });
}
