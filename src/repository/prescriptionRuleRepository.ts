import { apiJava } from './apiClient';
import { PrescriptionRule } from '../model/prescriptionRule';
import { addFakeRule, getFakeRulesByPrescriptionId } from './fakeData';

// MANTENHA false para testar a interface.
// Mude para true no dia de gravar o vídeo da FIAP com a API no ar.
const USE_API = true;

const getRulesByPrescriptionId = async (prescricaoId: string): Promise<PrescriptionRule[]> => {
  if (USE_API) {
    // Filho não é aninhado — é filtro (contrato regra 2)
    const response = await apiJava.get(`/regra-prescricao?prescricaoId=${prescricaoId}`);
    return response.data._embedded?.regraPrescricaoResponseList ?? [];
  }
  return getFakeRulesByPrescriptionId(prescricaoId);
};

const createRule = async (regra: PrescriptionRule): Promise<PrescriptionRule> => {
  if (USE_API) {
    const response = await apiJava.post('/regra-prescricao', regra);
    return response.data;
  }
  return addFakeRule(regra);
};

export { getRulesByPrescriptionId, createRule };
