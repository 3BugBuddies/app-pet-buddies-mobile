import { InferType, object, ref, string } from 'yup';

interface Responsavel {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  endereco?: string | null;
}

const accountSchema = object({
  nome: string().trim().required('O nome é obrigatório'),
  telefone: string().required('O telefone é obrigatório').min(14, 'Informe o telefone com DDD'),
  endereco: string().trim(),
});

const passwordSchema = object({
  senhaAtual: string().required('Informe a senha atual'),
  senhaNova: string().required('Informe a nova senha').min(6, 'A senha deve ter ao menos 6 caracteres'),
  confirmarSenha: string()
    .required('Confirme a nova senha')
    .oneOf([ref('senhaNova')], 'As senhas não conferem'),
});

type AccountFormValues = InferType<typeof accountSchema>;

export { accountSchema, passwordSchema };
export type { AccountFormValues, Responsavel };
