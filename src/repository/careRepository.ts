import { apiJava } from './apiClient';
import type {
  Badge,
  CarePlan,
  CareScore,
  CheckInEscalationResult,
  CheckInExtracaoRequest,
  CheckInExtracaoResponse,
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
const USE_API = false;

const getPlan = async (petId: string): Promise<CarePlan> => {
  if (USE_API) {
    // Recurso correto: /motor/plano/{animalId} (contrato seção 7)
    const response = await apiJava.get(`/motor/plano/${petId}`);
    const data = response.data;
    // Spring HATEOAS: itens do plano vêm em /eventos — acessa separado se necessário
    if (data._embedded?.tasks) {
      return { ...data, tasks: data._embedded.tasks };
    }
    return data;
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
  // Mock fixo: simula check-in bem-sucedido com dose calculada pela regra da vet
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
    pointsEarned: 10,
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
  // Mock: simula extração bem-sucedida sem red flags
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
