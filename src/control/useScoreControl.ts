import { useQuery } from '@tanstack/react-query';
import { getBadges, getScore } from '../repository/careRepository';

export function useScore(petId: string) {
  return useQuery({
    queryKey: ['score', petId],
    queryFn: () => getScore(petId),
    enabled: !!petId,
  });
}

export function useBadges(petId: string) {
  return useQuery({
    queryKey: ['badges', petId],
    queryFn: () => getBadges(petId),
    enabled: !!petId,
  });
}
