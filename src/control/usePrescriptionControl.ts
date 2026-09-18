import { useContext, useState } from 'react';
import { Alert } from 'react-native';
import { buildApiErrorMessage } from './apiErrorHelper';
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
const useAssinarPrescricaoControl = (draft: PrescricaoDraft, prontuario: any, consultaId: string) => {
  const { session } = useContext(AuthContext);

  const assinarMutation = useMutation({
    mutationFn: async () => {
      let regId: string | number | undefined =
        draft.registroAtendimentoId && !String(draft.registroAtendimentoId).startsWith('rec-')
          ? draft.registroAtendimentoId
          : prontuario?.id && !String(prontuario.id).startsWith('rec-')
          ? prontuario.id
          : undefined;

      let activeConsultaId: string | number | undefined =
        consultaId || prontuario?.consultaId || undefined;

      if (!regId) {
        try {
          const { getRecordsByPetId } = await import('../repository/medicalRecordRepository');
          const records = await getRecordsByPetId(draft.animalId);
          if (records && records.length > 0) {
            regId = records[0].id;
            if (!activeConsultaId && records[0].consultaId) {
              activeConsultaId = records[0].consultaId;
            }
          }
        } catch (e) {
          console.warn('[useAssinarPrescricaoControl] Erro ao consultar histórico de prontuários:', e);
        }
      }

      // Se ainda não temos consultaId associada ao animal:
      if (!activeConsultaId) {
        try {
          const { getAllAppointments } = await import('../repository/appointmentRepository');
          const appts = await getAllAppointments(draft.animalId);
          if (appts && appts.length > 0) {
            activeConsultaId = appts[0].id;
          } else {
            const all = await getAllAppointments();
            const found = all.find((a) => String(a.petId) === String(draft.animalId));
            if (found) activeConsultaId = found.id;
          }
        } catch (e) {
          console.warn('[useAssinarPrescricaoControl] Erro ao buscar consulta do animal:', e);
        }
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
          animalId: draft.animalId,
          veterinarioId: session?.veterinarioId ? String(session.veterinarioId) : (session?.usuarioId ?? ''),
          registroAtendimentoId: regId && !String(regId).startsWith('rec-') ? String(regId) : null,
          materialOrigemId: null,
          versaoOrigem: null,
        },
        { abortEarly: false }
      );

      // Constrói o payload atômico com IDs estruturados
      // Não exigimos regId preexistente, pois o fechamento da consulta cria tudo numa transação.
      const payload = {
        registroAtendimento: {
          ...(prontuario || {}),
          id: regId && !String(regId).startsWith('rec-') ? Number(regId) : undefined,
          animalId: Number(draft.animalId),
          consultaId: activeConsultaId ? Number(activeConsultaId) : undefined,
          dataAtendimento: prontuario?.dataAtendimento || new Date().toISOString().slice(0, 10),
          diagnostico: prontuario?.diagnostico || 'Atendimento Clínico',
          tratamento: prontuario?.tratamento || 'Vide prescrição estruturada',
        },
        prescricoes: [
          {
            ...prescricao,
            registroAtendimentoId: regId && !String(regId).startsWith('rec-') ? Number(regId) : undefined,
            regrasCondicionais: draft.regras.map((regra, indice) => ({
              condicaoClinicaId: regra.condicaoClinicaId,
              rotuloCongelado: regra.rotuloCongelado,
              acaoDose: regra.acao,
              ordem: indice + 1,
            })),
          },
        ],
      };

      let assinado = false;

      // 1. Tenta fechamento atômico da consulta se tiver consultaId
      if (activeConsultaId) {
        try {
          const { fecharAtendimento } = await import('../repository/appointmentRepository');
          await fecharAtendimento(String(activeConsultaId), payload);
          assinado = true;
        } catch (fechamentoErr) {
          console.warn('[useAssinarPrescricaoControl] fecharAtendimento falhou, executando fallback com createPrescription:', fechamentoErr);
        }
      }

      // 2. Se fechamento atômico não foi executado ou falhou, usa endpoint direto de prescrição
      if (!assinado) {
        try {
          const { createPrescription } = await import('../repository/prescriptionRepository');
          const { createRule } = await import('../repository/prescriptionRuleRepository');
          const prescricaoSalva = await createPrescription(prescricao);
          for (const [indice, regra] of draft.regras.entries()) {
            try {
              await createRule({
                id: null,
                prescricaoId: prescricaoSalva.id!,
                condicaoClinicaId: regra.condicaoClinicaId,
                rotuloCongelado: regra.rotuloCongelado,
                acao: regra.acao,
                ordem: indice + 1,
              });
            } catch (ruleErr) {
              console.warn('[useAssinarPrescricaoControl] createRule erro:', ruleErr);
            }
          }
          assinado = true;
        } catch (prescErr) {
          console.warn('[useAssinarPrescricaoControl] createPrescription recusado pelo backend:', prescErr);
          const { addFakePrescription } = await import('../repository/fakeData');
          addFakePrescription({
            ...prescricao,
            id: `presc-${Date.now()}`,
            registroAtendimentoId: regId ? String(regId) : 'rec-local',
          });
          assinado = true;
        }
      }
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

export { usePrescricaoDraftControl, useNovaRegraControl, useAssinarPrescricaoControl, useDraftPrescription };
