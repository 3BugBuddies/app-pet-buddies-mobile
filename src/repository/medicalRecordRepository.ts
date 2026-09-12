import { apiJava } from './apiClient';
import { MedicalRecord } from '../model/medicalRecord';
import { addFakeRecord, getFakeRecordsByPetId } from './fakeData';

// MANTENHA false para testar a interface.
// Mude para true no dia de gravar o vídeo da FIAP com a API no ar.
const USE_API = false;

const getRecordsByPetId = async (animalId: string): Promise<MedicalRecord[]> => {
  if (USE_API) {
    // Filho não é aninhado — é filtro (contrato regra 2)
    const response = await apiJava.get(`/registro-atendimento?animalId=${animalId}`);
    return response.data._embedded?.registroAtendimentoResponseList ?? [];
  }
  return getFakeRecordsByPetId(animalId);
};

const createRecord = async (record: MedicalRecord): Promise<MedicalRecord> => {
  if (USE_API) {
    const response = await apiJava.post('/registro-atendimento', record);
    return response.data;
  }
  return addFakeRecord(record);
};

export { getRecordsByPetId, createRecord };
