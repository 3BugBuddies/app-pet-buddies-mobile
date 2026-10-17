import { useContext, useState } from 'react';
import { Alert } from 'react-native';
import { buildApiErrorMessage } from './apiErrorHelper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/authContext';
import { prescriptionSchema, type NarrativaPrescricaoRequest, type PrescricaoDraft } from '../model/prescription';
import {
  OPERADORES,
  TP_ACAO,
  type CondicaoClinica,
  type Operador,
  type RegraDraft,
  type TipoAcao,
} from '../model/prescriptionRule';
import { fecharAtendimento } from '../repository/appointmentRepository';
import { getCondicoesClinicas } from '../repository/condicaoClinicaRepository';
import { draftPrescription } from '../repository/prescriptionRepository';

// Data local AAAA-MM-DD (toISOString usaria UTC e viraria o dia à noite no Brasil).
const hojeIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

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
  const [doseMin, setDoseMin] = useState(1);
  const [doseMax, setDoseMax] = useState(1);
  const [unidade, setUnidade] = useState('mg');
  const [frequenciaDia, setFrequenciaDia] = useState(1);
  const [duracaoDias, setDuracaoDias] = useState(7);
  const [orientacao, setOrientacao] = useState('');
  const [regras, setRegras] = useState<RegraDraft[]>([]);
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
      return { animalId, registroAtendimentoId, medicamento, doseMin, doseMax, unidade, frequenciaDia, duracaoDias, orientacao, regras };
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
    erros,
    validar,
  };
};

// Catálogo de condições da clínica (GET /condicao-clinica).
const useCondicoesClinicas = () =>
  useQuery({
    queryKey: ['condicoesClinicas'],
    queryFn: getCondicoesClinicas,
    staleTime: 5 * 60 * 1000,
  });

const useNovaRegraControl = (condicoes: CondicaoClinica[]) => {
  const [condicaoSelecionada, setCondicaoClinicaId] = useState<number | null>(null);
  const [acao, setAcao] = useState<TipoAcao>('DOSE_MIN');
  const [operador, setOperador] = useState<Operador>('MAIOR_QUE');
  const [limiteTexto, setLimiteTexto] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  // Enquanto o vet não escolhe, vale a primeira condição do catálogo.
  const condicaoClinicaId = condicaoSelecionada ?? condicoes[0]?.id ?? null;
  const condicao = condicoes.find((item) => item.id === condicaoClinicaId);

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

  return {
    condicoes,
    condicao,
    acoes: TP_ACAO,
    operadores: OPERADORES,
    condicaoClinicaId,
    setCondicaoClinicaId,
    acao,
    setAcao,
    operador,
    setOperador,
    limiteTexto,
    setLimiteTexto,
    erro,
    construirRegra,
  };
};

// Único ponto que grava a prescrição: a API só a cria assinada, junto com o registro do
// atendimento, numa chamada atômica (POST /consulta/{id}/fechamento). Se qualquer parte falha,
// nada é gravado pela metade.
const useAssinarPrescricaoControl = (draft: PrescricaoDraft, prontuario: any, consultaId: string) => {
  const { session } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const assinarMutation = useMutation({
    mutationFn: async () => {
      const consultaAtualId = consultaId || prontuario?.consultaId;
      if (!consultaAtualId) {
        throw new Error('Consulta não identificada. Volte ao prontuário e salve o atendimento de novo.');
      }
      if (!session?.veterinarioId) {
        throw new Error('Sessão sem veterinário: entre novamente para assinar.');
      }

      const prescricao = await prescriptionSchema.validate(
        {
          id: null,
          medicamento: draft.medicamento,
          doseMin: draft.doseMin,
          doseMax: draft.doseMax,
          unidade: draft.unidade,
          frequenciaDia: draft.frequenciaDia,
          duracaoDias: draft.duracaoDias,
          dataInicio: hojeIso(),
          orientacao: draft.orientacao || undefined,
          animalId: String(draft.animalId),
          veterinarioId: String(session.veterinarioId),
          registroAtendimentoId: null,
          materialOrigemId: null,
          versaoOrigem: null,
        },
        { abortEarly: false }
      );

      await fecharAtendimento(String(consultaAtualId), {
        registroAtendimento: prontuario,
        prescricoes: [
          {
            medicamento: prescricao.medicamento,
            doseMin: prescricao.doseMin,
            doseMax: prescricao.doseMax,
            unidade: prescricao.unidade,
            frequenciaDia: prescricao.frequenciaDia,
            duracaoDias: prescricao.duracaoDias,
            dataInicio: prescricao.dataInicio,
            orientacao: prescricao.orientacao ?? undefined,
            regras: (draft.regras ?? []).map((regra, indice) => ({
              condicaoClinicaId: regra.condicaoClinicaId,
              rotuloCongelado: regra.rotuloCongelado, // só o mock usa; removido antes de ir à API
              operador: regra.operador ?? undefined,
              limite: regra.limite ?? undefined,
              acaoDose: regra.acao,
              ordem: indice + 1,
            })),
          },
        ],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['prontuario'] });
      queryClient.invalidateQueries({ queryKey: ['prescricao'] });
      queryClient.invalidateQueries({ queryKey: ['carePlan'] });
    },
    onError: (error: any) => {
      Alert.alert('Erro ao assinar prescrição', buildApiErrorMessage(error));
    },
  });

  return {
    assinar: () => assinarMutation.mutateAsync(),
    isAssinando: assinarMutation.isPending,
    erro: assinarMutation.isError ? 'Não foi possível assinar a prescrição.' : null,
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
  useAssinarPrescricaoControl,
  useDraftPrescription,
};
