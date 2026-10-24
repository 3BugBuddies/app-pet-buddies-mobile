import { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/authContext';
import { accountSchema, passwordSchema } from '../model/account';
import { formatPhone } from '../model/phone';
import { changePassword, getResponsavel, updateResponsavel } from '../repository/responsavelRepository';
import { saveSession } from '../repository/authRepository';
import { SESSION_QUERY_KEY } from './authControl';

const responsavelKey = (id: string) => ['responsavel', id];

// A API devolve "campo: mensagem" em 400; sem prefixo conhecido, o erro vai para o formulário.
const apiErrors = (err: any, campos: string[], fallback: string): Record<string, string> => {
  if (!err?.response) return { geral: 'Não foi possível conectar ao servidor. Verifique sua conexão.' };
  const message: string = err.response.data?.message ?? fallback;
  const campo = campos.find((c) => message.startsWith(`${c}:`));
  return campo ? { [campo]: message.slice(campo.length + 1).trim() } : { geral: message };
};

const yupErrors = (error: any): Record<string, string> | null => {
  if (!error?.inner) return null;
  const erros: Record<string, string> = {};
  error.inner.forEach((e: any) => {
    if (!erros[e.path]) erros[e.path] = e.message;
  });
  return erros;
};

const useAccountControl = (onSaved: () => void) => {
  const { session, setSession } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const id = session?.responsavelId != null ? String(session.responsavelId) : '';

  const query = useQuery({
    queryKey: responsavelKey(id),
    queryFn: () => getResponsavel(id),
    enabled: !!id,
  });

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    if (query.data && !carregado) {
      setNome(query.data.nome);
      setTelefone(formatPhone(query.data.telefone ?? ''));
      setEndereco(query.data.endereco ?? '');
      setCarregado(true);
    }
  }, [query.data, carregado]);

  const mutation = useMutation({
    mutationFn: async () => {
      const dados = await accountSchema.validate({ nome, telefone, endereco }, { abortEarly: false });
      const atual = query.data;
      if (!atual) throw new Error('Dados da conta ainda não carregados.');
      const salvo = await updateResponsavel(id, {
        nome: dados.nome,
        telefone: dados.telefone,
        email: atual.email,
        endereco: dados.endereco || undefined,
      });
      return { salvo, nome: dados.nome };
    },
    onSuccess: async ({ salvo, nome: nomeNovo }) => {
      queryClient.setQueryData(responsavelKey(id), salvo);
      if (session) {
        const nova = { ...session, nome: nomeNovo };
        await saveSession(nova);
        queryClient.setQueryData(SESSION_QUERY_KEY, nova);
        setSession(nova);
      }
      onSaved();
    },
  });

  const salvar = () => {
    setErros({});
    mutation.mutate(undefined, {
      onError: (error: any) => {
        setErros(
          yupErrors(error) ??
            (error?.response
              ? apiErrors(error, ['nome', 'telefone', 'endereco', 'email'], 'Não foi possível salvar.')
              : { geral: error?.message ?? 'Não foi possível salvar.' }),
        );
      },
    });
  };

  return {
    nome: query.data?.nome ?? session?.nome ?? '',
    email: query.data?.email ?? '',
    form: { nome, telefone, endereco },
    setNome,
    setEndereco,
    setTelefone: (texto: string) => setTelefone(formatPhone(texto)),
    erros,
    salvar,
    isSalvando: mutation.isPending,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

const usePasswordControl = (onChanged: () => void) => {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async () => {
      const dados = await passwordSchema.validate({ senhaAtual, senhaNova, confirmarSenha }, { abortEarly: false });
      await changePassword(dados.senhaAtual, dados.senhaNova);
    },
    onSuccess: onChanged,
  });

  const trocar = () => {
    setErros({});
    mutation.mutate(undefined, {
      onError: (error: any) => {
        const validacao = yupErrors(error);
        if (validacao) return setErros(validacao);
        if (error?.response?.status === 401) return setErros({ senhaAtual: 'Senha atual incorreta.' });
        setErros(apiErrors(error, ['senhaAtual', 'senhaNova'], 'Não foi possível trocar a senha.'));
      },
    });
  };

  return {
    senhaAtual, setSenhaAtual,
    senhaNova, setSenhaNova,
    confirmarSenha, setConfirmarSenha,
    erros,
    trocar,
    isTrocando: mutation.isPending,
  };
};

export { useAccountControl, usePasswordControl };
