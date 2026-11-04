// Campos baseados em T_PB_PRESCRICAO, em camelCase: o prefixo da coluna cai e a FK vira
// "<entidade>Id", a mesma convencao dos DTOs da API.
import { InferType, object, string, number, ref } from 'yup';
import type { Operador, RegraDraft, RegraPrescricaoRequest, TipoAcao } from './prescriptionRule';

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

// Estado do assistente de prescricao do veterinario entre ProntuarioForm ->
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
  // Origem na receita-modelo, quando a vet partiu de uma. Os dois juntos ou nenhum.
  receitaModeloId?: number;
  receitaModeloVersao?: number;
}

// Um medicamento da receita. A `key` é estável e só existe no cliente: identifica o cartão
// enquanto a vet adiciona, remove e reordena.
type ItemReceitaDraft = Omit<PrescricaoDraft, 'animalId' | 'registroAtendimentoId'> & { key: string };

// A receita do atendimento: N medicamentos, uma assinatura.
interface ReceitaDraft {
  animalId: string;
  registroAtendimentoId?: string;
  itens: ItemReceitaDraft[];
}

// --- DTOs do fluxo de IA: Rascunho de Prescrição (POST /api/prescricao/rascunho) ---

// O veterinário dita a conduta em linguagem natural; a IA estrutura os campos.
export interface NarrativaPrescricaoRequest {
  animalId: string;
  registroAtendimentoId?: string;
  narrativa: string;
}

// Campos de prescrição que a IA extraiu da narrativa.
export interface PrescricaoRequest {
  medicamento: string;
  doseMin: number;
  doseMax: number;
  unidade: string;
  frequenciaDia: number;
  duracaoDias: number;
  orientacao?: string;
}

// Um medicamento extraído do ditado (itens[] da resposta).
export interface RascunhoItem {
  prescricao: PrescricaoRequest;
  confiancaPorCampo?: Record<string, unknown> | null;
  regrasPropostas?: RegraPrescricaoRequest[] | null;
}

// Corpo completo da resposta de POST /api/prescricao/rascunho.
// `itens` vem ausente em back antigo; os campos legados trazem o 1º medicamento.
export interface RascunhoPrescricaoResponse {
  itens?: RascunhoItem[] | null;
  narrativaOriginal: string;
  extracaoDisponivel: boolean;
  motivoDegradacao: string | null;
  prescricao: PrescricaoRequest;
  regrasPropostas: RegraPrescricaoRequest[];
  condicoesDescartadas: string[];
}

// Receita-modelo da clínica (GET /api/receita-modelo). Campos como a API manda.
interface PrescriptionTemplateRule {
  id: number;
  condicaoClinicaId: number;
  condicaoRotulo: string;
  condicaoTipoDado: 'BOOLEANO' | 'NUMERICO';
  condicaoUnidade: string | null;
  operador: Operador | null;
  limite: number | null;
  acaoDose: TipoAcao;
  ordem: number | null;
}

interface PrescriptionTemplate {
  id: number;
  titulo: string;
  medicamento: string;
  doseMin: number;
  doseMax: number;
  unidade: string;
  frequenciaDia: number;
  duracaoDias: number;
  orientacao: string | null;
  versao: number;
  regras: PrescriptionTemplateRule[];
}

export { Prescription, prescriptionSchema };
export type { ItemReceitaDraft, PrescricaoDraft, ReceitaDraft, PrescriptionTemplate, PrescriptionTemplateRule };
