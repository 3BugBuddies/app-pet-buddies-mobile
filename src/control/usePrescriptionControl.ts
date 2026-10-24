import { useContext, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/authContext';
import { USE_API } from '../repository/apiClient';
import {
  prescriptionSchema,
  type ItemReceitaDraft,
  type NarrativaPrescricaoRequest,
  type ReceitaDraft,
} from '../model/prescription';
import {
  OPERADORES,
  TP_ACAO,
  normalizarTexto,
  type CondicaoClinica,
  type Operador,
  type RegraDraft,
  type TipoAcao,
} from '../model/prescriptionRule';
import {
  createCondicaoClinica,
  getClinicaIdDoVeterinario,
  getCondicoesClinicas,
} from '../repository/condicaoClinicaRepository';
import { draftPrescription } from '../repository/prescriptionRepository';
import { getPrescriptionTemplates } from '../repository/templatePrescriptionRepository';

// So os campos que a PrescricaoScreen coleta — id/dataInicio/veterinarioId/animalId
// entram depois, quando o rascunho vira prescricao de verdade (na assinatura).
const draftFieldsSchema = prescriptionSchema.pick([
  'medicamento',
  'doseMin',
  'doseMax',
  'unidade',
  'frequenciaDia',
  'duracaoDias',
  'orientacao',
]);

interface UsePrescricaoDraftControlParams {
  animalId: string;
  registroAtendimentoId: string;
  // Receita já montada: reabrir a prescrição a partir do fechamento não começa em branco.
  initial?: ReceitaDraft | null;
}

// Condição que a IA propôs e que ainda não existe no catálogo: espera "Criar e usar" ou "Descartar".
interface CondicaoNovaPendente {
  chave: string;
  rotulo: string;
  tipoDado: 'BOOLEANO' | 'NUMERICO';
  acao: TipoAcao;
  operador: Operador | null;
  limite: number | null;
}

const emptyItem = (key: string): ItemReceitaDraft => ({
  key,
  medicamento: '',
  doseMin: 0,
  doseMax: 0,
  unidade: '',
  frequenciaDia: 0,
  duracaoDias: 0,
  orientacao: '',
  regras: [],
});

const usePrescricaoDraftControl = ({ animalId, registroAtendimentoId, initial }: UsePrescricaoDraftControlParams) => {
  const counter = useRef(initial?.itens.length ?? 1);
  const [itens, setItens] = useState<ItemReceitaDraft[]>(() =>
    initial && initial.itens.length > 0 ? initial.itens : [emptyItem('med-1')]
  );
  // Só um cartão fica aberto por vez; reabrir uma receita já montada abre o primeiro.
  const [openKey, setOpenKey] = useState<string | null>(() => (initial?.itens[0]?.key ?? 'med-1'));
  const [condicoesNovas, setCondicoesNovasState] = useState<Record<string, CondicaoNovaPendente[]>>({});
  const [erros, setErros] = useState<Record<string, string>>({});

  const nextKey = () => {
    counter.current += 1;
    return `med-${counter.current}`;
  };

  const addItem = (patch?: Partial<ItemReceitaDraft>) => {
    const key = nextKey();
    setItens((atual) => [...atual, { ...emptyItem(key), ...patch, key }]);
    setOpenKey(key);
    return key;
  };

  const removeItem = (key: string) => {
    const restantes = itens.filter((i) => i.key !== key);
    if (restantes.length === 0) {
      const novo = emptyItem(nextKey());
      setItens([novo]);
      setOpenKey(novo.key);
    } else {
      setItens(restantes);
      if (openKey === key) setOpenKey(restantes[restantes.length - 1].key);
    }
    setCondicoesNovasState((atual) => {
      const { [key]: _removido, ...resto } = atual;
      return resto;
    });
  };

  const updateItem = (key: string, patch: Partial<ItemReceitaDraft>) =>
    setItens((atual) => atual.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  const setRegras = (key: string, atualizar: (regras: RegraDraft[]) => RegraDraft[]) =>
    setItens((atual) => atual.map((i) => (i.key === key ? { ...i, regras: atualizar(i.regras) } : i)));

  const setCondicoesNovas = (key: string, lista: CondicaoNovaPendente[]) =>
    setCondicoesNovasState((atual) => ({ ...atual, [key]: lista }));

  const toggleOpen = (key: string) => setOpenKey((atual) => (atual === key ? null : key));

  // Troca a receita inteira (resultado do assistente): o primeiro medicamento fica aberto.
  const replaceItens = (novos: Omit<ItemReceitaDraft, 'key'>[]) => {
    const comChave = (novos.length > 0 ? novos : [emptyItem('')]).map((i) => ({ ...i, key: nextKey() }));
    setItens(comChave);
    setOpenKey(comChave[0].key);
    setCondicoesNovasState({});
    return comChave.map((i) => i.key);
  };

  const validar = async (): Promise<ReceitaDraft | null> => {
    setErros({});
    const errosAtuais: Record<string, string> = {};
    for (const item of itens) {
      try {
        await draftFieldsSchema.validate(item, { abortEarly: false });
      } catch (error: any) {
        if (!error?.inner) return null;
        error.inner.forEach((e: any) => {
          errosAtuais[`${item.key}.${e.path}`] = e.message;
        });
      }
    }
    // O fechamento recusa o mesmo medicamento duas vezes; avisa já no cartão repetido.
    const vistos = new Set<string>();
    for (const item of itens) {
      const nome = normalizarTexto(item.medicamento);
      if (!nome) continue;
      if (vistos.has(nome)) errosAtuais[`${item.key}.medicamento`] = 'Este medicamento já está na receita.';
      vistos.add(nome);
    }
    if (Object.keys(errosAtuais).length > 0) {
      setErros(errosAtuais);
      const primeiro = itens.find((i) => Object.keys(errosAtuais).some((k) => k.startsWith(`${i.key}.`)));
      if (primeiro) setOpenKey(primeiro.key);
      return null;
    }
    return { animalId, registroAtendimentoId, itens };
  };

  return {
    itens,
    openKey,
    toggleOpen,
    addItem,
    removeItem,
    updateItem,
    setRegras,
    replaceItens,
    condicoesNovas,
    setCondicoesNovas,
    erros,
    validar,
  };
};

// Clínica da vet logada (GET /veterinario/{id}): escopo do catálogo de condições.
const useClinicaIdDaVet = () => {
  const { session } = useContext(AuthContext);
  const veterinarioId = session?.veterinarioId;
  return useQuery({
    queryKey: ['veterinarioClinicaId', veterinarioId],
    queryFn: () => getClinicaIdDoVeterinario(veterinarioId as number | string),
    enabled: veterinarioId != null,
    staleTime: Infinity,
  });
};

// Catálogo de condições da clínica (GET /condicao-clinica?clinicaId=).
const useCondicoesClinicas = () => {
  const { data: clinicaId } = useClinicaIdDaVet();
  return useQuery({
    queryKey: ['condicoesClinicas', clinicaId],
    queryFn: () => getCondicoesClinicas(clinicaId ?? null),
    enabled: clinicaId != null || !USE_API,
    staleTime: 5 * 60 * 1000,
  });
};

// Cria a condição na clínica da vet logada (409 = já existe, o repositório devolve a existente).
const useCriarCondicao = () => {
  const { session } = useContext(AuthContext);
  const { data: clinicaId } = useClinicaIdDaVet();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nova: { rotulo: string; tipoDado: 'BOOLEANO' | 'NUMERICO'; unidade?: string | null }) => {
      if (clinicaId == null || session?.veterinarioId == null) {
        throw new Error('Não foi possível identificar a sua clínica. Entre novamente.');
      }
      return createCondicaoClinica({ ...nova, clinicaId, veterinarioAutorId: Number(session.veterinarioId) });
    },
    // Já entra no catálogo em cache para a vet poder selecioná-la na hora.
    onSuccess: (criada) =>
      queryClient.setQueryData<CondicaoClinica[]>(['condicoesClinicas', clinicaId], (atual = []) =>
        atual.some((c) => c.id === criada.id) ? atual : [...atual, criada]
      ),
  });
};

