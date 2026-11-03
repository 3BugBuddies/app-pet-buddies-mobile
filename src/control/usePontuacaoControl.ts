import { useQuery } from '@tanstack/react-query';
import { pontosAtivos } from '../model/pontuacaoConfig';
import type { StatusPontosConsulta } from '../model/pontuacao';
import { getExtrato, getMemoria, getSaldo } from '../repository/pontuacaoRepository';
import { usePets } from './usePetsControl';

const PONTUACAO_KEY = 'pontuacao';

// Saldo do tutor logado: soma de todos os pets dele.
export function useSaldo() {
  return useQuery({
    queryKey: [PONTUACAO_KEY, 'saldo'],
    queryFn: getSaldo,
    enabled: pontosAtivos,
    retry: false,
  });
}

// O extrato traz o animalId; os pets do tutor resolvem o nome na tela.
export function useExtrato() {
  const { data: pets } = usePets();
  const animalIds = (pets ?? []).map((p) => Number(p.id)).filter((id) => Number.isFinite(id));
  return useQuery({
    queryKey: [PONTUACAO_KEY, 'extrato', animalIds],
    queryFn: () => getExtrato(animalIds),
    enabled: pontosAtivos && pets !== undefined,
    retry: false,
  });
}

// Memória de cálculo de uma consulta. `tentativas` cobre o 404 de logo após o fechamento, quando o
// envio ao .NET ainda roda em segundo plano.
export function useMemoriaConsulta(consultaId: number | null, options?: { enabled?: boolean; tentativas?: number }) {
  return useQuery({
    queryKey: [PONTUACAO_KEY, 'memoria', consultaId],
    queryFn: () => getMemoria(consultaId as number),
    enabled: pontosAtivos && consultaId != null && (options?.enabled ?? true),
    retry: options?.tentativas ?? 0,
    retryDelay: 1500,
  });
}

// Estado do bloco de pontos no atendimento concluído (lado do vet).
export function usePontosDaConsulta(consultaId: string | null) {
  const id = consultaId != null && Number.isFinite(Number(consultaId)) ? Number(consultaId) : null;
  const memoria = useMemoriaConsulta(id, { tentativas: 3 });
  const status: StatusPontosConsulta = memoria.data ? 'pronto' : memoria.isError ? 'indisponivel' : 'calculando';
  return { status, memoria: memoria.data };
}
