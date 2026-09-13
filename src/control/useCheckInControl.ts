import { useMutation, useQueryClient } from '@tanstack/react-query';
import { confirmCheckIn, extractCheckIn, getEscalationPreview } from '../repository/careRepository';
import type { CheckInExtracaoRequest, CheckInRequest } from '../model/care';

export function useExtractCheckIn() {
  return useMutation({
    mutationFn: (data: CheckInExtracaoRequest) => extractCheckIn(data),
  });
}

export function useConfirmCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckInRequest) => confirmCheckIn(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prontuario', 'registros', String(variables.animalId)] });
    },
  });
}

export function useEscalationPreview() {
  return useMutation({
    mutationFn: () => getEscalationPreview(),
  });
}
