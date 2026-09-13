import { apiJava } from './apiClient';
import { MedicalRecord } from '../model/medicalRecord';
import { addFakeRecord, getFakeRecordsByPetId } from './fakeData';

// MANTENHA false para testar a interface.
// Mude para true no dia de gravar o vídeo da FIAP com a API no ar.
const USE_API = true;

// Backend espera LocalDateTime — converte "AAAA-MM-DD" → "AAAA-MM-DDTHH:MM:SS"
function toDatetime(dateStr: string): string {
  if (!dateStr) return dateStr;
  return dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
}

const getRecordsByPetId = async (animalId: string): Promise<MedicalRecord[]> => {
  if (USE_API) {
    // Filho não é aninhado — é filtro (contrato regra 2)
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
  }
  return getFakeRecordsByPetId(animalId);
};

const createRecord = async (record: MedicalRecord): Promise<MedicalRecord> => {
  if (USE_API) {
    // dataAtendimento: backend exige LocalDateTime ("AAAA-MM-DDTHH:MM:SS")
    const payload = {
      ...record,
      dataAtendimento: toDatetime(record.dataAtendimento),
    };
    const response = await apiJava.post('/registro-atendimento', payload);
    const r = response.data;
    return {
      ...r,
      id: r.id.toString(),
      animalId: r.animalId.toString(),
      consultaId: r.consultaId?.toString() ?? null,
      dataAtendimento: r.dataAtendimento?.slice(0, 10) ?? r.dataAtendimento,
    };
  }
  return addFakeRecord(record);
};

export { getRecordsByPetId, createRecord };
