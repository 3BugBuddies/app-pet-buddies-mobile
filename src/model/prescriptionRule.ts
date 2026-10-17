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
}

// Catálogo usado só no modo mock (USE_API = false). Com a API, vem de /condicao-clinica.
const CONDICOES_CLINICAS: CondicaoClinica[] = [
  { id: 1, codigo: 'FEZES_MOLES', rotulo: 'Fezes moles', tipoDado: 'BOOLEANO' },
  { id: 2, codigo: 'NAO_EVACUOU', rotulo: 'Não evacuou', tipoDado: 'BOOLEANO' },
  { id: 3, codigo: 'COMEU_POUCO', rotulo: 'Comeu pouco', tipoDado: 'BOOLEANO' },
  { id: 4, codigo: 'VOMITO', rotulo: 'Vômito', tipoDado: 'BOOLEANO' },
  { id: 5, codigo: 'SANGUE_NAS_FEZES', rotulo: 'Sangue nas fezes', tipoDado: 'BOOLEANO' },
  { id: 6, codigo: 'APATIA', rotulo: 'Apatia', tipoDado: 'BOOLEANO' },
  { id: 7, codigo: 'DIFICULDADE_RESPIRATORIA', rotulo: 'Dificuldade respiratória', tipoDado: 'BOOLEANO' },
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

// Regra proposta pela IA em POST /prescricao/rascunho (RegraPrescricaoRequest do Java).
// Não traz rótulo: ele vem do catálogo de condições.
interface RegraPrescricaoRequest {
  condicaoClinicaId: number;
  operador?: Operador | null;
  limite?: number | null;
  acaoDose: TipoAcao;
}

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
  descreverCondicao,
  prescriptionRuleSchema,
};
export type { CondicaoClinica, Operador, PrescriptionRule, RegraDraft, RegraPrescricaoRequest, TipoAcao };
