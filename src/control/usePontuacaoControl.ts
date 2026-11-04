import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useCallback } from 'react';
import { pontosAtivos, pontosModo } from '../model/pontuacaoConfig';
import type { StatusPontosConsulta } from '../model/pontuacao';
import { getExtrato, getMemoria, getSaldo } from '../repository/pontuacaoRepository';
import { usePets } from './usePetsControl';

const PONTUACAO_KEY = 'pontuacao';

// Memória ainda não existe: o Java responde 404 enquanto o envio ao .NET roda em segundo plano.
const naoEncontrada = (error: unknown) => isAxiosError(error) && error.response?.status === 404;

// O saldo muda quando o vet fecha uma consulta, e as abas do tutor ficam montadas: sem isso, ele só
// veria o saldo novo reabrindo o app. Busca de novo quando a tela ganha foco; cancelRefetch: false
// aproveita a busca que já esteja em andamento (a da primeira montagem).
function useAtualizarAoFocar(refetch: (options?: { cancelRefetch?: boolean }) => unknown, habilitado: boolean) {
  useFocusEffect(
    useCallback(() => {
      if (habilitado) refetch({ cancelRefetch: false });
    }, [refetch, habilitado])
  );
}

// Saldo do tutor logado: soma de todos os pets dele.
export function useSaldo() {
  const query = useQuery({
    queryKey: [PONTUACAO_KEY, 'saldo'],
    queryFn: getSaldo,
    enabled: pontosAtivos,
    retry: false,
  });
  useAtualizarAoFocar(query.refetch, pontosAtivos);
  return query;
}

// O extrato traz o animalId; os pets do tutor resolvem o nome na tela. Só o exemplo precisa dos ids
// antes de buscar; no modo api o extrato não espera os pets.
export function useExtrato() {
  const { data: pets } = usePets();
  const animalIds = (pets ?? []).map((p) => Number(p.id)).filter((id) => Number.isFinite(id));
  const doExemplo = pontosModo === 'mock';
  const habilitado = pontosAtivos && (!doExemplo || pets !== undefined);
  const query = useQuery({
    queryKey: [PONTUACAO_KEY, 'extrato', doExemplo ? animalIds : null],
    queryFn: () => getExtrato(animalIds),
    enabled: habilitado,
    retry: false,
  });
  useAtualizarAoFocar(query.refetch, habilitado);
  return query;
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
