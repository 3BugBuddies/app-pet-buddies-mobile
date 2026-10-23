import { useContext, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { isAxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/authContext';
import type {
  FechamentoDraft,
  ItemAbertoPlano,
  PrescricaoFechamento,
  ProcedimentoDraft,
  ProcedimentoFechamento,
  SecaoProcedimento,
} from '../model/fechamento';
import { medicalRecordSchema } from '../model/medicalRecord';
import { prescriptionSchema, type PrescricaoDraft } from '../model/prescription';
import type { TipoProcedimento } from '../model/procedure';
import {
  createWalkInAppointment,
  dateTimeLocal,
  fecharAtendimento,
  findTodaysOpenAppointment,
  isoLocal,
} from '../repository/appointmentRepository';
import { getItensAbertosVacinaVermifugo } from '../repository/itemPlanoRepository';
import { getPetById, updatePet } from '../repository/petRepository';
import { buildApiErrorMessage } from './apiErrorHelper';
import { useAppointment } from './useAppointmentsControl';
import { usePet } from './usePetsControl';

const itensAbertosKey = (petId: string) => ['planoItensAbertos', petId];

const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

const TIPO_POR_SECAO: Record<SecaoProcedimento, TipoProcedimento> = {
  VACINA_VERMIFUGO: 'VACINACAO',
  EXAME: 'EXAME_LABORATORIAL',
  PROCEDIMENTO: 'OUTRO',
};

const itemDeMesmoNome = (
  itens: ItemAbertoPlano[],
  tipo: TipoProcedimento,
  nome: string,
  ocupados: Set<number>
) => {
  const alvo = normalizar(nome);
  if (!alvo) return null;
  return itens.find((i) => i.tipo === tipo && !ocupados.has(i.id) && normalizar(i.nome) === alvo)?.id ?? null;
};

const comporObservacao = (p: ProcedimentoDraft) =>
  [p.lote.trim() && `Lote/marca: ${p.lote.trim()}`, p.observacao.trim() && `Reações/observações: ${p.observacao.trim()}`]
    .filter(Boolean)
    .join(' · ') || undefined;

const useFechamentoForm = (petId: string, consultaIdInicial: string | undefined, prescricao: PrescricaoDraft | null) => {
  const { session } = useContext(AuthContext);
  const veterinarioId = session?.veterinarioId;
  const { data: pet } = usePet(petId);

  const consultaDaAgenda = useAppointment(consultaIdInicial ?? '');
  const consultaAberta = useQuery({
    queryKey: ['appointments', 'aberta-hoje', petId, veterinarioId],
    queryFn: () => findTodaysOpenAppointment(petId, veterinarioId),
    enabled: !consultaIdInicial && !!veterinarioId,
  });
  const consulta = consultaIdInicial ? consultaDaAgenda.data : consultaAberta.data;
  const carregandoConsulta = consultaIdInicial ? consultaDaAgenda.isLoading : consultaAberta.isLoading;

  const { data: itens = [] } = useQuery({
    queryKey: itensAbertosKey(petId),
    queryFn: () => getItensAbertosVacinaVermifugo(petId),
  });

  const [motivo, setMotivo] = useState('');
  const [observacao, setObservacao] = useState('');
  const [peso, setPeso] = useState('');
  const [procedimentos, setProcedimentos] = useState<ProcedimentoDraft[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});
  const contador = useRef(0);

  const handlePesoChange = (texto: string) => {
    let formatado = texto.replace(/[^0-9,]/g, '');
    const partes = formatado.split(',');
    if (partes.length > 2) formatado = `${partes[0]},${partes.slice(1).join('')}`;
    setPeso(formatado);
  };

  const ocupadosPorOutros = (lista: ProcedimentoDraft[], chave: string) =>
    new Set(lista.filter((p) => p.chave !== chave && p.itemPlanoId != null).map((p) => p.itemPlanoId as number));

  const adicionar = (secao: SecaoProcedimento) => {
    contador.current += 1;
    setProcedimentos((atual) => [
      ...atual,
      {
        chave: `proc-${contador.current}`,
        secao,
        tipo: TIPO_POR_SECAO[secao],
        nome: '',
        lote: '',
        observacao: '',
        itemPlanoId: null,
        itemManual: false,
      },
    ]);
  };

  const atualizar = (chave: string, patch: Partial<ProcedimentoDraft>) => {
    setProcedimentos((atual) =>
      atual.map((p) => {
        if (p.chave !== chave) return p;
        const novo = { ...p, ...patch };
        const mudouNomeOuTipo = patch.nome !== undefined || patch.tipo !== undefined;
        if (mudouNomeOuTipo && !patch.itemManual && !novo.itemManual && novo.secao === 'VACINA_VERMIFUGO') {
          novo.itemPlanoId = itemDeMesmoNome(itens, novo.tipo, novo.nome, ocupadosPorOutros(atual, chave));
        }
        if (patch.tipo !== undefined && novo.itemManual) {
          novo.itemPlanoId = null;
          novo.itemManual = false;
        }
        return novo;
      })
    );
  };

  const remover = (chave: string) => setProcedimentos((atual) => atual.filter((p) => p.chave !== chave));

  const itensDisponiveis = (p: ProcedimentoDraft) => {
    const ocupados = ocupadosPorOutros(procedimentos, p.chave);
    return itens.filter((i) => i.tipo === p.tipo && !ocupados.has(i.id));
  };

  const montar = (): FechamentoDraft | null => {
    const novosErros: Record<string, string> = {};
    if (peso) {
      const n = parseFloat(peso.replace(',', '.'));
      if (Number.isNaN(n) || n <= 0) novosErros.peso = 'Informe um peso maior que zero.';
    }
    procedimentos.forEach((p) => {
      if (!p.nome.trim()) novosErros[p.chave] = 'Informe o nome ou remova o item.';
      else if (p.nome.trim().length > 150) novosErros[p.chave] = 'O nome pode ter até 150 caracteres.';
    });
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return null;
    return {
      petId,
      petNome: pet?.nome ?? '',
      consultaId: consulta?.id ?? null,
      motivo,
      observacao,
      peso,
      procedimentos,
      prescricao,
    };
  };

  return {
    pet,
    consulta,
    carregandoConsulta,
    motivo, setMotivo,
    observacao, setObservacao,
    peso, handlePesoChange,
    procedimentos,
    adicionar, atualizar, remover,
    itensDisponiveis,
    erros,
    montar,
  };
};

const useConcluirAtendimento = () => {
  const { session } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const consultaCriada = useRef<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (f: FechamentoDraft) => {
      const veterinarioId = session?.veterinarioId;
      if (!veterinarioId) {
        throw new Error('Sessão sem veterinário: entre novamente para concluir o atendimento.');
      }

      let prescricoes: PrescricaoFechamento[] = [];
      if (f.prescricao) {
        const d = f.prescricao;
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
            regras: d.regras.map((regra, indice) => ({
              condicaoClinicaId: regra.condicaoClinicaId,
              rotuloCongelado: regra.rotuloCongelado,
              operador: regra.operador ?? undefined,
              limite: regra.limite ?? undefined,
              acaoDose: regra.acao,
              ordem: indice + 1,
            })),
          },
        ];
      }

      if (f.peso) {
        const atual = await getPetById(f.petId);
        if (atual) await updatePet({ ...atual, peso: parseFloat(f.peso.replace(',', '.')) });
      }

      // A consulta de encaixe só nasce aqui, na hora de enviar, e é reaproveitada se o envio falhar.
      let consultaId = f.consultaId ?? consultaCriada.current;
      if (!consultaId) {
        consultaId = (await createWalkInAppointment(f.petId, veterinarioId)).id;
        consultaCriada.current = consultaId;
      }

      const registro = await medicalRecordSchema.validate(
        {
          id: `rec-${Date.now()}`,
          animalId: f.petId,
          consultaId,
          dataAtendimento: isoLocal(new Date()),
          anamnese: f.motivo.trim() || undefined,
          tratamento: f.prescricao ? 'Vide prescrição estruturada' : undefined,
          observacao: f.observacao.trim() || undefined,
        },
        { abortEarly: false }
      );

      const agora = dateTimeLocal(new Date());
      const procedimentos: ProcedimentoFechamento[] = f.procedimentos.map((p) => ({
        tipo: p.tipo,
        nome: p.nome.trim(),
        observacao: comporObservacao(p),
        dataPrevistaInicio: agora,
        dataPrevistaFim: agora,
        itemPlanoId: p.itemPlanoId ?? undefined,
      }));

      await fecharAtendimento(consultaId, { registroAtendimento: registro, procedimentos, prescricoes });
    },
    onSuccess: (_data, f) => {
      ['appointments', 'prontuario', 'prescricao', 'carePlan', 'procedures', 'pets', 'patients'].forEach((chave) =>
        queryClient.invalidateQueries({ queryKey: [chave] })
      );
      queryClient.invalidateQueries({ queryKey: itensAbertosKey(f.petId) });
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

  return { concluir: mutation.mutateAsync, concluindo: mutation.isPending };
};

export { comporObservacao, useConcluirAtendimento, useFechamentoForm };
