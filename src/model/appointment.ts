// Campos baseados em T_PB_CONSULTA (schema-sprint-3-08.md). Sem Yup ainda:
// nenhuma tela monta um formulario de agendamento (useCreateAppointment
// existe no control mas nao tem consumidor); adiciona validacao quando essa
// tela nascer.
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED';

export interface Appointment {
  id: string;
  petId: string;
  vetId: string;
  date: string;
  reason: string;
  status: AppointmentStatus;
}

export interface CreateAppointmentInput {
  petId: string;
  date: string;
  reason: string;
}
