import { InferType, object, string } from 'yup';

const loginSchema = object({
  email: string().required('O e-mail é obrigatório').email('Informe um e-mail válido'),
  senha: string().required('A senha é obrigatória').min(6, 'A senha deve ter ao menos 6 caracteres'),
});

type LoginFormValues = InferType<typeof loginSchema>;

export { LoginFormValues, loginSchema };
