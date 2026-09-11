import { apiJava } from './apiClient';
import type {
  Badge,
  CarePlan,
  CareScore,
  CheckInEscalationResult,
  CheckInInterpretation,
  CheckInResult,
} from '../model/care';

const getPlan = async (petId: string): Promise<CarePlan> => {
  const response = await apiJava.get(`/plano-cuidado/${petId}`);
  const data = response.data;
  // Spring HATEOAS: tarefas podem vir em _embedded.tasks
  if (data._embedded?.tasks) {
    return { ...data, tasks: data._embedded.tasks };
  }
  return data;
};

// Assinatura atualizada para incluir petId, exigido pelo endpoint PATCH da API.
const toggleTask = async (petId: string, taskId: string): Promise<void> => {
  await apiJava.patch(`/plano-cuidado/${petId}/tarefas/${taskId}`);
};

const confirmCheckIn = async (params: { interpretation: CheckInInterpretation }): Promise<CheckInResult> => {
  const response = await apiJava.post('/checkin/confirmar', params);
  return response.data;
};

const getEscalationPreview = async (): Promise<CheckInEscalationResult> => {
  const response = await apiJava.get('/checkin/escalation-preview');
  return response.data;
};

const completeCheckInTask = async (petId: string, taskId: string): Promise<void> => {
  await apiJava.post(`/plano-cuidado/${petId}/tarefas/${taskId}/concluir`);
};

const getScore = async (petId: string): Promise<CareScore> => {
  const response = await apiJava.get(`/pontuacao/${petId}`);
  return response.data;
};

const getBadges = async (petId: string): Promise<Badge[]> => {
  const response = await apiJava.get(`/badges/${petId}`);
  // Spring HATEOAS — nome da coleção depende do entity name no Java
  return response.data._embedded?.badges ?? response.data._embedded?.badgeList ?? [];
};

export {
  getPlan,
  toggleTask,
  confirmCheckIn,
  getEscalationPreview,
  completeCheckInTask,
  getScore,
  getBadges,
};
