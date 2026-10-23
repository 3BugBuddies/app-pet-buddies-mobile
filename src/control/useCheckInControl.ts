import { useMutation, useQueryClient } from '@tanstack/react-query';
import { confirmCheckIn, extractCheckIn } from '../repository/careRepository';
import type { CheckinExtracaoRequest, ConfirmCheckInInput } from '../model/care';

export function useExtractCheckIn() {
  return useMutation({
    mutationFn: (data: CheckinExtracaoRequest) => extractCheckIn(data),
  });
}

export function useConfirmCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConfirmCheckInInput) => confirmCheckIn(input),
    onSuccess: (_result, { payload }) => {
      // O back-end grava o status do item pelo desfecho: recarrega o plano em vez de marcar no cache.
      queryClient.invalidateQueries({ queryKey: ['carePlan', String(payload.animalId)] });
      queryClient.invalidateQueries({ queryKey: ['prontuario', 'registros', String(payload.animalId)] });
    },
  });
}
