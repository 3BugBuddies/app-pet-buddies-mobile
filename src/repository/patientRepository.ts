import { apiJava, USE_API } from './apiClient';
import type { ClinicPatient, ResumoPlano } from '../model/patient';

const getClinicPatients = async (): Promise<ClinicPatient[]> => {
  if (!USE_API) return [];
  const response = await apiJava.get('/animal');
  const lista: any[] = response.data._embedded?.animalResponseList ?? [];
  return lista.map((p) => ({
    petId: String(p.id),
    petName: p.nome,
    tutorName: p.responsavelNome ?? undefined,
    endereco: p.responsavelEndereco ?? undefined,
    telefone: p.responsavelTelefone ?? undefined,
  }));
};

// Sem plano ativo a API responde 404: o resumo é null.
const getResumoPlano = async (petId: string): Promise<ResumoPlano | null> => {
  if (!USE_API) return null;
  try {
    const { data } = await apiJava.get(`/motor/plano/${petId}`);
    const eventos: any[] = data.eventos ?? [];
    const agora = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const hoje = `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}`;
    const proximos = eventos
      .filter((e) => e.status === 'PENDENTE' && e.dataAlvo >= hoje)
      .sort((a, b) => String(a.dataAlvo).localeCompare(String(b.dataAlvo)))
      .map((e) => ({ id: String(e.id), nome: e.nome, dataAlvo: e.dataAlvo }));
    const datas = eventos.map((e) => String(e.dataAlvo)).sort();
    return {
      categoria: data.categoria,
      proximos,
      ultimaData: datas.length > 0 ? datas[datas.length - 1] : null,
    };
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
};

export { getClinicPatients, getResumoPlano };
