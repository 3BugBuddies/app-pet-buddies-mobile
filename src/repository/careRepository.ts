import { apiJava } from './apiClient';
import type {
  Badge,
  CarePlan,
  CareHistoryItem,
  CareScore,
  CheckInEscalationResult,
  CheckinExtracaoRequest,
  CheckinExtracaoResponse,
  CheckInRequest,
  CheckInResult,
} from '../model/care';
import {
  FAKE_BADGES,
  FAKE_SCORE,
  fakePlanToggleTask,
  getFakeCarePlan,
} from './fakeData';

// MANTENHA false para testar a interface.
// Mude para true no dia de gravar o vídeo da FIAP com a API no ar.
const USE_API = true;

const getPlan = async (petId: string): Promise<CarePlan> => {
  if (USE_API) {
    const response = await apiJava.get(`/motor/plano/${petId}`);
    const data = response.data;

    const eventos: any[] = data.eventos || [];
    const hoje = new Date().toISOString().slice(0, 10);

    // tasks = eventos de hoje, cada evento vira um CareTask
    const tasks = eventos
      .filter((e: any) => e.dataAlvo === hoje)
      .map((e: any) => ({
        id: String(e.id),
        title: e.nome,
        description: e.tipo === 'MEDICACAO' ? 'Medicação prescrita' : e.tipo,
        time: 'conforme prescrição',
        points: 10,
        completed: e.status === 'CONCLUIDO',
      }));

    // weekDays = próximos 7 dias a partir de hoje com dot se houver evento
    const diasComEvento = new Set(eventos.map((e: any) => e.dataAlvo));
    const DIAS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
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
    const datas = eventos.map((e: any) => e.dataAlvo).sort();
    const totalWeeks = datas.length > 0
      ? Math.max(1, Math.ceil(
          (new Date(datas[datas.length - 1]).getTime() - new Date(datas[0]).getTime()) / 86400000 / 7
        ) + 1)
      : 1;

    // Mapeia o histórico diário
    const history: CareHistoryItem[] = eventos
      .filter((e: any) => e.dataAlvo <= hoje)
      .sort((a: any, b: any) => b.dataAlvo.localeCompare(a.dataAlvo))
      .map((e: any) => {
        const [ano, mes, dia] = e.dataAlvo.split('-');
        const dataAlvo = new Date(`${e.dataAlvo}T00:00:00`);
        const diffDias = Math.floor((dataAlvo.getTime() - instancia.getTime()) / 86400000) + 1;

        return {
          id: String(e.id),
          dateIso: e.dataAlvo,
          dateLabel: `${dia}/${mes}`,
          dayLabel: `Dia ${Math.max(1, diffDias)}`,
          title: e.nome,
          completed: e.status === 'CONCLUIDO' || e.status === 'REALIZADO',
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
    };
  }
  return getFakeCarePlan(petId);
};

const toggleTask = async (_petId: string, taskId: string): Promise<void> => {
  // POST /plano-cuidado/.../concluir não existe no backend (contrato seção 8)
  // Conclusão de item é feita via POST /checkin com itemPlanoCuidadoId
  // Aqui mantemos apenas a simulação local
  fakePlanToggleTask(taskId);
};

const confirmCheckIn = async (payload: CheckInRequest): Promise<CheckInResult> => {
  if (USE_API) {
    // Rota correta: POST /checkin (contrato seção 7)
    const response = await apiJava.post('/checkin', payload);
    return response.data;
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

// /checkin/escalation-preview não existe nesta sprint (contrato seção 8)
// Mantém apenas simulação local
const getEscalationPreview = async (): Promise<CheckInEscalationResult> => {
  return {
    status: 'ESCALATION',
    reasonLabel: 'sangue nas fezes',
    ruleDescription: 'sangue nas fezes → sem dose · emergência',
    vetName: 'Dra. Helena',
    vetCrmv: 'CRMV-SP 12.345',
    suggestedSlotLabel: 'hoje 17:40',
  };
};

const completeCheckInTask = async (_petId: string, taskId: string): Promise<void> => {
  // POST /plano-cuidado/.../concluir não existe (contrato seção 8)
  // Item é concluído via POST /checkin com itemPlanoCuidadoId
  // Mantém apenas simulação local
  fakePlanToggleTask(taskId);
};

// /pontuacao/{id} não tem API nesta sprint (contrato seção 8)
// Mantém apenas simulação local
const getScore = async (_petId: string): Promise<CareScore> => {
  return FAKE_SCORE;
};

// /badges/{id} não tem API nesta sprint (contrato seção 8)
// Mantém apenas simulação local
const getBadges = async (_petId: string): Promise<Badge[]> => {
  return FAKE_BADGES;
};

// Passo 1 do check-in narrado: envia a narrativa, recebe o que a IA entendeu.
// Resposta é corpo cru — sem envelope HATEOAS (contrato seção 5).
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
  getEscalationPreview,
  completeCheckInTask,
  getScore,
  getBadges,
  extractCheckIn,
};
