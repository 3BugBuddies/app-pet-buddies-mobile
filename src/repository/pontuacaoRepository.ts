import type { LancamentoPontos, MemoriaPontos, SaldoPontos } from '../model/pontuacao';
import { lerExtrato, lerMemoria, lerSaldo } from '../model/pontuacaoApi';
import { apiJava } from './apiClient';

// Os pontos moram no .NET; o app pede ao Java, que busca lá com o token de quem pediu.
// Saldo e extrato são só do tutor; a memória de cálculo o vet também lê.

const getSaldo = async (): Promise<SaldoPontos> => {
  const { data } = await apiJava.get('/pontuacao/saldo');
  return lerSaldo(data);
};

// Do mais recente ao mais antigo.
const getExtrato = async (): Promise<LancamentoPontos[]> => {
  const { data } = await apiJava.get('/pontuacao/extrato');
  return lerExtrato(data);
};

const getMemoria = async (consultaId: number): Promise<MemoriaPontos> => {
  const { data } = await apiJava.get(`/pontuacao/consulta/${consultaId}/memoria`);
  return lerMemoria(data);
};

export { getExtrato, getMemoria, getSaldo };
