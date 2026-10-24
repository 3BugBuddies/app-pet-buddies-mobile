import { isAxiosError } from 'axios';
import { apiJava, USE_API } from './apiClient';
import type { ClinicPatient, PlanSummary } from '../model/patient';
import { isoLocal } from './appointmentRepository';

interface PlanEventDto {
  id: number;
  nome: string;
  dataAlvo: string;
  status: string;
}

interface PlanDto {
  categoria: PlanSummary['category'];
  eventos?: PlanEventDto[] | null;
  tratamentoSuspenso?: { medicamento: string; em: string } | null;
}

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
const getPlanSummary = async (petId: string): Promise<PlanSummary | null> => {
  if (!USE_API) return null;
  try {
    const { data } = await apiJava.get<PlanDto>(`/motor/plano/${petId}`);
    const eventos = data.eventos ?? [];
    const hoje = isoLocal(new Date());
    const upcoming = eventos
      .filter((e) => e.status === 'PENDENTE' && e.dataAlvo >= hoje)
      .sort((a, b) => a.dataAlvo.localeCompare(b.dataAlvo))
      .map((e) => ({ id: String(e.id), name: e.nome, targetDate: e.dataAlvo }));
    const datas = eventos.map((e) => e.dataAlvo).sort();
    return {
      category: data.categoria,
      upcoming,
      lastDate: datas.length > 0 ? datas[datas.length - 1] : null,
      suspendedTreatment: data.tratamentoSuspenso ?? null,
    };
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
};

export { getClinicPatients, getPlanSummary };
