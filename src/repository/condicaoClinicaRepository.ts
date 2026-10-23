import { isAxiosError } from 'axios';
import { apiJava, USE_API } from './apiClient';
import { CONDICOES_CLINICAS, derivarCodigo, type CondicaoClinica } from '../model/prescriptionRule';

interface NovaCondicao {
  rotulo: string;
  tipoDado: 'BOOLEANO' | 'NUMERICO';
  unidade?: string | null;
  clinicaId: number;
  veterinarioAutorId: number;
}

const mapCondicao = (c: any): CondicaoClinica => ({
  id: Number(c.id),
  codigo: c.codigo,
  rotulo: c.rotulo,
  tipoDado: c.tipoDado === 'NUMERICO' ? 'NUMERICO' : 'BOOLEANO',
  unidade: c.unidade ?? null,
  critica: c.critica === true,
});

// A clínica da vet logada vem do cadastro dela (GET /veterinario/{id}).
const getClinicaIdDoVeterinario = async (veterinarioId: number | string): Promise<number | null> => {
  if (!USE_API) return null;
  const response = await apiJava.get(`/veterinario/${veterinarioId}`);
  return response.data?.clinicaId != null ? Number(response.data.clinicaId) : null;
};

// Catálogo de condições da clínica: alimenta a busca das regras e traduz os ids da IA em rótulos.
const getCondicoesClinicas = async (clinicaId: number | null): Promise<CondicaoClinica[]> => {
  if (USE_API) {
    const response = await apiJava.get(`/condicao-clinica?clinicaId=${clinicaId}`);
    const lista: any[] = response.data._embedded?.condicaoClinicaResponseList ?? [];
    return lista.filter((c) => c.ativo !== false).map(mapCondicao);
  }
  return CONDICOES_CLINICAS;
};

// Código duplicado na clínica (409) = a condição já existe: busca na lista e usa.
const createCondicaoClinica = async (nova: NovaCondicao): Promise<CondicaoClinica> => {
  const rotulo = nova.rotulo.trim();
  const codigo = derivarCodigo(rotulo);
  if (!USE_API) {
    return { id: Date.now(), codigo, rotulo, tipoDado: nova.tipoDado, unidade: nova.unidade ?? null, critica: false };
  }
  try {
    const response = await apiJava.post('/condicao-clinica', {
      codigo,
      rotulo,
      tipoDado: nova.tipoDado,
      fonteValor: 'RELATO',
      unidade: nova.tipoDado === 'NUMERICO' ? nova.unidade?.trim() || undefined : undefined,
      critica: false,
      ativo: true,
      clinicaId: nova.clinicaId,
      veterinarioAutorId: nova.veterinarioAutorId,
    });
    return mapCondicao(response.data);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 409) {
      const existentes = await getCondicoesClinicas(nova.clinicaId);
      const existente = existentes.find((c) => c.codigo === codigo);
      if (existente) return existente;
    }
    throw error;
  }
};

export { getClinicaIdDoVeterinario, getCondicoesClinicas, createCondicaoClinica };
export type { NovaCondicao };
