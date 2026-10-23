import { apiJava, USE_API } from './apiClient';
import type { Appointment, CreateAppointmentInput } from '../model/appointment';
import type { MedicalRecord } from '../model/medicalRecord';
import type { FechamentoPayload } from '../model/fechamento';
import {
  addFakeAppointment,
  addFakePrescription,
  addFakeRule,
  deleteFakeAppointment,
  getFakeAppointments,
  updateFakeAppointment,
} from './fakeData';


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
  animalId?: string | number | null,
  veterinarioId?: string | number | null
): Promise<Appointment[]> => {
  if (USE_API) {
    const response = await apiJava.get('/consulta', {
      params: {
        animalId: animalId || undefined,
        veterinarioId: veterinarioId || undefined,
      },
    });
    const list = response.data._embedded?.consultaResponseList ?? [];
    return list.map((c: any) => ({
      id: c.id?.toString() ?? '',
      petId: c.animalId?.toString() ?? '',
      vetId: c.veterinarioId?.toString() ?? '',
      date: c.dataHora,
      reason: c.observacao || '',
      status: mapStatus(c.status),
      animalNome: c.animalNome ?? null,
      veterinarioNome: c.veterinarioNome ?? null,
    }));
  }
  const all = getFakeAppointments();
  if (animalId) return all.filter((a) => a.petId === String(animalId));
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
      reason: c.observacao || '',
      status: mapStatus(c.status),
      animalNome: c.animalNome ?? null,
      veterinarioNome: c.veterinarioNome ?? null,
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
      reason: c.observacao || payload.reason,
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
      reason: c.observacao || '',
      status: mapStatus(c.status),
    };
  }
  return updateFakeAppointment(id, payload);
};

const pad = (n: number) => String(n).padStart(2, '0');

