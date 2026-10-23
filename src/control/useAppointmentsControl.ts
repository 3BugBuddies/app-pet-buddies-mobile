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
  updateAppointment,
  getFreeWindows,
  getFreeDates,
} from '../repository/appointmentRepository';
import { getVeterinarians } from '../repository/veterinarianRepository';
import type { CreateAppointmentInput } from '../model/appointment';

const APPOINTMENTS_KEY = 'appointments';

// Com petId: histórico de consultas daquele animal.
// Sem petId: só o veterinário tem agenda própria (filtrada pelo veterinarioId da sessão).
// Tutor sem pet não consulta nada: sem filtro a API devolveria as consultas de todo mundo.
export function useAppointments(petId?: string) {
  const { session } = useContext(AuthContext);
  const veterinarioId = session?.perfil === 'VET' ? session.veterinarioId : null;
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, session?.usuarioId, petId, veterinarioId],
    queryFn: () => getAllAppointments(petId, veterinarioId),
    retry: false,
    enabled: !!session?.usuarioId && (!!petId || !!veterinarioId),
  });
}

// Busca agendamentos de todos os pets do tutor e unifica numa única lista.
// Garante que um slot ocupado por qualquer pet da família apareça bloqueado.
export function useAllPetsAppointments(petIds: string[]) {
  const results = useQueries({
    queries: petIds.map((id) => ({
      queryKey: [APPOINTMENTS_KEY, 'pet', id],
      queryFn: () => getAllAppointments(id),
      enabled: !!id,
    })),
  });
  return results.flatMap((r) => r.data ?? []);
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, 'detalhe', id],
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
      // A janela agendada deixa de estar livre: a grade precisa ser buscada de novo.
      queryClient.invalidateQueries({ queryKey: ['freeWindows'] });
      queryClient.invalidateQueries({ queryKey: ['freeDates'] });
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
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY, 'detalhe', variables.id] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) => deleteAppointment(id, motivo),
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
    queryFn: () => getFreeWindows(veterinarioId!, dataISO!),
    enabled: !!veterinarioId && !!dataISO,
  });
}

export function useFreeDates(veterinarioId?: string | number, de?: string, ate?: string) {
  return useQuery({
    queryKey: ['freeDates', veterinarioId, de, ate],
    queryFn: () => getFreeDates(veterinarioId!, de!, ate!),
    enabled: !!veterinarioId && !!de && !!ate,
  });
}

export function useVeterinarians() {
  return useQuery({
    queryKey: ['veterinarians'],
    queryFn: getVeterinarians,
    staleTime: 5 * 60 * 1000,
  });
}
