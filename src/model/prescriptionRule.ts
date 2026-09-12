// Campos baseados em T_PB_REGRA_PRESCRICAO (schema-sprint-3-08.md), em camelCase.
// T_PB_CONDICAO_CLINICA (o catalogo de condicoes) e cadastravel pela clinica no
// schema real; aqui usamos uma lista fixa como seed, igual um protocolo faria
// antes de existir tela de administracao pra isso (fora do escopo da Sprint 3).
import { InferType, object, string } from 'yup';

const CONDICOES_CLINICAS = [
  { id: 'cond-fezes-moles', codigo: 'FEZES_MOLES', rotulo: 'Fezes moles' },
  { id: 'cond-nao-evacuou', codigo: 'NAO_EVACUOU', rotulo: 'Não evacuou' },
  { id: 'cond-comeu-pouco', codigo: 'COMEU_POUCO', rotulo: 'Comeu pouco' },
  { id: 'cond-vomito', codigo: 'VOMITO', rotulo: 'Vômito' },
  { id: 'cond-sangue-fezes', codigo: 'SANGUE_NAS_FEZES', rotulo: 'Sangue nas fezes' },
  { id: 'cond-apatia', codigo: 'APATIA', rotulo: 'Apatia' },
  { id: 'cond-dificuldade-resp', codigo: 'DIFICULDADE_RESPIRATORIA', rotulo: 'Dificuldade respiratória' },
] as const;

// Todas as condicoes do seed acima sao BOOLEANO (o tutor relatou ou nao), entao
// TP_OPERADOR/NR_LIMITE (pra condicao NUMERICO, ex.: temperatura) nao entram
// nesta fase — o schema suporta, mas nenhuma condicao atual precisa disso.
const TP_ACAO = ['DOSE_MIN', 'DOSE_MAX', 'DOSE_PADRAO', 'ACIONAR_CLINICA'] as const;

const prescriptionRuleSchema = object({
  id: string().nullable(),
  prescricaoId: string().required(),
  condicaoClinicaId: string().required('Selecione a condição que aciona a regra'),
  rotuloCongelado: string().required(),
  acao: string().oneOf(TP_ACAO, 'Selecione a ação da regra').required('Selecione a ação da regra'),
});

type PrescriptionRule = InferType<typeof prescriptionRuleSchema>;

// Forma de uma regra ainda no rascunho do assistente (Fase 4): sem id nem
// prescricaoId porque a prescricao em si so existe depois de assinada.
interface RegraDraft {
  condicaoClinicaId: string;
  rotuloCongelado: string;
  acao: (typeof TP_ACAO)[number];
}

// DTO que a API Java espera ao receber uma regra dentro do payload de prescrição.
// Mesma forma que RegraDraft, mas explícito como tipo de contrato (não state).
interface RegraPrescricaoRequest {
  condicaoClinicaId: string;
  rotuloCongelado: string;
  acao: (typeof TP_ACAO)[number];
}

export { CONDICOES_CLINICAS, TP_ACAO, prescriptionRuleSchema };
export type { PrescriptionRule, RegraDraft, RegraPrescricaoRequest };
