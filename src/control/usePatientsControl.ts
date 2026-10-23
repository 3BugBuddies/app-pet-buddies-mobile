import { useQueries, useQuery } from '@tanstack/react-query';
import { getClinicPatients, getPlanSummary } from '../repository/patientRepository';

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: getClinicPatients,
  });
}

const summaryKey = (petId: string) => ['planSummary', petId];

export function usePlanSummary(petId: string) {
  return useQuery({
    queryKey: summaryKey(petId),
    queryFn: () => getPlanSummary(petId),
    enabled: !!petId,
    retry: false,
  });
}

// Um GET por paciente: a API não tem a visão agregada da clínica.
export function usePlanSummaries(petIds: string[]) {
  const results = useQueries({
    queries: petIds.map((id) => ({
      queryKey: summaryKey(id),
      queryFn: () => getPlanSummary(id),
      retry: false,
    })),
  });
  return Object.fromEntries(petIds.map((id, i) => [id, results[i]?.data ?? null]));
}
