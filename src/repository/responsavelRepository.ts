import { apiJava } from './apiClient';
import type { Responsavel } from '../model/account';

interface ResponsavelUpdate {
  nome: string;
  telefone: string;
  email: string;
  endereco?: string;
}

const getResponsavel = async (id: string): Promise<Responsavel> => {
  const resposta = await apiJava.get<Responsavel>(`/responsavel/${id}`);
  return resposta.data;
};

const updateResponsavel = async (id: string, dados: ResponsavelUpdate): Promise<Responsavel> => {
  const resposta = await apiJava.put<Responsavel>(`/responsavel/${id}`, dados);
  return resposta.data;
};

const changePassword = async (senhaAtual: string, senhaNova: string): Promise<void> => {
  await apiJava.post('/auth/senha', { senhaAtual, senhaNova });
};

export { getResponsavel, updateResponsavel, changePassword };
