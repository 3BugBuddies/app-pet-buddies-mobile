import { useContext, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AuthContext } from '../context/authContext';
import { prescriptionSchema, type PrescricaoDraft } from '../model/prescription';
import { CONDICOES_CLINICAS, TP_ACAO, type RegraDraft } from '../model/prescriptionRule';
import { createPrescription } from '../repository/prescriptionRepository';
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
  const [erros, setErros] = useState<Record<string, string>>({});

  const validar = async (): Promise<PrescricaoDraft | null> => {
    setErros({});
    try {
      await draftFieldsSchema.validate(
        { medicamento, doseMin, doseMax, unidade, frequenciaDia, duracaoDias, orientacao },
        { abortEarly: false }
      );
      return { animalId, registroAtendimentoId, medicamento, doseMin, doseMax, unidade, frequenciaDia, duracaoDias, orientacao, regras: [] };
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
    erros,
    validar,
  };
};

const useNovaRegraControl = () => {
  const [condicaoClinicaId, setCondicaoClinicaId] = useState<(typeof CONDICOES_CLINICAS)[number]['id']>(
    CONDICOES_CLINICAS[0].id
  );
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
          id: `presc-${Date.now()}`,
          medicamento: draft.medicamento,
          doseMin: draft.doseMin,
          doseMax: draft.doseMax,
          unidade: draft.unidade,
          frequenciaDia: draft.frequenciaDia,
          duracaoDias: draft.duracaoDias,
          dataInicio: hojeIso(),
          orientacao: draft.orientacao || undefined,
          animalId: draft.animalId,
          veterinarioId: session?.usuarioId ?? '',
          registroAtendimentoId: draft.registroAtendimentoId,
        },
        { abortEarly: false }
      );

      const prescricaoSalva = await createPrescription(prescricao);

      for (const [indice, regra] of draft.regras.entries()) {
        await createRule({
          id: `regra-${prescricaoSalva.id}-${indice}`,
          prescricaoId: prescricaoSalva.id!,
          condicaoClinicaId: regra.condicaoClinicaId,
          rotuloCongelado: regra.rotuloCongelado,
          acao: regra.acao,
        });
      }

      return prescricaoSalva;
    },
  });

  return {
    assinar: () => assinarMutation.mutateAsync(),
    isAssinando: assinarMutation.isPending,
    erro: assinarMutation.isError ? 'Não foi possível assinar a prescrição.' : null,
  };
};

export { usePrescricaoDraftControl, useNovaRegraControl, useAssinarPrescricaoControl };
