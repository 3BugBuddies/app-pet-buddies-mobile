import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  CheckInDoseResult,
  CheckInEscalationResult,
  CheckinExtracaoResponse,
  CheckInInterpretation,
  CheckInNoRuleResult,
} from '../../model/care';
import type { ClosingDoneSummary, ClosingDraft } from '../../model/closing';
import type { PrescricaoDraft } from '../../model/prescription';
import type { RegraDraft } from '../../model/prescriptionRule';


export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
};


export type HomeTabParamList = {
  HomeTutor: undefined;
  PataSegura: undefined;
};


export type PlanoTabParamList = {
  CarePlan: { petId?: string } | undefined;
  CheckInEntry: { petId: string; itemPlanoCuidadoId?: number };
  CheckInConfirm: { petId: string; extracaoResponse: CheckinExtracaoResponse; itemPlanoCuidadoId?: number };
  CheckInResult: { petId: string; result: CheckInDoseResult; itemPlanoCuidadoId?: number };
  CheckInEscalation: { petId: string; result: CheckInEscalationResult; itemPlanoCuidadoId?: number };
  CheckInNoRule: { petId: string; result: CheckInNoRuleResult; narrative: string; itemPlanoCuidadoId?: number };
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
  AtenderAgora: undefined;
};


export type PacientesTabParamList = {
  Pacientes: undefined;
  DetalhesPet: { petId: string; consultaId?: string };
  ProntuarioForm: { petId: string; consultaId?: string; prescricao?: PrescricaoDraft };
  PlanoPaciente: { petId: string };
  // Closing: ProntuarioForm -> (Prescricao opcional, volta ao form) -> AssinarPrescricao -> CheckoutAtendimento.
  Prescricao: { animalId: string; novaRegra?: RegraDraft };
  NovaRegra: { animalId: string };
  AssinarPrescricao: { closing: ClosingDraft };
  CheckoutAtendimento: { summary: ClosingDoneSummary };
};


export type AgendaVetTabParamList = {
  AgendaSemana: undefined;
};


export type VetTabParamList = {
  HojeTab: NavigatorScreenParams<HojeTabParamList>;
  AgendaSemanaTab: NavigatorScreenParams<AgendaVetTabParamList>;
  PacientesTab: NavigatorScreenParams<PacientesTabParamList>;
};