import { apiDotNet } from './apiClient';
import type { Appointment, CreateAppointmentInput } from '../model/appointment';

const getAllAppointments = async (petId?: string): Promise<Appointment[]> => {
  const url = petId ? `/consultas?petId=${petId}` : '/consultas';
  const response = await apiDotNet.get(url);
  return response.data;
};

const getAppointmentById = async (id: string): Promise<Appointment | undefined> => {
  const response = await apiDotNet.get(`/consultas/${id}`);
  return response.data;
};

const createAppointment = async (payload: CreateAppointmentInput): Promise<Appointment> => {
  const response = await apiDotNet.post('/consultas', payload);
  return response.data;
};

const updateAppointment = async (
  id: string,
  payload: Partial<CreateAppointmentInput>
): Promise<Appointment> => {
  const response = await apiDotNet.put(`/consultas/${id}`, payload);
  return response.data;
};

// Alterna CONFIRMED ↔ COMPLETED — resposta da API já traz o status atualizado.
const toggleAttendance = async (id: string): Promise<void> => {
  await apiDotNet.patch(`/consultas/${id}/atendimento`);
};

const deleteAppointment = async (id: string): Promise<void> => {
  await apiDotNet.delete(`/consultas/${id}`);
};

export {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  toggleAttendance,
  deleteAppointment,
};
