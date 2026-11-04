import type { LancamentoPontos, MemoriaPontos, SaldoPontos } from '../model/pontuacao';
import { lerExtrato, lerMemoria, lerSaldo } from '../model/pontuacaoApi';
import { pontosModo } from '../model/pontuacaoConfig';
import { apiJava } from './apiClient';
import * as exemplo from './pontuacaoMock';

// Os pontos moram no .NET; o app pede ao Java, que busca lá com o token de quem pediu.
// Saldo e extrato são só do tutor; a memória de cálculo o vet também lê. Com
// EXPO_PUBLIC_PONTOS=mock, as três funções devolvem dados de exemplo e não chamam nada.

const getSaldo = async (): Promise<SaldoPontos> => {
  if (pontosModo === 'mock') return exemplo.getSaldo();
  const { data } = await apiJava.get('/pontuacao/saldo');
  return lerSaldo(data);
};

// Do mais recente ao mais antigo. Os animalIds só servem ao exemplo, para o extrato usar os pets reais.
const getExtrato = async (animalIds: number[]): Promise<LancamentoPontos[]> => {
  if (pontosModo === 'mock') return exemplo.getExtrato(animalIds);
  const { data } = await apiJava.get('/pontuacao/extrato');
  return lerExtrato(data);
};

const getMemoria = async (consultaId: number): Promise<MemoriaPontos> => {
  if (pontosModo === 'mock') return exemplo.getMemoria(consultaId);
  const { data } = await apiJava.get(`/pontuacao/consulta/${consultaId}/memoria`);
  return lerMemoria(data);
};

export { getExtrato, getMemoria, getSaldo };
