import { InferType, object, string, ref } from 'yup';
import { PERFIS } from './session';

const registerSchema = object({
  nome: string().required('O nome é obrigatório').min(3, 'O nome deve ter ao menos 3 caracteres'),
  email: string().required('O e-mail é obrigatório').email('Informe um e-mail válido'),
  senha: string().required('A senha é obrigatória').min(6, 'A senha deve ter ao menos 6 caracteres'),
  confirmarSenha: string()
    .required('Confirme a senha')
    .oneOf([ref('senha')], 'As senhas não conferem'),
  perfil: string().oneOf(PERFIS, 'Selecione um perfil').required('Selecione um perfil'),

  // Obrigatório para TUTOR (a API responde REGISTRO_INCOMPLETO sem ele)
  telefone: string().when('perfil', {
    is: 'TUTOR',
    then: (schema) => schema.required('O telefone é obrigatório para responsáveis'),
    otherwise: (schema) => schema.nullable(),
  }),

  endereco: string().nullable(),

  // Obrigatório para VET (a API responde REGISTRO_INCOMPLETO sem ele)
  crmv: string().when('perfil', {
    is: 'VET',
    then: (schema) => schema.required('O CRMV é obrigatório para veterinários'),
    otherwise: (schema) => schema.nullable(),
  }),
});

type RegisterFormValues = InferType<typeof registerSchema>;
export { RegisterFormValues, registerSchema };