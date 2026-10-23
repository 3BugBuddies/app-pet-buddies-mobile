import { apiJava, USE_API } from './apiClient';
import type { OpenPlanItem } from '../model/closing';

interface PlanItemDto {
  id: number;
  tipo: string;
  nome: string;
  dataAlvo: string;
  vencido?: boolean;
}

interface ItemsPageDto {
  content?: PlanItemDto[];
}

// tipo repetido na URL: o axios serializaria o array como tipo[]=..., que o Spring não liga.
const getOpenPreventiveItems = async (animalId: string): Promise<OpenPlanItem[]> => {
  if (!USE_API) return [];
  const response = await apiJava.get<ItemsPageDto>(
    `/motor/plano/${animalId}/eventos?tipo=VACINACAO&tipo=VERMIFUGACAO&abertos=true&size=50`
  );
  return (response.data.content ?? []).flatMap((item) =>
    item.tipo === 'VACINACAO' || item.tipo === 'VERMIFUGACAO'
      ? [{ id: item.id, tipo: item.tipo, nome: item.nome, dataAlvo: item.dataAlvo, vencido: !!item.vencido }]
      : []
  );
};

export { getOpenPreventiveItems };
