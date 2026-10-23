import { useContext, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { isAxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/authContext';
import type {
  ClosingDraft,
  ClosingPrescriptionDraft,
  OpenPlanItem,
  ClosingPrescription,
  ProcedureDraft,
  ClosingProcedure,
  ProcedureSection,
} from '../model/closing';
import { medicalRecordSchema } from '../model/medicalRecord';
import { prescriptionSchema } from '../model/prescription';
import type { TipoProcedimento } from '../model/procedure';
import { normalizeSearch } from '../model/text';
import {
  createWalkInAppointment,
  dateTimeLocal,
  fecharAtendimento,
  findTodaysOpenAppointment,
  isoLocal,
} from '../repository/appointmentRepository';
import { getOpenPreventiveItems } from '../repository/carePlanItemRepository';
import { getPetById, updatePet } from '../repository/petRepository';
import { buildApiErrorMessage } from './apiErrorHelper';
import { useAppointment } from './useAppointmentsControl';
import { usePet } from './usePetsControl';

const openItemsKey = (petId: string) => ['planoItensAbertos', petId];

const useOpenPlanItems = (petId: string) =>
  useQuery({ queryKey: openItemsKey(petId), queryFn: () => getOpenPreventiveItems(petId) });

const normalize = (text: string) => normalizeSearch(text.trim());

const TYPE_BY_SECTION: Record<ProcedureSection, TipoProcedimento> = {
  VACINA_VERMIFUGO: 'VACINACAO',
  EXAME: 'EXAME_LABORATORIAL',
  PROCEDIMENTO: 'OUTRO',
};

const itemWithSameName = (
  items: OpenPlanItem[],
  tipo: TipoProcedimento,
  nome: string,
  taken: Set<number>
) => {
  const target = normalize(nome);
  if (!target) return null;
  return items.find((i) => i.tipo === tipo && !taken.has(i.id) && normalize(i.nome) === target)?.id ?? null;
};

const composeNotes = (p: ProcedureDraft) =>
  [p.batch.trim() && `Lote/marca: ${p.batch.trim()}`, p.notes.trim() && `Reações/observações: ${p.notes.trim()}`]
    .filter(Boolean)
    .join(' · ') || undefined;

const useClosingForm = (petId: string, initialAppointmentId: string | undefined, prescription: ClosingPrescriptionDraft | null) => {
  const { session } = useContext(AuthContext);
  const veterinarioId = session?.veterinarioId;
  const { data: pet } = usePet(petId);

  const scheduledAppointment = useAppointment(initialAppointmentId ?? '');
  const openAppointment = useQuery({
    queryKey: ['appointments', 'aberta-hoje', petId, veterinarioId],
    queryFn: () => findTodaysOpenAppointment(petId, veterinarioId),
    enabled: !initialAppointmentId && !!veterinarioId,
  });
  const appointment = initialAppointmentId ? scheduledAppointment.data : openAppointment.data;
  const loadingAppointment = initialAppointmentId ? scheduledAppointment.isLoading : openAppointment.isLoading;

  const { data: items = [] } = useOpenPlanItems(petId);

  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [weight, setWeight] = useState('');
  const [procedures, setProcedures] = useState<ProcedureDraft[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const counter = useRef(0);

  const handleWeightChange = (text: string) => {
    let formatted = text.replace(/[^0-9,]/g, '');
    const parts = formatted.split(',');
    if (parts.length > 2) formatted = `${parts[0]},${parts.slice(1).join('')}`;
    setWeight(formatted);
  };

  const takenByOthers = (list: ProcedureDraft[], key: string) =>
    new Set(list.filter((p) => p.key !== key && p.itemPlanoId != null).map((p) => p.itemPlanoId as number));

  const add = (section: ProcedureSection) => {
    counter.current += 1;
    setProcedures((current) => [
      ...current,
      {
        key: `proc-${counter.current}`,
        section,
        tipo: TYPE_BY_SECTION[section],
        nome: '',
        batch: '',
        notes: '',
        itemPlanoId: null,
        manualItem: false,
      },
    ]);
  };

  const update = (key: string, patch: Partial<ProcedureDraft>) => {
    setProcedures((current) =>
      current.map((p) => {
        if (p.key !== key) return p;
        const next = { ...p, ...patch };
        const changedNameOrType = patch.nome !== undefined || patch.tipo !== undefined;
        if (changedNameOrType && !patch.manualItem && !next.manualItem && next.section === 'VACINA_VERMIFUGO') {
          next.itemPlanoId = itemWithSameName(items, next.tipo, next.nome, takenByOthers(current, key));
        }
        if (patch.tipo !== undefined && next.manualItem) {
          next.itemPlanoId = null;
          next.manualItem = false;
        }
        return next;
      })
    );
  };

  const remove = (key: string) => setProcedures((current) => current.filter((p) => p.key !== key));

  const availableItems = (p: ProcedureDraft) => {
    const taken = takenByOthers(procedures, p.key);
    return items.filter((i) => i.tipo === p.tipo && !taken.has(i.id));
  };

  const build = (): ClosingDraft | null => {
    const nextErrors: Record<string, string> = {};
    if (weight) {
      const n = parseFloat(weight.replace(',', '.'));
      if (Number.isNaN(n) || n <= 0) nextErrors.weight = 'Informe um peso maior que zero.';
    }
    procedures.forEach((p) => {
      if (!p.nome.trim()) nextErrors[p.key] = 'Informe o nome ou remova o item.';
      else if (p.nome.trim().length > 150) nextErrors[p.key] = 'O nome pode ter até 150 caracteres.';
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return null;
    return {
      petId,
      petName: pet?.nome ?? '',
      appointmentId: appointment?.id ?? null,
      reason,
      notes,
      weight,
      procedures,
      prescription,
    };
  };

  return {
    pet,
    appointment,
    loadingAppointment,
    reason, setReason,
    notes, setNotes,
    weight, handleWeightChange,
    procedures,
    add, update, remove,
    availableItems,
    errors,
    build,
  };
};

const useCompleteAppointment = () => {
  const { session } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const createdAppointmentId = useRef<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (draft: ClosingDraft) => {
      const veterinarioId = session?.veterinarioId;
      if (!veterinarioId) {
        throw new Error('Sessão sem veterinário: entre novamente para concluir o atendimento.');
      }

      let prescricoes: ClosingPrescription[] = [];
      if (draft.prescription) {
        const d = draft.prescription;
        const p = await prescriptionSchema.validate(
          {
            id: null,
            medicamento: d.medicamento,
            doseMin: d.doseMin,
            doseMax: d.doseMax,
            unidade: d.unidade,
            frequenciaDia: d.frequenciaDia,
            duracaoDias: d.duracaoDias,
            dataInicio: isoLocal(new Date()),
            orientacao: d.orientacao || undefined,
            animalId: String(d.animalId),
            veterinarioId: String(veterinarioId),
            registroAtendimentoId: null,
            materialOrigemId: null,
            versaoOrigem: null,
          },
          { abortEarly: false }
        );
        prescricoes = [
          {
            medicamento: p.medicamento,
            doseMin: p.doseMin,
            doseMax: p.doseMax,
            unidade: p.unidade,
            frequenciaDia: p.frequenciaDia,
            duracaoDias: p.duracaoDias,
            dataInicio: p.dataInicio,
            orientacao: p.orientacao ?? undefined,
            ...(d.receitaModeloId != null && d.receitaModeloVersao != null
              ? { receitaModeloId: d.receitaModeloId, receitaModeloVersao: d.receitaModeloVersao }
              : {}),
            regras: d.regras.map((regra, index) => ({
              condicaoClinicaId: regra.condicaoClinicaId,
              rotuloCongelado: regra.rotuloCongelado,
              operador: regra.operador ?? undefined,
              limite: regra.limite ?? undefined,
              acaoDose: regra.acao,
              ordem: index + 1,
            })),
          },
        ];
      }

      if (draft.weight) {
        const current = await getPetById(draft.petId);
        if (current) await updatePet({ ...current, peso: parseFloat(draft.weight.replace(',', '.')) });
      }

      // A consulta de encaixe só nasce aqui, na hora de enviar, e é reaproveitada se o envio falhar.
      let consultaId = draft.appointmentId ?? createdAppointmentId.current;
      if (!consultaId) {
        consultaId = (await createWalkInAppointment(draft.petId, veterinarioId)).id;
        createdAppointmentId.current = consultaId;
      }

      const record = await medicalRecordSchema.validate(
        {
          id: `rec-${Date.now()}`,
          animalId: draft.petId,
          consultaId,
          dataAtendimento: isoLocal(new Date()),
          anamnese: draft.reason.trim() || undefined,
          tratamento: draft.prescription ? 'Vide prescrição estruturada' : undefined,
          observacao: draft.notes.trim() || undefined,
        },
        { abortEarly: false }
      );

      const now = dateTimeLocal(new Date());
      const procedimentos: ClosingProcedure[] = draft.procedures.map((p) => ({
        tipo: p.tipo,
        nome: p.nome.trim(),
        observacao: composeNotes(p),
        dataPrevistaInicio: now,
        dataPrevistaFim: now,
        itemPlanoId: p.itemPlanoId ?? undefined,
      }));

      await fecharAtendimento(consultaId, { registroAtendimento: record, procedimentos, prescricoes });
    },
    onSuccess: (_data, draft) => {
      ['appointments', 'prontuario', 'prescricao', 'carePlan', 'procedures', 'pets', 'patients'].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      );
      queryClient.invalidateQueries({ queryKey: openItemsKey(draft.petId) });
    },
    onError: (error: unknown) => {
      if (isAxiosError(error) && error.response?.status === 422 && error.response.data?.code === 'ITEM_PLANO_INVALIDO') {
        Alert.alert(
          'Vacina ou vermífugo',
          'O item do plano escolhido não vale mais para este pet (já foi concluído ou o plano mudou). Volte, escolha outro item ou marque «Avulsa» e assine de novo.'
        );
        return;
      }
      Alert.alert('Erro ao concluir o atendimento', buildApiErrorMessage(error));
    },
  });

  return { complete: mutation.mutateAsync, completing: mutation.isPending };
};

export { composeNotes, useCompleteAppointment, useClosingForm, useOpenPlanItems };
