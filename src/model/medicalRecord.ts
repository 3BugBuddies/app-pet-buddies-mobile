// Campos baseados em T_PB_REGISTRO_ATENDIMENTO (schema-sprint-3-08.md), em camelCase
// porque o app consome JSON (DTO) e nao a coluna do banco direto.
import { InferType, object, string } from 'yup';

const DATA_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const medicalRecordSchema = object({
  // Diferente de pet/prescription: o control sempre gera o id antes de validar
  // (nao existe uma etapa "rascunho sem id" pra esse formulario), entao aqui e required.
  id: string().required(),
  animalId: string().required('O prontuário precisa estar vinculado a um pet'),
  consultaId: string().nullable(),
  dataAtendimento: string()
    .matches(DATA_ISO_REGEX, 'Use o formato AAAA-MM-DD')
    .required('Informe a data do atendimento'),
  anamnese: string().nullable(),
  diagnostico: string().required('Informe o diagnóstico'),
  tratamento: string().required('Informe o tratamento'),
  observacao: string().nullable(),
  proximoRetorno: string().matches(DATA_ISO_REGEX, 'Use o formato AAAA-MM-DD').nullable(),
  proximaVacina: string().matches(DATA_ISO_REGEX, 'Use o formato AAAA-MM-DD').nullable(),
});

type MedicalRecord = InferType<typeof medicalRecordSchema>;

export { MedicalRecord, medicalRecordSchema };
