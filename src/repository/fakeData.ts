//   1. Apague este arquivo
//   2. Nos repositórios, remova o bloco `if (!USE_API)` e a constante `USE_API`

import { Image } from 'react-native';
import type { Pet } from '../model/pet';
import type { Appointment } from '../model/appointment';
import type { CarePlan, CheckInResult, CheckInInterpretation } from '../model/care';
import type { MedicalRecord } from '../model/medicalRecord';
import type { Prescription } from '../model/prescription';
import type { PrescriptionRule } from '../model/prescriptionRule';
import type { Protocol } from '../model/legacyPrescription';

// ---------------------------------------------------------------------------
// Pets
// ---------------------------------------------------------------------------

export const FAKE_PETS: Pet[] = [
  {
    id: 'pet-luna',
    nome: 'Filó',
    especie: 'CACHORRO',
    raca: 'Shiba Inu',
    porte: 'MEDIO',
    sexo: 'FEMEA',
    dataNascimento: '2014-10-19',
    peso: 10,
    condicaoCronica: true,
    castrado: true,
    foto: Image.resolveAssetSource(require('../../assets/images/filo.webp')).uri,
    alergias: 'Frango',
    observacoes: null,
    responsavelId: 'tutor-1',
  },
];

// ---------------------------------------------------------------------------
// Consultas (Appointments)
// ---------------------------------------------------------------------------

let _appointments: Appointment[] = [
  {
    id: 'appt-1',
    petId: 'pet-luna',
    vetId: 'vet-1',
    date: '2026-09-11T10:30:00',
    reason: 'Vacina V10 · reforço',
    status: 'CONFIRMED',
  },
  {
    id: 'appt-2',
    petId: 'pet-luna',
    vetId: 'vet-1',
    date: '2026-10-05T14:00:00',
    reason: 'Retorno · avaliação de peso',
    status: 'SCHEDULED',
  },
];

export const getFakeAppointments = (): Appointment[] => [..._appointments];

export const addFakeAppointment = (a: Appointment): Appointment => {
  _appointments = [..._appointments, a];
  return a;
};

export const updateFakeAppointment = (id: string, patch: Partial<Appointment>): Appointment => {
  _appointments = _appointments.map((a) => (a.id === id ? { ...a, ...patch } : a));
  return _appointments.find((a) => a.id === id)!;
};

export const deleteFakeAppointment = (id: string): void => {
  _appointments = _appointments.filter((a) => a.id !== id);
};

// ---------------------------------------------------------------------------
// Plano de Cuidado (Care Plan) — estado mutável p/ toggle funcionar
// ---------------------------------------------------------------------------

const _initialTasks: CarePlan['tasks'] = [
  { id: 'lactulona', title: 'Lactulona', description: '1–2 ml · 2x ao dia — administrar via oral, de preferência com o alimento.', time: '08:00', points: 20, completed: false, origin: 'PRESCRICAO' },
  { id: 'vermifugo', title: 'Vermífugo', description: '1 comprimido · dose única — repetir a cada 3 meses conforme prescrição.', time: '08:00', points: 20, completed: false, origin: 'PRESCRICAO' },
  { id: 'curativo', title: 'Troca de curativo', description: 'Trocar o curativo da pata traseira e higienizar com solução antisséptica.', time: '20:00', points: 30, completed: false, origin: 'PRESCRICAO' },
];

let _planTasks = _initialTasks.map((t) => ({ ...t }));

export const getFakeCarePlan = (petId: string): CarePlan => ({
  petId,
  weekLabel: 'Plano vivo · semana 12',
  currentWeekNumber: 12,
  totalWeeks: 24,
  weekDays: [
    { label: 'S', dayNumber: 1, isActive: false, dotColor: 'CUIDADO' },
    { label: 'T', dayNumber: 2, isActive: false, dotColor: 'CUIDADO' },
    { label: 'Q', dayNumber: 3, isActive: false, dotColor: 'CASA' },
    { label: 'Q', dayNumber: 4, isActive: true, dotColor: 'CASA' },
    { label: 'S', dayNumber: 5, isActive: false, dotColor: 'NONE' },
    { label: 'S', dayNumber: 6, isActive: false, dotColor: 'NONE' },
    { label: 'D', dayNumber: 7, isActive: false, dotColor: 'NONE' },
  ],
  tasks: _planTasks.map((t) => ({ ...t })),
  items: [],
  milestones: [
    { title: 'Revisão de peso · sem. 12', whenLabel: 'hoje · registrar após a vacina', tagLabel: 'hoje', done: false },
    { title: 'Encerramento · sem. 24', whenLabel: '28 nov · exame de sangue', done: false },
  ],
});

