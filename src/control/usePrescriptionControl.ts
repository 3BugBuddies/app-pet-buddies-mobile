import { useContext, useState } from 'react';
import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { AuthContext } from '../context/authContext';
import { prescriptionSchema, type NarrativaPrescricaoRequest, type PrescricaoDraft } from '../model/prescription';
import { CONDICOES_CLINICAS, TP_ACAO, type RegraDraft } from '../model/prescriptionRule';
import { createPrescription, draftPrescription } from '../repository/prescriptionRepository';
import { createRule } from '../repository/prescriptionRuleRepository';

const hojeIso = () => new Date().toISOString().slice(0, 10);

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
      // Usa o estado real de regras em vez de array vazio hardcoded
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

const useNovaRegraControl = () => {
  const [condicaoClinicaId, setCondicaoClinicaId] = useState<number>(CONDICOES_CLINICAS[0].id);
  const [acao, setAcao] = useState<(typeof TP_ACAO)[number]>('DOSE_MIN');

  const construirRegra = (): RegraDraft => {
    const condicao = CONDICOES_CLINICAS.find((item) => item.id === condicaoClinicaId)!;
    return { condicaoClinicaId, rotuloCongelado: condicao.rotulo, acao };
  };

  return {
    condicoes: CONDICOES_CLINICAS,
    acoes: TP_ACAO,
    condicaoClinicaId,
    setCondicaoClinicaId,
    acao,
    setAcao,
    construirRegra,
  };
};

// Unico ponto que grava no repository: a prescricao no schema real so existe
// assinada (T_PB_PRESCRICAO nao tem status de rascunho), entao tudo que veio
// dos passos anteriores (medicamento, dose, regras) so vira registro persistido
// aqui, na assinatura.
const useAssinarPrescricaoControl = (draft: PrescricaoDraft) => {
  const { session } = useContext(AuthContext);

  const assinarMutation = useMutation({
    mutationFn: async () => {
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
          animalId: draft.animalId,
          veterinarioId: session?.veterinarioId ? String(session.veterinarioId) : (session?.usuarioId ?? ''),
          registroAtendimentoId: draft.registroAtendimentoId || null,
          materialOrigemId: null,
          versaoOrigem: null,
        },
        { abortEarly: false }
      );

      const prescricaoSalva = await createPrescription(prescricao);

      for (const [indice, regra] of draft.regras.entries()) {
        await createRule({
          id: null,
          prescricaoId: prescricaoSalva.id!,
          condicaoClinicaId: regra.condicaoClinicaId,
          rotuloCongelado: regra.rotuloCongelado,
          acao: regra.acao,
          ordem: indice + 1,
        });
      }

      return prescricaoSalva;
    },
    onError: (error: any) => {
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        'Erro desconhecido';
      Alert.alert('Erro ao assinar prescrição', `O servidor recusou a solicitação.\n\nDetalhe: ${apiMessage}`);
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

export { usePrescricaoDraftControl, useNovaRegraControl, useAssinarPrescricaoControl, useDraftPrescription };
