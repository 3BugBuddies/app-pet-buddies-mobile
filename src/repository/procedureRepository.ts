import { apiJava } from './apiClient';
import type { Procedimento } from '../model/procedure';

const USE_API = true;

const FAKE_PROCEDIMENTOS: Procedimento[] = [
  { id: 'proc-1', animalId: 'pet-luna', nome: 'V10 Reforço', tipo: 'VACINACAO', status: 'REALIZADO', dataPrevistaInicio: '2026-03-10' },
  { id: 'proc-2', animalId: 'pet-luna', nome: 'Antirrábica', tipo: 'VACINACAO', status: 'AGENDADO', dataPrevistaInicio: '2026-10-05' },
  { id: 'proc-3', animalId: 'pet-luna', nome: 'Hemograma', tipo: 'EXAME', status: 'REALIZADO', dataPrevistaInicio: '2026-01-20' },
];

const getProceduresByAnimalId = async (animalId: string): Promise<Procedimento[]> => {
  if (USE_API) {
    const response = await apiJava.get(`/procedimento?animalId=${animalId}`);
    const list = response.data._embedded?.procedimentoResponseList ?? [];
    return list.map((p: any) => ({
      id: p.id.toString(),
      animalId: p.animalId.toString(),
      nome: p.nome,
      tipo: p.tipo,
      status: p.status,
      dataPrevistaInicio: p.dataPrevistaInicio ?? null,
      descricao: p.descricao ?? null,
    }));
  }
  return FAKE_PROCEDIMENTOS.filter((p) => p.animalId === animalId);
};

export { getProceduresByAnimalId };
