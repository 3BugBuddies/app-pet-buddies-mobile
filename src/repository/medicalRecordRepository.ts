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
    // Omite `id` no POST (gerado pelo banco de dados) para evitar 400 de type mismatch (Long).
    const { id: _id, ...rest } = record;
    const consultaNum = record.consultaId && !isNaN(Number(record.consultaId)) ? Number(record.consultaId) : undefined;
    const payload = {
      ...rest,
      animalId: Number(record.animalId),
      consultaId: consultaNum,
      dataAtendimento: toDatetime(record.dataAtendimento),
    };
    console.log('[createRecord] POST /registro-atendimento payload:', JSON.stringify(payload, null, 2));
    try {
      const response = await apiJava.post('/registro-atendimento', payload);
      console.log('[createRecord] Response data:', JSON.stringify(response.data, null, 2));
      const r = response.data;
      return {
        ...r,
        id: r.id?.toString() ?? '',
        animalId: r.animalId?.toString() ?? '',
        consultaId: r.consultaId?.toString() ?? null,
        dataAtendimento: r.dataAtendimento?.slice(0, 10) ?? r.dataAtendimento,
      };
    } catch (err: any) {
      console.error('[createRecord] Erro 400 detalhado:', err?.response?.status, JSON.stringify(err?.response?.data, null, 2));
      throw err;
    }
  }
  return addFakeRecord(record);
};

export { getRecordsByPetId, createRecord };