// ---------------------------------------------------------------------------
// Check-in — retorna DOSE ou ESCALATION baseado na interpretação
// ---------------------------------------------------------------------------

export const resolveFakeCheckIn = (interpretation: CheckInInterpretation): CheckInResult => {
  if (interpretation.alarmSign || interpretation.stoolConsistency === 'BLOOD') {
    return {
      status: 'ESCALATION',
      reasonLabel: interpretation.stoolConsistency === 'BLOOD' ? 'sangue nas fezes' : 'sinal de alerta',
      ruleDescription: 'sinal de alarme → sem dose · emergência',
      vetName: 'Dra. Helena',
      vetCrmv: 'CRMV-SP 12.345',
      suggestedSlotLabel: 'hoje 17:40',
    };
  }

  const dose = interpretation.appetite === 'LOW' || interpretation.stoolConsistency === 'SOFT' ? '1 ml' : '2 ml';
  const rule = interpretation.stoolConsistency === 'SOFT' ? 'fezes moles → menor dose' : 'apetite normal → dose padrão';

  return {
    status: 'DOSE',
    doseLabel: dose,
    doseRangeLabel: '1–2 ml',
    ruleDescription: rule,
    ruleConfirmedAtLabel: `Condição confirmada por você às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`,
    vetName: 'Dra. Helena',
    vetCrmv: 'CRMV-SP 12.345',
    prescriptionDateLabel: '28 ago',
    pointsEarned: 20,
  };
};

// ---------------------------------------------------------------------------
// Prontuários (Medical Records)
// ---------------------------------------------------------------------------

let _records: MedicalRecord[] = [
  {
    id: 'rec-1',
    animalId: 'pet-luna',
    consultaId: 'appt-1',
    dataAtendimento: '2026-09-11',
    anamnese: 'Tutora relata coceira no ouvido há 3 dias',
    diagnostico: 'Otite leve no ouvido direito',
    tratamento: 'Gotas antibióticas por 7 dias',
    observacao: 'Retorno em 10 dias',
    proximoRetorno: '2026-09-21',
    proximaVacina: null,
  },
];

export const getFakeRecordsByPetId = (animalId: string): MedicalRecord[] =>
  _records.filter((r) => r.animalId === animalId);

export const addFakeRecord = (record: MedicalRecord): MedicalRecord => {
  _records = [..._records, record];
  return record;
};

// ---------------------------------------------------------------------------
// Prescrições
// ---------------------------------------------------------------------------

let _prescriptions: Prescription[] = [
  {
    id: 'presc-1',
    medicamento: 'Lactulona',
    doseMin: 1,
    doseMax: 2,
    unidade: 'ml',
    frequenciaDia: 2,
    duracaoDias: 30,
    dataInicio: '2026-09-11',
    orientacao: 'Administrar via oral, de preferência com o alimento.',
    materialOrigemId: null,
    versaoOrigem: null,
    animalId: 'pet-luna',
    veterinarioId: 'vet-1',
    registroAtendimentoId: 'rec-1',
  },
];

export const getFakePrescriptionsByAnimalId = (animalId: string): Prescription[] =>
  _prescriptions.filter((p) => p.animalId === animalId);

export const addFakePrescription = (p: Prescription): Prescription => {
  _prescriptions = [..._prescriptions, p];
  return p;
};

// ---------------------------------------------------------------------------
// Regras de Prescrição
// ---------------------------------------------------------------------------

let _rules: PrescriptionRule[] = [
  { id: 'rule-1', prescricaoId: 'presc-1', condicaoClinicaId: 1, rotuloCongelado: 'Fezes moles', acao: 'DOSE_MIN' },
  { id: 'rule-2', prescricaoId: 'presc-1', condicaoClinicaId: 5, rotuloCongelado: 'Sangue nas fezes', acao: 'ACIONAR_CLINICA' },
];

export const getFakeRulesByPrescriptionId = (prescricaoId: string): PrescriptionRule[] =>
  _rules.filter((r) => r.prescricaoId === prescricaoId);

export const addFakeRule = (rule: PrescriptionRule): PrescriptionRule => {
  _rules = [..._rules, rule];
  return rule;
};

// ---------------------------------------------------------------------------
// Protocolos (visão vet)
// ---------------------------------------------------------------------------

export const FAKE_PROTOCOLS: Protocol[] = [
  {
    id: 'proto-1',
    name: 'Lactulona — Constipação leve',
    categoryLabel: 'Gastrointestinal',
    doseRangeLabel: '1–2 ml',
    ruleCount: 2,
    patientCount: 1,
  },
];
