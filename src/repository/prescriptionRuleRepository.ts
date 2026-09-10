import { apiDotNet } from './apiClient';
import { PrescriptionRule } from '../model/prescriptionRule';

const getRulesByPrescriptionId = async (prescricaoId: string): Promise<PrescriptionRule[]> => {
  const response = await apiDotNet.get(`/prescricoes/${prescricaoId}/regras`);
  return response.data;
};

const createRule = async (regra: PrescriptionRule): Promise<PrescriptionRule> => {
  const response = await apiDotNet.post(`/prescricoes/${regra.prescricaoId}/regras`, regra);
  return response.data;
};

export { getRulesByPrescriptionId, createRule };
