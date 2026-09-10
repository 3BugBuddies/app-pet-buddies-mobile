import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import type { Appointment, CreateAppointmentInput } from '../model/appointment';

// Enquanto o backend da faculdade nao esta pronto, deixamos USE_API em false.
// Quando o backend estiver no ar, basta trocar para true.
const USE_API = false;

const api = axios.create({
  baseURL: 'http://meubackend/api/consultas',
});

const APPOINTMENTS_KEY = 'APPOINTMENTS';

const initialAppointments: Appointment[] = [
  { id: 'appt-thor', petId: 'pet-thor', vetId: 'vet-1', date: '2026-09-11T09:00:00', reason: 'Retorno pós-cirúrgico', status: 'CONFIRMED' },
  { id: 'appt-mel', petId: 'pet-mel', vetId: 'vet-1', date: '2026-09-11T09:45:00', reason: 'Encerramento do plano', status: 'COMPLETED' },
  { id: 'appt-1', petId: 'pet-luna', vetId: 'vet-1', date: '2026-09-11T10:30:00', reason: 'Vacina V10 · reforço', status: 'CONFIRMED' },
  { id: 'appt-bento', petId: 'pet-bento', vetId: 'vet-1', date: '2026-09-11T11:15:00', reason: 'Primeira consulta', status: 'CONFIRMED' },
];

const saveLocalList = (list: Appointment[]) => {
  AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(list));
};

const loadLocalList = async (): Promise<Appointment[]> => {
  try {
    const strList = await AsyncStorage.getItem(APPOINTMENTS_KEY);
    if (strList != null) return JSON.parse(strList);
    saveLocalList(initialAppointments);
    return initialAppointments;
  } catch (err: any) {
    console.log('Erro ao carregar consultas: ' + err.message);
    return initialAppointments;
  }
};

const getAllAppointments = async (): Promise<Appointment[]> => {
  if (USE_API) {
    try {
      const response = await api.get('/consultas');
      return response.data;
    } catch (err: any) {
      console.log('Erro ao buscar consultas na API, usando dados locais: ' + err.message);
      return await loadLocalList();
    }
  }
  return await loadLocalList();
};

const getAppointmentById = async (id: string): Promise<Appointment | undefined> => {
  const list = await getAllAppointments();
  return list.find((appointment) => appointment.id === id);
};

const createAppointment = async (payload: CreateAppointmentInput): Promise<Appointment> => {
  const novaConsulta: Appointment = {
    id: `appt-${Date.now()}`,
    vetId: 'vet-1',
    status: 'CONFIRMED',
    ...payload,
  };
  if (USE_API) {
    try {
      const response = await api.post('/consultas', novaConsulta);
      return response.data;
    } catch (err: any) {
      console.log('Erro ao criar consulta na API, salvando localmente: ' + err.message);
    }
  }
  const list = await loadLocalList();
  const newList = [...list, novaConsulta];
  saveLocalList(newList);
  return novaConsulta;
};

const updateAppointment = async (
  id: string,
  payload: Partial<CreateAppointmentInput>
): Promise<Appointment> => {
  const list = await loadLocalList();
  const atual = list.find((appointment) => appointment.id === id);
  if (!atual) {
    throw new Error('Consulta não encontrada');
  }
  const atualizada = { ...atual, ...payload };
  if (USE_API) {
    try {
      const response = await api.put(`/consultas/${id}`, payload);
      return response.data;
    } catch (err: any) {
      console.log('Erro ao atualizar consulta na API, atualizando localmente: ' + err.message);
    }
  }
  const newList = list.map((appointment) => (appointment.id === id ? atualizada : appointment));
  saveLocalList(newList);
  return atualizada;
};

// Marca/desmarca a consulta como atendida. Alterna entre CONFIRMED (aguardando)
// e COMPLETED (atendida) — toque na linha da Agenda.
const toggleAttendance = async (id: string): Promise<void> => {
  const list = await loadLocalList();
  const newList = list.map((appointment) =>
    appointment.id === id
      ? { ...appointment, status: appointment.status === 'COMPLETED' ? ('CONFIRMED' as const) : ('COMPLETED' as const) }
      : appointment
  );
  saveLocalList(newList);
};

const deleteAppointment = async (id: string): Promise<void> => {
  const list = await loadLocalList();
  const newList = list.filter((appointment) => appointment.id !== id);
  saveLocalList(newList);
};

export {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  toggleAttendance,
  deleteAppointment,
};
