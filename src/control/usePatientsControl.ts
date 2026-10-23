import { useQueries, useQuery } from '@tanstack/react-query';
import { getClinicPatients, getResumoPlano } from '../repository/patientRepository';

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: getClinicPatients,
  });
}

const resumoKey = (petId: string) => ['resumoPlano', petId];

export function useResumoPlano(petId: string) {
  return useQuery({
    queryKey: resumoKey(petId),
    queryFn: () => getResumoPlano(petId),
    enabled: !!petId,
    retry: false,
  });
}

// Um GET por paciente: a API não tem a visão agregada da clínica.
export function useResumosPlano(petIds: string[]) {
  const results = useQueries({
    queries: petIds.map((id) => ({
      queryKey: resumoKey(id),
      queryFn: () => getResumoPlano(id),
      retry: false,
    })),
  });
  return Object.fromEntries(petIds.map((id, i) => [id, results[i]?.data ?? null]));
}
