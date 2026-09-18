import { apiJava } from './apiClient';
import type { Appointment, CreateAppointmentInput } from '../model/appointment';
import {
  addFakeAppointment,
  deleteFakeAppointment,
  getFakeAppointments,
  updateFakeAppointment,
} from './fakeData';

// MANTENHA false para testar a interface.
// Mude para true no dia de gravar o vídeo da FIAP com a API no ar.
const USE_API = true;

// Converte o enum de status do backend (PT) para o tipo interno do app (EN)
function mapStatus(backendStatus: string): Appointment['status'] {
  switch (backendStatus) {
    case 'CONFIRMADA': return 'CONFIRMED';
    case 'REALIZADA':  return 'COMPLETED';
    case 'CANCELADA':
    case 'NAO_COMPARECEU': return 'CANCELED';
    default: return 'SCHEDULED'; // AGENDADA e qualquer valor desconhecido
  }
}

// Deriva o tipo de consulta (enum do backend) a partir do motivo textual vindo da UI
function deriveType(reason: string): string {
  const r = reason.toLowerCase();
  if (r.includes('vacinação') || r.includes('vacinacao')) return 'VACINACAO';
  if (r.includes('exame')) return 'EXAME';
  if (r.includes('retorno')) return 'RETORNO';
  if (r.includes('emergência') || r.includes('emergencia') || r.includes('doente')) return 'EMERGENCIA';
  return 'ROTINA';
}

const getAllAppointments = async (
  animalId?: string | number | null
): Promise<Appointment[]> => {
  if (USE_API) {
    let url = '/consulta';
    if (animalId) url = `/consulta?animalId=${animalId}`;
    const response = await apiJava.get(url);
    const list = response.data._embedded?.consultaResponseList ?? [];
    return list.map((c: any) => ({
      id: c.id?.toString() ?? '',
      petId: c.animalId?.toString() ?? '',
      vetId: c.veterinarioId?.toString() ?? '',
      date: c.dataHora,
      reason: c.motivo || '',
      status: mapStatus(c.status),
    }));
  }
  const all = getFakeAppointments();
  if (petId) return all.filter((a) => a.petId === String(petId));
  return all;
};

const getAppointmentById = async (id: string): Promise<Appointment | undefined> => {
  if (USE_API) {
    const response = await apiJava.get(`/consulta/${id}`);
    const c = response.data;
    return {
      id: c.id.toString(),
      petId: c.animalId.toString(),
      vetId: c.veterinarioId.toString(),
      date: c.dataHora,
      reason: c.motivo || '',
      status: mapStatus(c.status),
    };
  }
  return getFakeAppointments().find((a) => a.id === id);
};

const createAppointment = async (payload: CreateAppointmentInput): Promise<Appointment> => {
  if (USE_API) {
    // Backend: POST /consulta/agendamento
    // Campos obrigatórios: animalId, dataHora (via janelaId), motivo, janelaId, tipo
    const response = await apiJava.post('/consulta/agendamento', {
      animalId: Number(payload.petId),
      janelaId: payload.janelaId,
      observacao: payload.reason,
      tipo: deriveType(payload.reason),
    });
    const c = response.data;
    return {
      id: c.id.toString(),
      petId: c.animalId.toString(),
      vetId: c.veterinarioId?.toString() ?? '',
      date: c.dataHora,
      reason: c.motivo || payload.reason,
      status: mapStatus(c.status),
    };
  }
  const nova: Appointment = { id: `appt-${Date.now()}`, vetId: 'vet-1', status: 'SCHEDULED', ...payload };
  return addFakeAppointment(nova);
};

const updateAppointment = async (
  id: string,
  payload: Partial<CreateAppointmentInput>
): Promise<Appointment> => {
  if (USE_API) {
    const response = await apiJava.put(`/consulta/${id}`, payload);
    const c = response.data;
    return {
      id: c.id.toString(),
      petId: c.animalId.toString(),
      vetId: c.veterinarioId?.toString() ?? '',
      date: c.dataHora,
      reason: c.motivo || '',
      status: mapStatus(c.status),
    };
  }
  return updateFakeAppointment(id, payload);
};

// Fecha o atendimento via POST /{id}/fechamento (contrato seção 7 — Vet · fechar atendimento)
const fecharAtendimento = async (id: string, payload: any): Promise<void> => {
  if (USE_API) {
    await apiJava.post(`/consulta/${id}/fechamento`, payload);
    return;
  }
  // Fake behavior
  const appt = getFakeAppointments().find((a) => a.id === id);
  if (appt) {
    updateFakeAppointment(id, { status: 'COMPLETED' } as any);
  }
};


const deleteAppointment = async (id: string, motivo: string = 'Cancelado pelo usuário'): Promise<void> => {
  if (USE_API) {
    // O correto é cancelar, informando o motivo.
    await apiJava.post(`/consulta/${id}/cancelamento`, { motivo });
    return;
  }
  deleteFakeAppointment(id);
};

const toggleAttendance = async (id: string): Promise<void> => {
  return fecharAtendimento(id, {});
};

export interface JanelaAtendimento {
  id: number;
  data: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm:ss
  horaFim: string; // HH:mm:ss
  status: string;
}

const getFreeWindows = async (veterinarioId?: string | number, dataISO?: string): Promise<JanelaAtendimento[]> => {
  if (USE_API) {
    let url = '/janela-atendimento/livres';
    const params = new URLSearchParams();
    if (veterinarioId) params.append('veterinarioId', String(veterinarioId));
    if (dataISO) params.append('data', dataISO);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const response = await apiJava.get(url);
    // Extrai a lista do HATEOAS, ou pega direto se for um array plano
    return response.data._embedded?.janelaAtendimentoResponseList || response.data || [];
  }
  
  const [ano, mes, dia] = (dataISO || new Date().toISOString().slice(0, 10)).split('-');
  return [
    { id: 991, data: dataISO!, horaInicio: '08:00:00', horaFim: '08:30:00', status: 'LIVRE' },
    { id: 992, data: dataISO!, horaInicio: '10:00:00', horaFim: '10:30:00', status: 'LIVRE' },
    { id: 993, data: dataISO!, horaInicio: '15:00:00', horaFim: '15:30:00', status: 'LIVRE' }
  ];
};

export {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  fecharAtendimento,
  toggleAttendance,
  deleteAppointment,
  getFreeWindows,
};