// Data local AAAA-MM-DD (toISOString usaria UTC e viraria o dia à noite no Brasil).
const isoLocal = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// LocalDateTime do Java, sem fuso: AAAA-MM-DDTHH:mm:ss
const dateTimeLocal = (d: Date): string =>
  `${isoLocal(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

// O app guarda o registro com data pura (AAAA-MM-DD) e campos extras (id, animalId, consultaId).
// O fechamento espera só os campos do RegistroAtendimentoFechamentoRequest, com dataAtendimento
// em LocalDateTime — a data pura faz a API recusar com 400.
const toRegistroFechamento = (registro: MedicalRecord) => ({
  dataAtendimento: registro.dataAtendimento.includes('T')
    ? registro.dataAtendimento
    : `${registro.dataAtendimento}T${dateTimeLocal(new Date()).slice(11)}`,
  anamnese: registro.anamnese ?? undefined,
  diagnostico: registro.diagnostico ?? undefined,
  tratamento: registro.tratamento ?? undefined,
  observacao: registro.observacao ?? undefined,
  proximoRetorno: registro.proximoRetorno ?? undefined,
  proximaVacina: registro.proximaVacina ?? undefined,
});

// Fecha o atendimento via POST /{id}/fechamento (atômico: registro + procedimentos + prescrições).
// A API só fecha consulta AGENDADA ou CONFIRMADA e exige `registroAtendimento`.
const fecharAtendimento = async (id: string, payload: FechamentoPayload): Promise<void> => {
  if (USE_API) {
    await apiJava.post(`/consulta/${id}/fechamento`, {
      registroAtendimento: toRegistroFechamento(payload.registroAtendimento),
      procedimentos: payload.procedimentos,
      prescricoes: payload.prescricoes.map((p) => ({
        ...p,
        regras: p.regras.map(({ rotuloCongelado: _rotulo, ...regra }) => regra),
      })),
    });
    return;
  }
  // Mock: marca a consulta como realizada e guarda as prescrições assinadas (e suas regras).
  const appt = getFakeAppointments().find((a) => a.id === id);
  if (appt) {
    updateFakeAppointment(id, { status: 'COMPLETED' } as any);
  }
  const registro = payload.registroAtendimento;
  payload.prescricoes.forEach((p, i) => {
    const prescricaoId = `presc-${Date.now()}-${i}`;
    addFakePrescription({
      id: prescricaoId,
      medicamento: p.medicamento,
      doseMin: p.doseMin,
      doseMax: p.doseMax,
      unidade: p.unidade,
      frequenciaDia: p.frequenciaDia,
      duracaoDias: p.duracaoDias,
      dataInicio: p.dataInicio,
      orientacao: p.orientacao ?? null,
      materialOrigemId: null,
      versaoOrigem: null,
      animalId: String(registro.animalId ?? appt?.petId ?? ''),
      veterinarioId: appt?.vetId ?? '',
      registroAtendimentoId: registro.id ? String(registro.id) : null,
    });
    p.regras.forEach((r) =>
      addFakeRule({
        id: null,
        prescricaoId,
        condicaoClinicaId: r.condicaoClinicaId,
        rotuloCongelado: r.rotuloCongelado ?? '',
        acao: r.acaoDose,
        operador: r.operador ?? null,
        limite: r.limite ?? null,
      })
    );
  });
};

// Cancela por POST /{id}/cancelamento: guarda o motivo e libera a janela. O DELETE apagaria o
// histórico e dá 409 se a consulta já tiver registro ou plano.
const deleteAppointment = async (id: string, motivo: string): Promise<void> => {
  if (USE_API) {
    await apiJava.post(`/consulta/${id}/cancelamento`, { motivo });
    return;
  }
  deleteFakeAppointment(id);
};

// Consulta ainda aberta (agendada/confirmada) do paciente para hoje, se houver.
const findTodaysOpenAppointment = async (
  animalId: string,
  veterinarioId?: string | number | null
): Promise<Appointment | undefined> => {
  const hoje = isoLocal(new Date());
  // Com animalId a API ignora veterinarioId, então o filtro por veterinário é feito aqui.
  const lista = await getAllAppointments(animalId, veterinarioId);
  return lista
    .filter(
      (a) =>
        a.petId === String(animalId) &&
        (!veterinarioId || a.vetId === String(veterinarioId)) &&
        (a.status === 'SCHEDULED' || a.status === 'CONFIRMED') &&
        a.date?.slice(0, 10) === hoje
    )
    .sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime())[0];
};

// Atendimento imediato (sem horário marcado): a API só fecha atendimento de uma consulta, então
// o vet abre uma consulta agora, com ele mesmo como veterinário.
const createWalkInAppointment = async (
  animalId: string,
  veterinarioId: string | number
): Promise<Appointment> => {
  if (USE_API) {
    const response = await apiJava.post('/consulta', {
      tipo: 'ROTINA',
      dataHora: dateTimeLocal(new Date()),
      observacao: 'Atendimento imediato',
      animalId: Number(animalId),
      veterinarioId: Number(veterinarioId),
    });
    const c = response.data;
    return {
      id: c.id.toString(),
      petId: c.animalId.toString(),
      vetId: c.veterinarioId?.toString() ?? '',
      date: c.dataHora,
      reason: c.observacao || 'Atendimento imediato',
      status: mapStatus(c.status),
    };
  }
  return addFakeAppointment({
    id: `appt-${Date.now()}`,
    petId: animalId,
    vetId: String(veterinarioId),
    date: dateTimeLocal(new Date()),
    reason: 'Atendimento imediato',
    status: 'SCHEDULED',
  });
};

// Janela livre como o app a usa. A API manda `dataHoraInicio` (LocalDateTime); a duração
// não vem, então só exibimos o início.
export interface JanelaAtendimento {
  id: number;
  data: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm:ss
}

// Datas com ao menos uma janela livre no intervalo (AAAA-MM-DD, inclusive).
const getFreeDates = async (
  veterinarioId: string | number,
  de: string,
  ate: string
): Promise<string[]> => {
  if (USE_API) {
    const response = await apiJava.get<string[]>('/janela-atendimento/livres', {
      params: { veterinarioId, de, ate },
    });
    return response.data;
  }
  const datas: string[] = [];
  for (let d = new Date(`${de}T12:00:00`); isoLocal(d) <= ate; d.setDate(d.getDate() + 1)) {
    datas.push(isoLocal(d));
  }
  return datas;
};

const getFreeWindows = async (
  veterinarioId: string | number,
  dataISO: string
): Promise<JanelaAtendimento[]> => {
  if (USE_API) {
    // veterinarioId e data são obrigatórios na API; ela já exclui janela ocupada ou que já começou.
    const response = await apiJava.get('/janela-atendimento/livres', {
      params: { veterinarioId, data: dataISO },
    });
    const lista: any[] = response.data._embedded?.janelaAtendimentoResponseList ?? [];
    return lista.map((j) => ({
      id: j.id,
      data: String(j.dataHoraInicio).slice(0, 10),
      horaInicio: String(j.dataHoraInicio).slice(11, 19),
    }));
  }

  return [
    { id: 991, data: dataISO, horaInicio: '08:00:00' },
    { id: 992, data: dataISO, horaInicio: '10:00:00' },
    { id: 993, data: dataISO, horaInicio: '15:00:00' },
  ];
};

export {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  fecharAtendimento,
  deleteAppointment,
  findTodaysOpenAppointment,
  createWalkInAppointment,
  getFreeWindows,
  getFreeDates,
  dateTimeLocal,
  isoLocal,
};
