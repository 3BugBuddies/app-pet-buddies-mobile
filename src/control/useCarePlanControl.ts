import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { completeCheckInTask, getPlan, toggleTask } from '../repository/careRepository';

const carePlanKey = (petId: string) => ['carePlan', petId];

export function useCarePlan(petId: string) {
  return useQuery({
    queryKey: carePlanKey(petId),
    queryFn: () => getPlan(petId),
    enabled: !!petId,
  });
}

export function useToggleCareTask(petId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => toggleTask(petId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carePlanKey(petId) });
    },
  });
}

export function useCompleteCheckInTask(petId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => completeCheckInTask(petId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carePlanKey(petId) });
      queryClient.invalidateQueries({ queryKey: ['score', petId] });
    },
  });
}
