import { apiJava, USE_API } from './apiClient';
import { CONDICOES_CLINICAS, type CondicaoClinica } from '../model/prescriptionRule';

// Catálogo de condições clínicas da clínica: alimenta as regras da prescrição e traduz os ids
// que a IA devolve em rótulos legíveis.
const getCondicoesClinicas = async (): Promise<CondicaoClinica[]> => {
  if (USE_API) {
    const response = await apiJava.get('/condicao-clinica');
    const lista: any[] = response.data._embedded?.condicaoClinicaResponseList ?? [];
    return lista
      .filter((c) => c.ativo !== false)
      .map((c) => ({
        id: Number(c.id),
        codigo: c.codigo,
        rotulo: c.rotulo,
        tipoDado: c.tipoDado === 'NUMERICO' ? 'NUMERICO' : 'BOOLEANO',
        unidade: c.unidade ?? null,
      }));
  }
  return CONDICOES_CLINICAS;
};

export { getCondicoesClinicas };
