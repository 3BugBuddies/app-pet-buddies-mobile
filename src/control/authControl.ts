import { useContext, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/authContext';
import { loginSchema } from '../model/login';
import { registerSchema } from '../model/register';
import { PERFIS, type Perfil } from '../model/session';
import { clearSession, getSession, login, register, saveSession } from '../repository/authRepository';

const SESSION_QUERY_KEY = ['auth', 'sessao'];

const aplicarMascaraTelefone = (valor: string) => {
  let v = valor.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 6) return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
  if (v.length > 2) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
  return v;
};

const sanitizarCrmv = (valor: string) => valor.toUpperCase();

const useSessionBootstrap = () => {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: getSession,
    staleTime: Infinity,
  });
};

const errosDeValidacao = (error: any): Record<string, string> | null => {
  if (!error?.inner) return null;
  const erros: Record<string, string> = {};
  error.inner.forEach((e: any) => {
    erros[e.path] = e.message;
  });
  return erros;
};

const useLoginControl = () => {
  const { setSession } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});

  const loginMutation = useMutation({
    mutationFn: async () => {
      const credenciais = await loginSchema.validate({ email, senha }, { abortEarly: false });
      return login(credenciais);
    },
    onSuccess: async (sessao) => {
      await saveSession(sessao);
      queryClient.setQueryData(SESSION_QUERY_KEY, sessao);
      setSession(sessao);
    },
  });

  const entrar = () => {
    setErros({});
    loginMutation.mutate(undefined, {
      onError: (error: any) => {
        setErros(errosDeValidacao(error) ?? { geral: error.message ?? 'Não foi possível entrar.' });
      },
    });
  };

  return {
    email, setEmail,
    senha, setSenha,
    erros,
    entrar,
    isEntrando: loginMutation.isPending,
  };
};

const useRegisterControl = () => {
  const { setSession } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [perfil, setPerfil] = useState<Perfil>('TUTOR');
  const [telefone, setTelefone] = useState('');
  const [crmv, setCrmv] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});

  const handleTelefoneChange = (text: string) => setTelefone(aplicarMascaraTelefone(text));
  const handleCrmvChange = (text: string) => setCrmv(sanitizarCrmv(text));

  const registerMutation = useMutation({
    mutationFn: async () => {
      const dados = await registerSchema.validate(
        { nome, email, senha, confirmarSenha, perfil, telefone, crmv },
        { abortEarly: false }
      );
      return register(dados);
    },
    onSuccess: async (sessao) => {
      await saveSession(sessao);
      queryClient.setQueryData(SESSION_QUERY_KEY, sessao);
      setSession(sessao);
    },
  });

  const cadastrar = () => {
    setErros({});
    registerMutation.mutate(undefined, {
      onError: (error: any) => {
        setErros(errosDeValidacao(error) ?? { geral: error.message ?? 'Não foi possível cadastrar.' });
      },
    });
  };

  return {
    nome, setNome,
    email, setEmail,
    senha, setSenha,
    confirmarSenha, setConfirmarSenha,
    perfil, setPerfil,
    telefone, setTelefone, handleTelefoneChange,
    crmv, setCrmv, handleCrmvChange,
    perfis: PERFIS,
    erros,
    cadastrar,
    isCadastrando: registerMutation.isPending,
  };
};

const useLogoutControl = () => {
  const { clearSession: limparContexto } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: clearSession,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: SESSION_QUERY_KEY });
      limparContexto();
    },
  });

  return {
    sair: () => logoutMutation.mutate(),
    isSaindo: logoutMutation.isPending,
  };
};

export { useSessionBootstrap, useLoginControl, useRegisterControl, useLogoutControl };
