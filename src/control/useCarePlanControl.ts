import { useQuery } from '@tanstack/react-query';
import { getPlan } from '../repository/careRepository';

const carePlanKey = (petId: string) => ['carePlan', petId];

export function useCarePlan(petId: string) {
  return useQuery({
    queryKey: carePlanKey(petId),
    queryFn: () => getPlan(petId),
    enabled: !!petId,
    retry: false,
  });
}
