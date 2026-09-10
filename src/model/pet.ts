// Campos baseados em T_PB_ANIMAL (schema-sprint-3-08.md), em camelCase
// porque o app consome o DTO da API .NET, nao a coluna do banco direto.
import { InferType, object, string, number, boolean } from 'yup';

const ESPECIES = ['CACHORRO', 'GATO', 'PASSARO', 'COELHO', 'HAMSTER', 'OUTRO'] as const;
const PORTES = ['MINI', 'PEQUENO', 'MEDIO', 'GRANDE', 'GIGANTE'] as const;
const SEXOS = ['MACHO', 'FEMEA'] as const;
const DATA_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const petSchema = object({
  id: string().nullable(),
  nome: string()
    .required('O nome do pet é obrigatório')
    .min(2, 'O nome deve ter ao menos 2 caracteres'),
  especie: string()
    .oneOf(ESPECIES, 'Selecione uma espécie válida')
    .required('A espécie é obrigatória'),
  raca: string().nullable(),
  porte: string()
    .oneOf(PORTES, 'Selecione um porte válido')
    .nullable(),
  sexo: string()
    .oneOf(SEXOS, 'Selecione um sexo válido')
    .required('O sexo é obrigatório'),
  // string (nao Date do yup): o JSON da API e o AsyncStorage so conhecem "AAAA-MM-DD".
  dataNascimento: string().matches(DATA_ISO_REGEX, 'Use o formato AAAA-MM-DD').nullable(),
  peso: number()
    .positive('O peso deve ser maior que zero')
    .nullable(),
  condicaoCronica: boolean().default(false),
  castrado: boolean().default(false),
  foto: string().nullable(),
  alergia: string().nullable(),
  observacoes: string().nullable(),
  responsavelId: string().required('O pet precisa estar vinculado a um responsável'),
});

type Pet = InferType<typeof petSchema>;

export { Pet, petSchema, ESPECIES, PORTES, SEXOS };
