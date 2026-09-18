// Campos baseados em T_PB_PRESCRICAO (schema-sprint-3-08.md), em camelCase.
// O contrato REST de prescricao ainda nao existe na Sprint 3 (ver schema-sprint-3-08.md,
// secao "Antes de tudo"), entao os nomes aqui seguem a mesma convencao ja usada nos DTOs
// existentes (prefixo de coluna cai, FK vira "<entidade>Id") ate a API real ser publicada.
import { InferType, object, string, number, ref } from 'yup';
import type { RegraDraft, RegraPrescricaoRequest } from './prescriptionRule';

const DATA_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const prescriptionSchema = object({
  id: string().nullable(),
  medicamento: string().required('O nome do medicamento é obrigatório'),
  doseMin: number()
    .positive('A dose mínima deve ser maior que zero')
    .required('Informe a dose mínima'),
  doseMax: number()
    .positive('A dose máxima deve ser maior que zero')
    .min(ref('doseMin'), 'A dose máxima não pode ser menor que a dose mínima')
    .required('Informe a dose máxima'),
  unidade: string().required('Informe a unidade da dose (ex: mg, ml)'),
  frequenciaDia: number()
    .integer('A frequência deve ser um número inteiro')
    .positive('A frequência deve ser maior que zero')
    .required('Informe quantas vezes ao dia'),
  duracaoDias: number()
    .integer('A duração deve ser um número inteiro de dias')
    .positive('A duração deve ser maior que zero')
    .required('Informe a duração do tratamento em dias'),
  // string (nao Date do yup): o JSON da API e o AsyncStorage so conhecem "AAAA-MM-DD".
  dataInicio: string().matches(DATA_ISO_REGEX, 'Use o formato AAAA-MM-DD').required('A data de início é obrigatória'),
  orientacao: string().nullable(),
  // Preenchidos automaticamente pelo control quando uma prescricao "edita" outra:
  // como o registro e imutavel, editar cria uma nova linha apontando pra origem.
  materialOrigemId: string().nullable(),
  versaoOrigem: number().integer().nullable(),
  animalId: string().required('A prescrição precisa estar vinculada a um pet'),
  veterinarioId: string().required('A prescrição precisa de um veterinário responsável'),
  registroAtendimentoId: string().nullable(),
});

type Prescription = InferType<typeof prescriptionSchema>;

// Estado do assistente "Tunel do Veterinario" (Fase 4) entre ProntuarioForm ->
// PrescricaoScreen -> NovaRegraScreen -> AssinarPrescricaoScreen. Nada disso e
// gravado no repository ate a assinatura final — a prescricao no schema real
// so nasce assinada (sem status de rascunho em T_PB_PRESCRICAO), entao o
// rascunho aqui e so um objeto client-side passeando pelos params de navegacao.
interface PrescricaoDraft {
  animalId: string;
  registroAtendimentoId: string;
  medicamento: string;
  doseMin: number;
  doseMax: number;
  unidade: string;
  frequenciaDia: number;
  duracaoDias: number;
  orientacao: string;
  regras: RegraDraft[];
}

// --- DTOs do fluxo de IA: Rascunho de Prescrição (POST /api/prescricao/rascunho) ---

// O veterinário dita a conduta em linguagem natural; a IA estrutura os campos.
export interface NarrativaPrescricaoRequest {
  animalId: string;
  registroAtendimentoId?: string;
  narrativa: string;
}

// Campos de prescrição que a IA extraiu da narrativa — objeto aninhado dentro
export interface PrescricaoRequest {
  medicamento: string;
  doseMin: number;
  doseMax: number;
  unidade: string;
  frequenciaDia: number;
  duracaoDias: number;
  orientacao?: string;
}

// Corpo completo da resposta de POST /api/prescricao/rascunho.
// de confiança — não campos soltos na raiz.
export interface RascunhoPrescricaoResponse {
  narrativaOriginal: string;
  extracaoDisponivel: boolean;
  motivoDegradacao: string | null;
  prescricao: PrescricaoRequest;
  regrasPropostas: RegraPrescricaoRequest[];
  condicoesDescartadas: string[];
}

export { Prescription, prescriptionSchema };
export type { PrescricaoDraft };
