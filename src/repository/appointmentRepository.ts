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

const getAllAppointments = async (
  petId?: string | number | null,
  veterinarioId?: string | number | null
): Promise<Appointment[]> => {
  if (USE_API) {
    let url = '/consulta';
    if (veterinarioId) url = `/consulta?veterinarioId=${veterinarioId}`;
    else if (petId) url = `/consulta?animalId=${petId}`;
    const response = await apiJava.get(url);
    const list = response.data._embedded?.consultaResponseList ?? [];
    return list.map((c: any) => ({
      id: c.id.toString(),
      petId: c.animalId.toString(),
      vetId: c.veterinarioId.toString(),
      date: c.dataHora,
      reason: c.motivo || '',
      status: c.status,
    }));
  }
  const all = getFakeAppointments();
  if (petId) return all.filter((a) => a.petId === String(petId));
  return all;
};

const getAppointmentById = async (id: string): Promise<Appointment | undefined> => {
  if (USE_API) {
    const response = await apiJava.get(`/consulta/${id}`);
    return response.data;
  }
  return getFakeAppointments().find((a) => a.id === id);
};

const createAppointment = async (payload: CreateAppointmentInput): Promise<Appointment> => {
  if (USE_API) {
    // Agendamento usa rota dedicada (contrato seção 7)
    const response = await apiJava.post('/consulta/agendamento', payload);
    return response.data;
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
    return response.data;
  }
  return updateFakeAppointment(id, payload);
};

// Fecha o atendimento via POST /{id}/fechamento (contrato seção 7 — Vet · fechar atendimento)
const toggleAttendance = async (id: string): Promise<void> => {
  if (USE_API) {
    await apiJava.post(`/consulta/${id}/fechamento`, {});
    return;
  }
  const appt = getFakeAppointments().find((a) => a.id === id);
  if (appt) {
    updateFakeAppointment(id, { status: appt.status === 'CONFIRMED' ? 'COMPLETED' : 'CONFIRMED' } as any);
  }
};

const deleteAppointment = async (id: string): Promise<void> => {
  if (USE_API) {
    await apiJava.delete(`/consulta/${id}`);
    return;
  }
  deleteFakeAppointment(id);
};

export {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  toggleAttendance,
  deleteAppointment,
};
