// Campos baseados em T_PB_REGRA_PRESCRICAO, em camelCase.
import { InferType, object, number, string } from 'yup';

const TP_ACAO = ['DOSE_MIN', 'DOSE_MAX', 'DOSE_PADRAO', 'ACIONAR_CLINICA', 'SUSPENDER'] as const;
const OPERADORES = ['MAIOR_QUE', 'MAIOR_OU_IGUAL', 'MENOR_QUE', 'MENOR_OU_IGUAL', 'IGUAL'] as const;

type TipoAcao = (typeof TP_ACAO)[number];
type Operador = (typeof OPERADORES)[number];

const OPERADOR_SIMBOLO: Record<Operador, string> = {
  MAIOR_QUE: '>',
  MAIOR_OU_IGUAL: '≥',
  MENOR_QUE: '<',
  MENOR_OU_IGUAL: '≤',
  IGUAL: '=',
};

// Condição clínica do catálogo da clínica (GET /condicao-clinica). BOOLEANO = "aconteceu ou não";
// NUMERICO exige operador e limite na regra (ex.: temperatura > 39,5).
interface CondicaoClinica {
  id: number;
  codigo: string;
  rotulo: string;
  tipoDado: 'BOOLEANO' | 'NUMERICO';
  unidade?: string | null;
  // Sinal de alarme: o back-end escala sozinho no check-in, então não vira regra de dose.
  critica: boolean;
}

// Catálogo usado só no modo mock (USE_API = false). Com a API, vem de /condicao-clinica.
const CONDICOES_CLINICAS: CondicaoClinica[] = [
  { id: 1, codigo: 'FEZES_MOLES', rotulo: 'Fezes moles', tipoDado: 'BOOLEANO', critica: false },
  { id: 2, codigo: 'NAO_EVACUOU', rotulo: 'Não evacuou', tipoDado: 'BOOLEANO', critica: false },
  { id: 3, codigo: 'COMEU_POUCO', rotulo: 'Comeu pouco', tipoDado: 'BOOLEANO', critica: false },
  { id: 4, codigo: 'VOMITO', rotulo: 'Vômito', tipoDado: 'BOOLEANO', critica: false },
  { id: 5, codigo: 'SANGUE_NAS_FEZES', rotulo: 'Sangue nas fezes', tipoDado: 'BOOLEANO', critica: true },
  { id: 6, codigo: 'APATIA', rotulo: 'Apatia', tipoDado: 'BOOLEANO', critica: true },
  { id: 7, codigo: 'DIFICULDADE_RESPIRATORIA', rotulo: 'Dificuldade respiratória', tipoDado: 'BOOLEANO', critica: true },
];

const prescriptionRuleSchema = object({
  id: string().nullable(),
  prescricaoId: string().required(),
  condicaoClinicaId: number().required('Selecione a condição que aciona a regra'),
  rotuloCongelado: string().required(),
  acao: string().oneOf(TP_ACAO, 'Selecione a ação da regra').required('Selecione a ação da regra'),
  operador: string().oneOf(OPERADORES).nullable(),
  limite: number().nullable(),
});

type PrescriptionRule = InferType<typeof prescriptionRuleSchema>;

// Regra montada na tela, antes de a prescrição ser assinada. O rótulo é só para exibir:
// a API congela o rótulo sozinha a partir da condição.
interface RegraDraft {
  condicaoClinicaId: number;
  rotuloCongelado: string;
  acao: TipoAcao;
  operador?: Operador | null;
  limite?: number | null;
}

// Condição que a IA reconheceu no relato e que ainda não existe no catálogo da clínica.
interface CondicaoNova {
  rotulo: string;
  tipoDado: 'BOOLEANO' | 'NUMERICO';
}

// Regra proposta pela IA em POST /prescricao/rascunho (RegraPrescricaoRequest do Java).
// Com condicaoNova, condicaoClinicaId vem nulo até a vet criar a condição.
interface RegraPrescricaoRequest {
  condicaoClinicaId: number | null;
  condicaoRotulo?: string | null;
  condicaoNova?: CondicaoNova | null;
  operador?: Operador | null;
  limite?: number | null;
  acaoDose: TipoAcao;
  ordem?: number | null;
}

// Texto sem acento e sem caixa, para comparar e buscar.
const normalizarTexto = (texto: string): string =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

// "Dor ao urinar" -> "DOR_AO_URINAR" (o código tem no máximo 60 caracteres).
const derivarCodigo = (rotulo: string): string =>
  normalizarTexto(rotulo)
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()
    .slice(0, 60);

// "fezes moles" ou "temperatura > 39,5", conforme a condição seja booleana ou numérica.
const descreverCondicao = (regra: RegraDraft): string => {
  const rotulo = (regra.rotuloCongelado || 'Condição desconhecida').toLowerCase();
  if (!regra.operador || regra.limite == null) return rotulo;
  return `${rotulo} ${OPERADOR_SIMBOLO[regra.operador]} ${String(regra.limite).replace('.', ',')}`;
};

export {
  CONDICOES_CLINICAS,
  TP_ACAO,
  OPERADORES,
  OPERADOR_SIMBOLO,
  derivarCodigo,
  descreverCondicao,
  normalizarTexto,
  prescriptionRuleSchema,
};
export type { CondicaoClinica, CondicaoNova, Operador, PrescriptionRule, RegraDraft, RegraPrescricaoRequest, TipoAcao };
