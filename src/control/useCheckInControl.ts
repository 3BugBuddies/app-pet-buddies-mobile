import { useMutation, useQueryClient } from '@tanstack/react-query';
import { confirmCheckIn, extractCheckIn, getEscalationPreview } from '../repository/careRepository';
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
    onSuccess: (result, { payload }) => {
      const itemId = payload.itemPlanoCuidadoId;
      // A API ainda não grava REALIZADO no item (pendente no back), então marcamos só no cache
      // e só o item que o tutor ligou ao check-in — e só se a dose foi liberada em casa.
      if (result.status === 'DOSE' && itemId != null) {
        queryClient.setQueryData(['carePlan', String(payload.animalId)], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            tasks: (old.tasks ?? []).map((t: any) =>
              String(t.id) === String(itemId) ? { ...t, completed: true } : t
            ),
          };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['prontuario', 'registros', String(payload.animalId)] });
    },
  });
}

export function useEscalationPreview() {
  return useMutation({
    mutationFn: () => getEscalationPreview(),
  });
}
