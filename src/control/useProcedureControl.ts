import { useQuery } from '@tanstack/react-query';
import { getProceduresByAnimalId } from '../repository/procedureRepository';

export function useProcedures(animalId: string) {
  return useQuery({
    queryKey: ['procedures', animalId],
    queryFn: () => getProceduresByAnimalId(animalId),
    enabled: !!animalId,
  });
}
