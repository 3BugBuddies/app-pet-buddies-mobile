import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  CheckInDoseResult,
  CheckInEscalationResult,
  CheckinExtracaoResponse,
  CheckInInterpretation,
  CheckInNoRuleResult,
} from '../../model/care';
import type { ClosingDoneSummary, ClosingDraft } from '../../model/closing';
import type { ReceitaDraft } from '../../model/prescription';


export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
};


export type HomeTabParamList = {
  HomeTutor: undefined;
  PataSegura: undefined;
  MinhaConta: undefined;
  TrocarSenha: undefined;
};


export type PlanoTabParamList = {
  CarePlan: { petId?: string } | undefined;
  CheckInEntry: { petId: string };
  CheckInConfirm: { petId: string; extracaoResponse: CheckinExtracaoResponse };
  CheckInResult: { petId: string; result: CheckInDoseResult };
  CheckInEscalation: { petId: string; result: CheckInEscalationResult };
  CheckInNoRule: { petId: string; result: CheckInNoRuleResult; narrative: string };
};


export type AgendaTabParamList = {
  AgendamentoTutor: { petId?: string; reason?: string; date?: string } | undefined;
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
  ProntuarioForm: { petId: string; consultaId?: string; prescricao?: ReceitaDraft };
  PlanoPaciente: { petId: string };
  // Closing: ProntuarioForm -> (Prescricao opcional, volta ao form) -> AssinarPrescricao -> CheckoutAtendimento.
  Prescricao: { animalId: string; receita?: ReceitaDraft };
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