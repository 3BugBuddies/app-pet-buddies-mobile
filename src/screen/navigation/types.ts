import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  CheckInDoseResult,
  CheckInEscalationResult,
  CheckinExtracaoResponse,
  CheckInInterpretation,
  CheckInNoRuleResult,
} from '../../model/care';
import type { PrescricaoDraft } from '../../model/prescription';
import type { RegraDraft } from '../../model/prescriptionRule';


export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
};


export type HomeTabParamList = {
  HomeTutor: undefined;
  Score: { petId: string };
};


export type PlanoTabParamList = {
  CarePlan: { petId?: string } | undefined;
  CheckInEntry: { petId: string };
  CheckInConfirm: { petId: string; extracaoResponse: CheckinExtracaoResponse };
  CheckInResult: { petId: string; result: CheckInDoseResult };
  CheckInEscalation: { petId: string; result: CheckInEscalationResult };
  CheckInNoRule: { petId: string; result: CheckInNoRuleResult; narrative: string };
  AssistantNotice: { petId: string };
};


export type AgendaTabParamList = {
  AgendamentoTutor: { petId?: string } | undefined;
};


export type PetTabParamList = {
  PetProfile: { petId?: string } | undefined;
  MeusPets: undefined;
  NovoPet: undefined;
};


export type TutorTabParamList = {
  HomeTab: NavigatorScreenParams<HomeTabParamList>;
  PlanoTab: NavigatorScreenParams<PlanoTabParamList>;
  AgendaTab: NavigatorScreenParams<AgendaTabParamList>;
  PetTab: NavigatorScreenParams<PetTabParamList>;
};


export type HojeTabParamList = {
  AgendaClinica: undefined;
};


export type PacientesTabParamList = {
  Pacientes: undefined;
  DetalhesPet: { petId: string };
  ProntuarioForm: { petId: string };
  PlanoPaciente: { petId: string };
  // Tunel do veterinario (Fase 4): Prescricao <-> NovaRegra -> AssinarPrescricao.
  // novaRegra viaja de volta via merge params para que o vet possa adicionar
  // múltiplas regras antes de assinar.
  Prescricao: { animalId: string; registroAtendimentoId: string; novaRegra?: RegraDraft };
  NovaRegra: { draft: PrescricaoDraft };
  AssinarPrescricao: { draft: PrescricaoDraft };
};


export type ClinicaTabParamList = {
  Clinica: undefined;
};


export type VetTabParamList = {
  HojeTab: NavigatorScreenParams<HojeTabParamList>;
  PacientesTab: NavigatorScreenParams<PacientesTabParamList>;
  ClinicaTab: NavigatorScreenParams<ClinicaTabParamList>;
};