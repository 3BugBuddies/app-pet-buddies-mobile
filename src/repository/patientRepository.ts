import { isAxiosError } from 'axios';
import { apiJava, USE_API } from './apiClient';
import type { ClinicPatient, PlanSummary } from '../model/patient';
import { isoLocal } from './appointmentRepository';

interface PlanEventDto {
  id: number;
  nome: string;
  dataAlvo: string;
  status: string;
  origem?: string | null;
}

interface PlanDto {
  categoria: PlanSummary['category'];
  dataFim?: string | null;
  eventos?: PlanEventDto[] | null;
  tratamentos?: { medicamento: string; fim?: string | null }[] | null;
  tratamentoSuspenso?: { medicamento: string; medicamentos?: string[] | null; em: string } | null;
}

const distinct = (names: string[]) => [...new Set(names.filter(Boolean))];

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
    // Os eventos só servem de reserva: back antigo não manda tratamentos[].
    const treatmentNames = data.tratamentos
      ? distinct(data.tratamentos.map((t) => t.medicamento))
      : distinct(eventos.filter((e) => e.origem === 'PRESCRICAO').map((e) => e.nome));
    const lastEnd = (data.tratamentos ?? []).map((t) => t.fim ?? '').sort().pop();
    const suspended = data.tratamentoSuspenso;
    return {
      category: data.categoria,
      upcoming,
      endDate: lastEnd || (data.dataFim ?? null),
      treatmentNames,
      suspendedTreatment: suspended
        ? {
            medicamentos: suspended.medicamentos?.length ? suspended.medicamentos : [suspended.medicamento],
            em: suspended.em,
          }
        : null,
    };
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
};

export { getClinicPatients, getPlanSummary };
