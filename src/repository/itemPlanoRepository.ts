import { apiJava, USE_API } from './apiClient';
import type { ItemAbertoPlano } from '../model/fechamento';

interface ItemPlanoDto {
  id: number;
  tipo: string;
  nome: string;
  dataAlvo: string;
  vencido?: boolean;
}

interface PaginaItensDto {
  content?: ItemPlanoDto[];
}

// tipo repetido na URL: o axios serializaria o array como tipo[]=..., que o Spring não liga.
const getItensAbertosVacinaVermifugo = async (animalId: string): Promise<ItemAbertoPlano[]> => {
  if (!USE_API) return [];
  const response = await apiJava.get<PaginaItensDto>(
    `/motor/plano/${animalId}/eventos?tipo=VACINACAO&tipo=VERMIFUGACAO&abertos=true&size=50`
  );
  return (response.data.content ?? []).flatMap((item) =>
    item.tipo === 'VACINACAO' || item.tipo === 'VERMIFUGACAO'
      ? [{ id: item.id, tipo: item.tipo, nome: item.nome, dataAlvo: item.dataAlvo, vencido: !!item.vencido }]
      : []
  );
};

export { getItensAbertosVacinaVermifugo };
