// Campos baseados em T_PB_REGRA_PRESCRICAO (schema-sprint-3-08.md), em camelCase.
// IDs numéricos correspondem aos registros reais em T_PB_CONDICAO_CLINICA (criados via seed).
import { InferType, object, number, string } from 'yup';

// IDs numéricos = PKs reais no banco (seed criado com POST /condicao-clinica)
const CONDICOES_CLINICAS = [
  { id: 1, codigo: 'FEZES_MOLES', rotulo: 'Fezes moles' },
  { id: 2, codigo: 'NAO_EVACUOU', rotulo: 'Não evacuou' },
  { id: 3, codigo: 'COMEU_POUCO', rotulo: 'Comeu pouco' },
  { id: 4, codigo: 'VOMITO', rotulo: 'Vômito' },
  { id: 5, codigo: 'SANGUE_NAS_FEZES', rotulo: 'Sangue nas fezes' },
  { id: 6, codigo: 'APATIA', rotulo: 'Apatia' },
  { id: 7, codigo: 'DIFICULDADE_RESPIRATORIA', rotulo: 'Dificuldade respiratória' },
] as const;

const TP_ACAO = ['DOSE_MIN', 'DOSE_MAX', 'DOSE_PADRAO', 'ACIONAR_CLINICA'] as const;

const prescriptionRuleSchema = object({
  id: string().nullable(),
  prescricaoId: string().required(),
  condicaoClinicaId: number().required('Selecione a condição que aciona a regra'),
  rotuloCongelado: string().required(),
  acao: string().oneOf(TP_ACAO, 'Selecione a ação da regra').required('Selecione a ação da regra'),
});

type PrescriptionRule = InferType<typeof prescriptionRuleSchema>;

interface RegraDraft {
  condicaoClinicaId: number;
  rotuloCongelado: string;
  acao: (typeof TP_ACAO)[number];
}

interface RegraPrescricaoRequest {
  condicaoClinicaId: number;
  rotuloCongelado: string;
  acao: (typeof TP_ACAO)[number];
}

export { CONDICOES_CLINICAS, TP_ACAO, prescriptionRuleSchema };
export type { PrescriptionRule, RegraDraft, RegraPrescricaoRequest };
