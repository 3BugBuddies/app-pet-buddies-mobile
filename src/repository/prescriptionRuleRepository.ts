import { apiJava, USE_API } from './apiClient';
import { PrescriptionRule } from '../model/prescriptionRule';
import { addFakeRule, getFakeRulesByPrescriptionId } from './fakeData';


const getRulesByPrescriptionId = async (prescricaoId: string): Promise<PrescriptionRule[]> => {
  if (USE_API) {
    // Filho não é aninhado — é filtro
    const response = await apiJava.get(`/regra-prescricao?prescricaoId=${prescricaoId}`);
    return response.data._embedded?.regraPrescricaoResponseList ?? [];
  }
  return getFakeRulesByPrescriptionId(prescricaoId);
};

// ordem é 1-based (posição da regra na lista)
const createRule = async (regra: PrescriptionRule & { ordem: number }): Promise<PrescriptionRule> => {
  if (USE_API) {
    const payload = {
      prescricaoId: Number(regra.prescricaoId),
      condicaoClinicaId: Number(regra.condicaoClinicaId),
      // O rótulo não é enviado: a API o congela a partir da condição clínica.
      operador: regra.operador ?? undefined,
      limite: regra.limite ?? undefined,
      acaoDose: regra.acao,
      ordem: regra.ordem,
    };
    const response = await apiJava.post('/regra-prescricao', payload);
    return response.data;
  }
  return addFakeRule(regra);
};

export { getRulesByPrescriptionId, createRule };
