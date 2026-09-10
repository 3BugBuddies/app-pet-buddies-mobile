import { useQuery } from '@tanstack/react-query';
import { getClinicPatients } from '../repository/patientRepository';

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: getClinicPatients,
  });
}