// Receitas-modelo da clínica (GET /receita-modelo).
const usePrescriptionTemplates = () =>
  useQuery({
    queryKey: ['receitasModelo'],
    queryFn: getPrescriptionTemplates,
  });

type TipoRegra = 'RELATO' | 'MEDIDA';

const useNovaRegraControl = (catalogo: CondicaoClinica[]) => {
  const [condicaoClinicaId, setCondicaoClinicaId] = useState<number | null>(null);
  const [busca, setBusca] = useState('');
  const [tipoRegra, setTipoRegra] = useState<TipoRegra>('RELATO');
  const [acao, setAcao] = useState<TipoAcao>('DOSE_MIN');
  const [operador, setOperador] = useState<Operador>('MAIOR_QUE');
  const [limiteTexto, setLimiteTexto] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const termo = normalizarTexto(busca);
  // Busca local sem acento e sem caixa; sinais de alarme aparecem, mas não são selecionáveis.
  const tipoDado = tipoRegra === 'MEDIDA' ? 'NUMERICO' : 'BOOLEANO';
  const filtradas = catalogo.filter(
    (c) => c.tipoDado === tipoDado && (!termo || normalizarTexto(c.rotulo).includes(termo))
  );
  const condicao = catalogo.find((c) => c.id === condicaoClinicaId && !c.critica && c.tipoDado === tipoDado);

  const escolherTipoRegra = (tipo: TipoRegra) => {
    setTipoRegra(tipo);
    setCondicaoClinicaId(null);
    setErro(null);
  };
  const termoCriavel =
    termo && !catalogo.some((c) => normalizarTexto(c.rotulo) === termo) ? busca.trim() : null;

  const selecionarCondicao = (id: number) => {
    setCondicaoClinicaId(id);
    setErro(null);
  };

  // Condição numérica exige operador e limite; booleana não aceita nenhum dos dois (a API recusa).
  const construirRegra = (): RegraDraft | null => {
    if (!condicao) {
      setErro('Selecione a condição que aciona a regra.');
      return null;
    }
    if (condicao.tipoDado === 'NUMERICO') {
      const limite = parseFloat(limiteTexto.replace(',', '.'));
      if (Number.isNaN(limite)) {
        setErro('Informe o valor limite da condição.');
        return null;
      }
      setErro(null);
      return { condicaoClinicaId: condicao.id, rotuloCongelado: condicao.rotulo, acao, operador, limite };
    }
    setErro(null);
    return { condicaoClinicaId: condicao.id, rotuloCongelado: condicao.rotulo, acao, operador: null, limite: null };
  };

  const reiniciar = () => {
    setCondicaoClinicaId(null);
    setBusca('');
    setTipoRegra('RELATO');
    setAcao('DOSE_MIN');
    setOperador('MAIOR_QUE');
    setLimiteTexto('');
    setErro(null);
  };

  return {
    condicao,
    filtradas,
    termoCriavel,
    acoes: TP_ACAO,
    operadores: OPERADORES,
    busca,
    setBusca,
    tipoRegra,
    escolherTipoRegra,
    condicaoClinicaId,
    selecionarCondicao,
    acao,
    setAcao,
    operador,
    setOperador,
    limiteTexto,
    setLimiteTexto,
    erro,
    construirRegra,
    reiniciar,
  };
};

// Envia narrativa do veterinário para a IA e recebe rascunho estruturado.
// O chamador usa os campos retornados para preencher automaticamente o formulário.
const useDraftPrescription = () => {
  return useMutation({
    mutationFn: (data: NarrativaPrescricaoRequest) => draftPrescription(data),
  });
};

export type { CondicaoNovaPendente };
export {
  usePrescricaoDraftControl,
  useNovaRegraControl,
  useCondicoesClinicas,
  useCriarCondicao,
  useDraftPrescription,
  usePrescriptionTemplates,
};
