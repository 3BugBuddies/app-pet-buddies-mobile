import { useMutation, useQueryClient } from '@tanstack/react-query';
import { confirmCheckIn, extractCheckIn, getEscalationPreview } from '../repository/careRepository';
import type { CheckinExtracaoRequest, CheckInRequest } from '../model/care';

export function useExtractCheckIn() {
  return useMutation({
    mutationFn: (data: CheckinExtracaoRequest) => extractCheckIn(data),
  });
}

export function useConfirmCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckInRequest) => confirmCheckIn(payload),
    onSuccess: (_, variables) => {
      // A API não atualiza o status do evento para CONCLUIDO após o check-in,
      // então gravamos a conclusão diretamente no cache sem refetch.
      queryClient.setQueryData(['carePlan', String(variables.animalId)], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: (old.tasks ?? []).map((t: any) => ({ ...t, completed: true })),
        };
      });
      queryClient.invalidateQueries({ queryKey: ['prontuario', 'registros', String(variables.animalId)] });
    },
  });
}

export function useEscalationPreview() {
  return useMutation({
    mutationFn: () => getEscalationPreview(),
  });
}
