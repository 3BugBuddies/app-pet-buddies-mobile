import { apiDotNet } from './apiClient';
import { Prescription } from '../model/prescription';

const getPrescriptionsByAnimalId = async (animalId: string): Promise<Prescription[]> => {
  const response = await apiDotNet.get(`/animais/${animalId}/prescricoes`);
  return response.data;
};

// Prescrição é imutável (T_PB_PRESCRICAO): não existe PUT. "Editar" cria uma nova
// prescrição com materialOrigemId apontando para a original.
const createPrescription = async (prescription: Prescription): Promise<Prescription> => {
  const response = await apiDotNet.post(`/animais/${prescription.animalId}/prescricoes`, prescription);
  return response.data;
};

export { getPrescriptionsByAnimalId, createPrescription };
