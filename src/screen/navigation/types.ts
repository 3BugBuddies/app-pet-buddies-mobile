import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  CheckInDoseResult,
  CheckInEscalationResult,
  CheckInInterpretation,
  CheckInNoRuleResult,
} from '../../model/care';
import type { PrescricaoDraft } from '../../model/prescription';

export type AuthStackParamList = {
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
  CheckInConfirm: { petId: string; narrative: string; interpretation: CheckInInterpretation };
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
  // Tunel do veterinario (Fase 4): Prescricao -> NovaRegra -> AssinarPrescricao,
  // sem aba "Planos" — o rascunho viaja pelos params ate a assinatura final.
  Prescricao: { animalId: string; registroAtendimentoId: string };
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
