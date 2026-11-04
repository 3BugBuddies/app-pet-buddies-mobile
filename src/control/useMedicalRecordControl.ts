import { useQuery } from '@tanstack/react-query';
import type { MedicalRecord } from '../model/medicalRecord';
import { getRecordsByPetId } from '../repository/medicalRecordRepository';

const registrosQueryKey = (animalId: string) => ['prontuario', 'registros', animalId];

interface MedicalRecordControl {
  registros: MedicalRecord[] | undefined;
  carregandoRegistros: boolean;
}

const useMedicalRecordControl = (animalId: string): MedicalRecordControl => {
  const registrosQuery = useQuery({
    queryKey: registrosQueryKey(animalId),
    queryFn: () => getRecordsByPetId(animalId),
  });

  return {
    registros: registrosQuery.data,
    carregandoRegistros: registrosQuery.isLoading,
  };
};

export type { MedicalRecordControl };
export default useMedicalRecordControl;
