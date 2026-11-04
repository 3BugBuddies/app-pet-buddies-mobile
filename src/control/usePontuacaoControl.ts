import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { pontosAtivos, pontosModo } from '../model/pontuacaoConfig';
import type { StatusPontosConsulta } from '../model/pontuacao';
import { getExtrato, getMemoria, getSaldo } from '../repository/pontuacaoRepository';
import { usePets } from './usePetsControl';

const PONTUACAO_KEY = 'pontuacao';

// Memória ainda não existe: o Java responde 404 enquanto o envio ao .NET roda em segundo plano.
const naoEncontrada = (error: unknown) => isAxiosError(error) && error.response?.status === 404;

// Saldo do tutor logado: soma de todos os pets dele.
export function useSaldo() {
  return useQuery({
    queryKey: [PONTUACAO_KEY, 'saldo'],
    queryFn: getSaldo,
    enabled: pontosAtivos,
    retry: false,
  });
}

// O extrato traz o animalId; os pets do tutor resolvem o nome na tela. Só o exemplo precisa dos ids
// antes de buscar; no modo api o extrato não espera os pets.
export function useExtrato() {
  const { data: pets } = usePets();
  const animalIds = (pets ?? []).map((p) => Number(p.id)).filter((id) => Number.isFinite(id));
  const doExemplo = pontosModo === 'mock';
  return useQuery({
    queryKey: [PONTUACAO_KEY, 'extrato', doExemplo ? animalIds : null],
    queryFn: () => getExtrato(animalIds),
    enabled: pontosAtivos && (!doExemplo || pets !== undefined),
    retry: false,
  });
}

// Memória de cálculo de uma consulta. `tentativas` cobre o 404 de logo após o fechamento; só o 404
// é refeito, qualquer outro erro encerra na hora.
export function useMemoriaConsulta(
  consultaId: number | null,
  options?: { enabled?: boolean; tentativas?: number; intervalo?: number }
) {
  return useQuery({
    queryKey: [PONTUACAO_KEY, 'memoria', consultaId],
    queryFn: () => getMemoria(consultaId as number),
    enabled: pontosAtivos && consultaId != null && (options?.enabled ?? true),
    retry: (falhas, error) => falhas < (options?.tentativas ?? 0) && naoEncontrada(error),
    retryDelay: options?.intervalo ?? 1500,
  });
}

// Estado do bloco de pontos no atendimento concluído (lado do vet): 6 tentativas de 2 s, cerca de 12 s,
// para o envio em segundo plano ao .NET terminar antes de o bloco desistir do detalhe.
export function usePontosDaConsulta(consultaId: string | null) {
  const id = consultaId != null && Number.isFinite(Number(consultaId)) ? Number(consultaId) : null;
  const memoria = useMemoriaConsulta(id, { tentativas: 6, intervalo: 2000 });
  const status: StatusPontosConsulta = memoria.data ? 'pronto' : memoria.isError ? 'indisponivel' : 'calculando';
  return { status, memoria: memoria.data };
}
