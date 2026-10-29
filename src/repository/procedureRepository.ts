import { apiJava } from './apiClient';
import type { Procedimento } from '../model/procedure';


const getProceduresByAnimalId = async (animalId: string): Promise<Procedimento[]> => {
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
};

export { getProceduresByAnimalId };
