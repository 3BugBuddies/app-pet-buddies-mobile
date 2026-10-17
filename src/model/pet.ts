// Campos baseados em T_PB_ANIMAL, em camelCase
// porque o app consome o DTO da API, nao a coluna do banco direto.
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
  // A API (AnimalRequest) rejeita porte e dataNascimento nulos com 400.
  porte: string()
    .oneOf(PORTES, 'Selecione um porte válido')
    .required('O porte é obrigatório'),
  sexo: string()
    .oneOf(SEXOS, 'Selecione um sexo válido')
    .required('O sexo é obrigatório'),
  // string (nao Date do yup): o JSON da API e o AsyncStorage so conhecem "AAAA-MM-DD".
  dataNascimento: string()
    .required('A data de nascimento é obrigatória')
    .matches(DATA_ISO_REGEX, 'Use o formato DD/MM/AAAA')
    .test('data-valida', 'Informe uma data válida', (valor) => {
      if (!valor || !DATA_ISO_REGEX.test(valor)) return true; // formato já tratado acima
      const [ano, mes, dia] = valor.split('-').map(Number);
      const data = new Date(ano, mes - 1, dia);
      return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
    })
    .test('data-nao-futura', 'A data de nascimento não pode ser futura', (valor) => {
      if (!valor || !DATA_ISO_REGEX.test(valor)) return true;
      const [ano, mes, dia] = valor.split('-').map(Number);
      return new Date(ano, mes - 1, dia).getTime() <= Date.now();
    }),
  peso: number()
    .positive('O peso deve ser maior que zero')
    .nullable(),
  condicaoCronica: boolean().default(false),
  castrado: boolean().default(false),
  foto: string().nullable(),
  alergias: string().nullable(),
  observacoes: string().nullable(),
  responsavelId: string().required('O pet precisa estar vinculado a um responsável'),
});

type Pet = InferType<typeof petSchema>;

export { Pet, petSchema, ESPECIES, PORTES, SEXOS };
