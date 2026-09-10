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
});

type RegisterFormValues = InferType<typeof registerSchema>;

export { RegisterFormValues, registerSchema };
