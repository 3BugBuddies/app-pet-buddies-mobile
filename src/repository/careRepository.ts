import { isAxiosError } from 'axios';
import { apiJava, USE_API } from './apiClient';
import type {
  CarePlan,
  CareHistoryItem,
  CareItem,
  StatusItem,
  CheckInEscalationResult,
  CheckinExtracaoRequest,
  CheckinExtracaoResponse,
  CheckinResponse,
  ConfirmCheckInInput,
  CheckInResult,
} from '../model/care';
import { isStatusConcluido } from '../model/care';
import { resolveCheckInResponse } from '../model/careRules';
import {
  fakePlanToggleTask,
  getFakeCarePlan,
} from './fakeData';


// Data local no formato AAAA-MM-DD (toISOString usaria UTC e viraria o dia à noite no Brasil).
const isoLocal = (d: Date): string => {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
};

interface ItemPlanoApi {
  id: number;
  tipo: string;
  nome: string;
  dataAlvo: string;
  status: StatusItem;
  origem?: string | null;
  vencido?: boolean;
}

interface PlanoApi {
  instanciadoEm?: string | null;
  eventos?: ItemPlanoApi[] | null;
}

// Plano inexistente (404) não é erro: o pet ainda não tem plano.
const getPlan = async (petId: string): Promise<CarePlan | null> => {
  if (USE_API) {
    let data: PlanoApi;
    try {
      const response = await apiJava.get<PlanoApi>(`/motor/plano/${petId}`);
      data = response.data;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }

    const eventos = data.eventos ?? [];
    const hoje = isoLocal(new Date());

    // tasks = eventos de hoje, cada evento vira um CareTask
    const tasks = eventos
      .filter((e) => e.dataAlvo === hoje)
      .map((e) => ({
        id: String(e.id),
        title: e.nome,
        description: e.tipo === 'MEDICACAO' ? 'Medicação prescrita' : e.tipo,
        time: 'conforme prescrição',
        points: 10,
        completed: isStatusConcluido(e.status),
      }));

    // weekDays = próximos 7 dias a partir de hoje com dot se houver evento
    const diasComEvento = new Set(eventos.map((e) => e.dataAlvo));
    const DIAS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = isoLocal(d);
      return {
        label: DIAS_PT[d.getDay()],
        dayNumber: d.getDate(),
        isActive: iso === hoje,
        dotColor: (diasComEvento.has(iso) ? 'CUIDADO' : 'NONE') as 'CUIDADO' | 'NONE',
      };
    });

    // semana: conta quantas semanas desde instanciadoEm
    const instancia = data.instanciadoEm ? new Date(data.instanciadoEm) : new Date();
    const diffDias = Math.floor((Date.now() - instancia.getTime()) / 86400000);
    const currentWeekNumber = Math.max(1, Math.ceil((diffDias + 1) / 7));

    // total de semanas = span de datas nos eventos
    const datas = eventos.map((e) => e.dataAlvo).sort();
    const totalWeeks = datas.length > 0
      ? Math.max(1, Math.ceil(
          (new Date(datas[datas.length - 1]).getTime() - new Date(datas[0]).getTime()) / 86400000 / 7
        ) + 1)
      : 1;

    // Mapeia o histórico diário
    const history: CareHistoryItem[] = eventos
      .filter((e) => e.dataAlvo <= hoje)
      .sort((a, b) => b.dataAlvo.localeCompare(a.dataAlvo))
      .map((e) => {
        const [, mes, dia] = e.dataAlvo.split('-');
        const dataAlvo = new Date(`${e.dataAlvo}T00:00:00`);
        const diffDias = Math.floor((dataAlvo.getTime() - instancia.getTime()) / 86400000) + 1;

        return {
          id: String(e.id),
          dateIso: e.dataAlvo,
          dateLabel: `${dia}/${mes}`,
          dayLabel: `Dia ${Math.max(1, diffDias)}`,
          title: e.nome,
          completed: isStatusConcluido(e.status),
        };
      });

    const items: CareItem[] = [...eventos]
      .sort((a, b) => a.dataAlvo.localeCompare(b.dataAlvo))
      .map((e) => {
        const [ano, mes, dia] = e.dataAlvo.split('-');
        return {
          id: String(e.id),
          title: e.nome,
          dateIso: e.dataAlvo,
          dateLabel: `${dia}/${mes}/${ano}`,
          tipo: e.tipo,
          status: e.status,
          vencido: e.vencido ?? false,
          tratamento: e.origem === 'PRESCRICAO' || e.tipo === 'MEDICACAO',
        };
      });

    return {
      petId,
      weekLabel: `Semana ${currentWeekNumber}`,
      weekDays,
      tasks,
      currentWeekNumber,
      totalWeeks,
      milestones: [],
      history,
      items,
    };
  }
  return getFakeCarePlan(petId);
};

const toggleTask = async (_petId: string, taskId: string): Promise<void> => {
  // POST /plano-cuidado/.../concluir não existe no backend
  // Conclusão de item é feita via POST /checkin com itemPlanoCuidadoId
  // Aqui mantemos apenas a simulação local
  fakePlanToggleTask(taskId);
};

const confirmCheckIn = async ({ payload, redFlags }: ConfirmCheckInInput): Promise<CheckInResult> => {
  if (USE_API) {
    // Rota correta: POST /checkin
    const response = await apiJava.post<CheckinResponse>('/checkin', payload);
    return resolveCheckInResponse(response.data, redFlags);
  }
  const hoje = new Date().toLocaleDateString('pt-BR');
  return {
    status: 'DOSE',
    doseLabel: '5 mg',
    doseRangeLabel: '5 – 10 mg',
    ruleDescription: 'dose padrão — nenhuma condição de alerta relatada',
    ruleConfirmedAtLabel: hoje,
    vetName: 'Dra. Ana Souza',
    vetCrmv: 'CRMV-SP 12345',
    prescriptionDateLabel: hoje,
    pointsEarned: 0,
  };
};

// Passo 1 do check-in narrado: envia a narrativa, recebe o que a IA entendeu.
// Resposta é corpo cru — sem envelope HATEOAS.
const extractCheckIn = async (data: CheckinExtracaoRequest): Promise<CheckinExtracaoResponse> => {
  if (USE_API) {
    const response = await apiJava.post('/checkin/extracao', data);
    return response.data;
  }
  return {
    animalId: data.animalId,
    dataReferencia: data.dataReferencia,
    narrativa: data.narrativa,
    condicoes: [{ condicaoClinicaId: 1, valorBooleano: true, confianca: 0.9 }],
    redFlags: [],
    degradado: false,
  };
};

export {
  getPlan,
  toggleTask,
  confirmCheckIn,
  extractCheckIn,
};
