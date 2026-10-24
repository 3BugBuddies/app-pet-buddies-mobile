import { useContext, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/authContext';
import { USE_API } from '../repository/apiClient';
import { prescriptionSchema, type NarrativaPrescricaoRequest, type PrescricaoDraft } from '../model/prescription';
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
}

const usePrescricaoDraftControl = ({ animalId, registroAtendimentoId }: UsePrescricaoDraftControlParams) => {
  const [medicamento, setMedicamento] = useState('');
  const [doseMin, setDoseMin] = useState(0);
  const [doseMax, setDoseMax] = useState(0);
  const [unidade, setUnidade] = useState('');
  const [frequenciaDia, setFrequenciaDia] = useState(0);
  const [duracaoDias, setDuracaoDias] = useState(0);
  const [orientacao, setOrientacao] = useState('');
  const [regras, setRegras] = useState<RegraDraft[]>([]);
  const [receitaModelo, setReceitaModelo] = useState<{ id: number; versao: number } | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});

  const removerRegra = (index: number) => {
    setRegras((atual) => atual.filter((_, i) => i !== index));
  };

  const validar = async (): Promise<PrescricaoDraft | null> => {
    setErros({});
    try {
      await draftFieldsSchema.validate(
        { medicamento, doseMin, doseMax, unidade, frequenciaDia, duracaoDias, orientacao },
        { abortEarly: false }
      );
      return {
        animalId,
        registroAtendimentoId,
        medicamento,
        doseMin,
        doseMax,
        unidade,
        frequenciaDia,
        duracaoDias,
        orientacao,
        regras,
        ...(receitaModelo ? { receitaModeloId: receitaModelo.id, receitaModeloVersao: receitaModelo.versao } : {}),
      };
    } catch (error: any) {
      if (!error?.inner) return null;
      const errosAtuais: Record<string, string> = {};
      error.inner.forEach((e: any) => {
        errosAtuais[e.path] = e.message;
      });
      setErros(errosAtuais);
      return null;
    }
  };

  return {
    medicamento, setMedicamento,
    doseMin, setDoseMin,
    doseMax, setDoseMax,
    unidade, setUnidade,
    frequenciaDia, setFrequenciaDia,
    duracaoDias, setDuracaoDias,
    orientacao, setOrientacao,
    regras, setRegras,
    removerRegra,
    setReceitaModelo,
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

export {
  usePrescricaoDraftControl,
  useNovaRegraControl,
  useCondicoesClinicas,
  useCriarCondicao,
  useDraftPrescription,
  usePrescriptionTemplates,
};
