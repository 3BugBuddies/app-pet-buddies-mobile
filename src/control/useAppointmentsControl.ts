import { useContext } from 'react';
import { Alert } from 'react-native';
import { buildApiErrorMessage } from './apiErrorHelper';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/authContext';
import {
  createAppointment,
  deleteAppointment,
  getAllAppointments,
  getAppointmentById,
  toggleAttendance,
  updateAppointment,
  getFreeWindows,
} from '../repository/appointmentRepository';
import type { CreateAppointmentInput } from '../model/appointment';

const APPOINTMENTS_KEY = 'appointments';

// Sem petId: busca a agenda (do Vet logado ou do Tutor logado) via Token Bearer.
// Com petId: filtra o histórico de consultas daquele animal.
export function useAppointments(petId?: string) {
  const { session } = useContext(AuthContext);
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, session?.usuarioId, petId],
    queryFn: () => getAllAppointments(petId),
    retry: false,
    enabled: !!session?.usuarioId,
  });
}

// Busca agendamentos de todos os pets do tutor e unifica numa única lista.
// Garante que um slot ocupado por qualquer pet da família apareça bloqueado.
export function useAllPetsAppointments(petIds: string[]) {
  const results = useQueries({
    queries: petIds.map((id) => ({
      queryKey: [APPOINTMENTS_KEY, id],
      queryFn: () => getAllAppointments(id),
      enabled: !!id,
    })),
  });
  return results.flatMap((r) => r.data ?? []);
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
      Alert.alert('Sucesso', 'A consulta foi cancelada com sucesso.');
    },
    onError: (error: any) => {
      Alert.alert('Erro ao cancelar consulta', buildApiErrorMessage(error));
    },
  });
}

export function useFreeWindows(veterinarioId?: string | number, dataISO?: string) {
  return useQuery({
    queryKey: ['freeWindows', veterinarioId, dataISO],
    queryFn: () => getFreeWindows(veterinarioId, dataISO),
    enabled: !!dataISO,
  });
}
