import { useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { isAxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/authContext';
import type {
  ClosingDraft,
  OpenPlanItem,
  ClosingPrescription,
  ProcedureDraft,
  ClosingProcedure,
  ProcedureSection,
} from '../model/closing';
import { medicalRecordSchema } from '../model/medicalRecord';
import { prescriptionSchema, type ReceitaDraft } from '../model/prescription';
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

const itemWithSameName = (items: OpenPlanItem[], nome: string, taken: Set<number>) => {
  const target = normalize(nome);
  if (!target) return null;
  return items.find((i) => !taken.has(i.id) && normalize(i.nome) === target) ?? null;
};

const mentionsVaccine = (text: string) => /vacin|vermif/.test(normalizeSearch(text));

const composeNotes = (p: ProcedureDraft) =>
  [p.batch.trim() && `Lote/marca: ${p.batch.trim()}`, p.notes.trim() && `Reações/observações: ${p.notes.trim()}`]
    .filter(Boolean)
    .join(' · ') || undefined;

const useClosingForm = (petId: string, initialAppointmentId: string | undefined, receita: ReceitaDraft | null) => {
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
  const [receitaOn, setReceitaOn] = useState(!!receita);
  const counter = useRef(0);
  const seeded = useRef({ reason: false, weight: false, item: false });
  const baseline = useRef({ reason: '', weight: '' });

  // Motivo e peso chegam preenchidos da consulta e do cadastro; vacina e vermífugo já vêm marcados.
  useEffect(() => {
    if (!appointment || seeded.current.reason) return;
    seeded.current.reason = true;
    const text = appointment.reason.trim();
    if (!text || text === 'Atendimento imediato') return;
    baseline.current.reason = text;
    setReason(text);
    if (appointment.type === 'VACINACAO' || mentionsVaccine(text)) {
      const vermifugo = /vermif/.test(normalizeSearch(text)) && !/vacin/.test(normalizeSearch(text));
      add('VACINA_VERMIFUGO', vermifugo ? { tipo: 'VERMIFUGACAO' } : undefined);
    }
  }, [appointment]);

  useEffect(() => {
    if (pet?.peso == null || seeded.current.weight) return;
    seeded.current.weight = true;
    const text = String(pet.peso).replace('.', ',');
    baseline.current.weight = text;
    setWeight(text);
  }, [pet]);

  // Com o item do plano citado no motivo (ex.: "Antirrábica"), o rádio vem marcado.
  useEffect(() => {
    if (seeded.current.item || items.length === 0 || !baseline.current.reason) return;
    const draft = procedures.find((p) => p.section === 'VACINA_VERMIFUGO' && !p.nome.trim() && !p.manualItem);
    if (!draft) return;
    seeded.current.item = true;
    const reasonText = normalize(baseline.current.reason);
    const match = items.find((i) => reasonText.includes(normalize(i.nome)));
    if (match) update(draft.key, { nome: match.nome });
  }, [items, procedures]);

  const handleWeightChange = (text: string) => {
    let formatted = text.replace(/[^0-9,]/g, '');
    const parts = formatted.split(',');
    if (parts.length > 2) formatted = `${parts[0]},${parts.slice(1).join('')}`;
    setWeight(formatted);
  };

  const takenByOthers = (list: ProcedureDraft[], key: string) =>
    new Set(list.filter((p) => p.key !== key && p.itemPlanoId != null).map((p) => p.itemPlanoId as number));

  const add = (section: ProcedureSection, patch?: Partial<ProcedureDraft>) => {
    counter.current += 1;
    const key = `proc-${counter.current}`;
    setProcedures((current) => [
      ...current,
      {
        key,
        section,
        tipo: TYPE_BY_SECTION[section],
        nome: '',
        batch: '',
        notes: '',
        itemPlanoId: null,
        manualItem: false,
        ...patch,
      },
    ]);
    return key;
  };

  const hasSection = (section: ProcedureSection) => procedures.some((p) => p.section === section);

  const toggleSection = (section: ProcedureSection) => {
    if (hasSection(section)) setProcedures((current) => current.filter((p) => p.section !== section));
    else add(section);
  };

  const update = (key: string, patch: Partial<ProcedureDraft>) => {
    setProcedures((current) =>
      current.map((p) => {
        if (p.key !== key) return p;
        const next = { ...p, ...patch };
        if (patch.nome !== undefined && !patch.manualItem && !next.manualItem && next.section === 'VACINA_VERMIFUGO') {
          const match = itemWithSameName(items, next.nome, takenByOthers(current, key));
          next.itemPlanoId = match?.id ?? null;
          next.tipo = match?.tipo ?? (/vermifug/.test(normalize(next.nome)) ? 'VERMIFUGACAO' : 'VACINACAO');
        } else if (patch.nome !== undefined && next.section === 'VACINA_VERMIFUGO' && next.itemPlanoId == null) {
          next.tipo = /vermifug/.test(normalize(next.nome)) ? 'VERMIFUGACAO' : 'VACINACAO';
        }
        return next;
      })
    );
  };

  const remove = (key: string) => setProcedures((current) => current.filter((p) => p.key !== key));

  const availableItems = (p: ProcedureDraft) => {
    const taken = takenByOthers(procedures, p.key);
    return items.filter((i) => !taken.has(i.id));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (weight) {
      const n = parseFloat(weight.replace(',', '.'));
      if (Number.isNaN(n) || n <= 0) nextErrors.weight = 'Informe um peso maior que zero.';
    }
    procedures.forEach((p) => {
      if (!p.nome.trim()) nextErrors[p.key] = 'Informe o nome ou remova o item.';
      else if (p.nome.trim().length > 150) nextErrors[p.key] = 'O nome pode ter até 150 caracteres.';
    });
    return nextErrors;
  };

  // Linha da sanfona que tem o primeiro erro, para abrir antes de mostrar a mensagem.
  const firstInvalid = (): string | null => {
    const e = validate();
    if (e.weight) return 'consulta';
    return procedures.find((p) => e[p.key])?.section ?? null;
  };

  const dirty = !!(
    reason.trim() !== baseline.current.reason ||
    weight !== baseline.current.weight ||
    notes.trim() ||
    receita ||
    procedures.some((p) => p.nome.trim() || p.batch.trim() || p.notes.trim() || p.itemPlanoId != null || p.manualItem)
  );

  const build = (): ClosingDraft | null => {
    const nextErrors = validate();
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
      receita,
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
    hasSection, toggleSection,
    receitaOn, setReceitaOn,
    availableItems,
    errors,
    firstInvalid,
    dirty,
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

      const prescricoes: ClosingPrescription[] = [];
      for (const d of draft.receita?.itens ?? []) {
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
            animalId: String(draft.petId),
            veterinarioId: String(veterinarioId),
            registroAtendimentoId: null,
            materialOrigemId: null,
            versaoOrigem: null,
          },
          { abortEarly: false }
        );
        prescricoes.push({
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
        });
      }

      if (draft.weight) {
        const current = await getPetById(draft.petId);
        const peso = parseFloat(draft.weight.replace(',', '.'));
        if (current && current.peso !== peso) await updatePet({ ...current, peso });
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
          tratamento: draft.receita
            ? `Receita · ${draft.receita.itens
                .map((i) => `${i.medicamento} ${i.doseMin}–${i.doseMax} ${i.unidade} · ${i.frequenciaDia}×/dia · ${i.duracaoDias} dias`)
                .join(' + ')}`
            : undefined,
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
      ['appointments', 'prontuario', 'prescricao', 'carePlan', 'procedures', 'pets', 'patients', 'planSummary', 'agenda', 'petProfile'].forEach((key) =>
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
