import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { completeCheckInTask, getPlan, toggleTask } from '../repository/careRepository';

const carePlanKey = (petId: string) => ['carePlan', petId];

export function useCarePlan(petId: string) {
  return useQuery({
    queryKey: carePlanKey(petId),
    queryFn: () => getPlan(petId),
    enabled: !!petId,
    retry: false,
  });
}

export function useToggleCareTask(petId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => toggleTask(petId, taskId),
    onMutate: async (taskId: string) => {
      // Cancela re-fetch pendente para não sobrescrever o optimistic update
      await queryClient.cancelQueries({ queryKey: carePlanKey(petId) });
      const previous = queryClient.getQueryData(carePlanKey(petId));
      // Flip imediato no cache — backend não tem endpoint de toggle
      queryClient.setQueryData(carePlanKey(petId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: (old.tasks ?? []).map((t: any) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ),
        };
      });
      return { previous };
    },
    onError: (_err: any, _taskId: string, context: any) => {
      // Reverte se der erro
      if (context?.previous) queryClient.setQueryData(carePlanKey(petId), context.previous);
    },
  });
}

export function useCompleteCheckInTask(petId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => completeCheckInTask(petId, taskId),
    onMutate: async (taskId: string) => {
      await queryClient.cancelQueries({ queryKey: carePlanKey(petId) });
      const previous = queryClient.getQueryData(carePlanKey(petId));

      // Trava o botão imediatamente na UI local
      queryClient.setQueryData(carePlanKey(petId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: (old.tasks ?? []).map((t: any) =>
            t.id === taskId ? { ...t, completed: true } : t
          ),
        };
      });
      return { previous };
    },
    onSuccess: () => {
      // Invalida apenas o score; preserva a trava local da Home
      queryClient.invalidateQueries({ queryKey: ['score', petId] });
    },
  });
}
