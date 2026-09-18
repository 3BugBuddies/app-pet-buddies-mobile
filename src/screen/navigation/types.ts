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
  CheckInEntry: { petId: string; itemPlanoCuidadoId?: number };
  CheckInConfirm: { petId: string; extracaoResponse: CheckinExtracaoResponse; itemPlanoCuidadoId?: number };
  CheckInResult: { petId: string; result: CheckInDoseResult; itemPlanoCuidadoId?: number };
  CheckInEscalation: { petId: string; result: CheckInEscalationResult; itemPlanoCuidadoId?: number };
  CheckInNoRule: { petId: string; result: CheckInNoRuleResult; narrative: string; itemPlanoCuidadoId?: number };
  AssistantNotice: { petId: string };
};


export type AgendaTabParamList = {
  AgendamentoTutor: { petId?: string } | undefined;
};


export type PetTabParamList = {
  PetProfile: { petId?: string } | undefined;
  MeusPets: undefined;
  NovoPet: { petId?: string } | undefined;
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
  DetalhesPet: { petId: string; consultaId?: string };
  ProntuarioForm: { petId: string; consultaId?: string };
  PlanoPaciente: { petId: string };
  // Tunel do veterinario (Fase 4): Prescricao <-> NovaRegra -> AssinarPrescricao.
  Prescricao: { animalId: string; consultaId: string; prontuario: any; novaRegra?: RegraDraft };
  NovaRegra: { animalId: string; consultaId: string; prontuario: any };
  AssinarPrescricao: { draft: PrescricaoDraft; consultaId: string; prontuario: any };
  CheckoutAtendimento: { petName: string; resumoPrescricao: string };
};


export type VetTabParamList = {
  HojeTab: NavigatorScreenParams<HojeTabParamList>;
  PacientesTab: NavigatorScreenParams<PacientesTabParamList>;
};