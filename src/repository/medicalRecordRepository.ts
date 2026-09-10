import { apiDotNet } from './apiClient';
import { MedicalRecord } from '../model/medicalRecord';

const getRecordsByPetId = async (animalId: string): Promise<MedicalRecord[]> => {
  const response = await apiDotNet.get(`/animais/${animalId}/registros-atendimento`);
  return response.data;
};

const createRecord = async (record: MedicalRecord): Promise<MedicalRecord> => {
  const response = await apiDotNet.post(`/animais/${record.animalId}/registros-atendimento`, record);
  return response.data;
};

export { getRecordsByPetId, createRecord };
