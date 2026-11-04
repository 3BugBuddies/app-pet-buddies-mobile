import { apiJava } from './apiClient';
import { MedicalRecord } from '../model/medicalRecord';

const getRecordsByPetId = async (animalId: string): Promise<MedicalRecord[]> => {
  // Filho não é aninhado — é filtro
  const response = await apiJava.get(`/registro-atendimento?animalId=${animalId}`);
  const list = response.data._embedded?.registroAtendimentoResponseList ?? [];
  // Normaliza o datetime do backend para a data que o app exibe
  return list.map((r: any) => ({
    ...r,
    id: r.id.toString(),
    animalId: r.animalId.toString(),
    consultaId: r.consultaId?.toString() ?? null,
    dataAtendimento: r.dataAtendimento?.slice(0, 10) ?? r.dataAtendimento,
  }));
};

export { getRecordsByPetId };
