import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export function useAppointments(petId?: string) {
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, petId ?? null],
    queryFn: () => getAllAppointments(petId),
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
