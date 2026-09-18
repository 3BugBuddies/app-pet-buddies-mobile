import { useState } from 'react';
import { Alert } from 'react-native';
import { buildApiErrorMessage } from './apiErrorHelper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MedicalRecord, medicalRecordSchema } from '../model/medicalRecord';
import { createRecord, getRecordsByPetId } from '../repository/medicalRecordRepository';
import { getAllAppointments } from '../repository/appointmentRepository';
import { usePet, useUpdatePet } from './usePetsControl';

const registrosQueryKey = (animalId: string) => ['prontuario', 'registros', animalId];

export type RecordType = 'VACINA' | 'CONSULTA' | 'EXAME' | 'PROCEDIMENTO';

interface MedicalRecordControl {
  registros: MedicalRecord[] | undefined;
  carregandoRegistros: boolean;
  recordType: RecordType;
  setRecordType: (value: RecordType) => void;
  anamnese: string;
  setAnamnese: (value: string) => void;
  diagnostico: string;
  setDiagnostico: (value: string) => void;
  observacao: string;
  setObservacao: (value: string) => void;
  nomeVacina: string;
  setNomeVacina: (value: string) => void;
  loteVacina: string;
  setLoteVacina: (value: string) => void;
  nomeExame: string;
  setNomeExame: (value: string) => void;
  nomeProcedimento: string;
  setNomeProcedimento: (value: string) => void;
  weight: string;
  setWeight: (value: string) => void;
  handleWeightChange: (text: string) => void;
  homeInstructionOn: boolean;
  setHomeInstructionOn: (value: boolean) => void;
  homeInstructionText: string;
  setHomeInstructionText: (value: string) => void;
  diagnosticoErro: string | null;
  isSaving: boolean;
  salvar: (precisaPrescrever: boolean) => void;
}

const useMedicalRecordControl = (
  animalId: string,
  onSaved?: (registro: MedicalRecord, consultaId: string) => void,
  onSavedWithoutPrescription?: () => void,
  initialConsultaId?: string,
): MedicalRecordControl => {
  const queryClient = useQueryClient();

  const registrosQuery = useQuery({
    queryKey: registrosQueryKey(animalId),
    queryFn: () => getRecordsByPetId(animalId),
  });

  const { data: petAtual } = usePet(animalId);
  const updatePet = useUpdatePet();

  const [recordType, setRecordType] = useState<RecordType>('CONSULTA');
  const [anamnese, setAnamnese] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [observacao, setObservacao] = useState('');
  const [nomeVacina, setNomeVacina] = useState('');
  const [loteVacina, setLoteVacina] = useState('');
  const [nomeExame, setNomeExame] = useState('');
  const [nomeProcedimento, setNomeProcedimento] = useState('');
  const [weight, setWeight] = useState('');
  const [homeInstructionOn, setHomeInstructionOn] = useState(false);

  const handleWeightChange = (text: string) => {
    let formatado = text.replace(/[^0-9,]/g, '');
    const partes = formatado.split(',');
    if (partes.length > 2) {
      formatado = partes[0] + ',' + partes.slice(1).join('');
    }
    setWeight(formatado);
  };
  const [homeInstructionText, setHomeInstructionText] = useState('');
  const [diagnosticoErro, setDiagnosticoErro] = useState<string | null>(null);

  const salvarMutation = useMutation({
    mutationFn: async (precisaPrescrever: boolean) => {
      // Atualiza o peso do animal antes de salvar o prontuário
      if (weight && petAtual) {
        const pesoNumerico = parseFloat(weight.replace(',', '.'));
        if (!isNaN(pesoNumerico)) {
          await updatePet.mutateAsync({ ...petAtual, peso: pesoNumerico });
        }
      }

      // Hack para contornar @NotNull do back-end até que as tabelas sejam atualizadas
      let diagFinal = diagnostico;
      let anamnFinal = anamnese;
      let obsAdicional = observacao;

      if (recordType === 'VACINA') {
        if (!nomeVacina) throw new Error('YUP_VACINA'); // Simula erro de validação
        diagFinal = 'Profilaxia / Imunização';
        anamnFinal = `Aplicação de vacina: ${nomeVacina}`;
        if (loteVacina) obsAdicional = `Lote/Marca: ${loteVacina} | ${observacao}`;
      } else if (recordType === 'EXAME') {
        if (!nomeExame) throw new Error('YUP_EXAME');
        diagFinal = 'Encaminhamento para Exames';
        anamnFinal = `Exame(s) solicitado(s) / realizado(s): ${nomeExame}`;
        if (diagnostico) obsAdicional = `Suspeita Clínica: ${diagnostico} | ${observacao}`;
      } else if (recordType === 'PROCEDIMENTO') {
        if (!nomeProcedimento) throw new Error('YUP_PROCEDIMENTO');
        diagFinal = 'Procedimento Ambulatorial / Cirúrgico';
        anamnFinal = `Procedimento: ${nomeProcedimento}`;
      }

      const observacaoFinal = [
        obsAdicional,
        homeInstructionOn && homeInstructionText
          ? `Orientação para casa: ${homeInstructionText}`
          : null,
      ]
        .filter(Boolean)
        .join(' | ') || undefined;

      // Busca a consulta ativa do pet (se houver consulta agendada ou passada)
      let consultaAtualId = initialConsultaId || null;
      if (!consultaAtualId) {
        try {
          const consultasDoPet = await getAllAppointments(animalId);
          if (consultasDoPet.length > 0) {
            consultaAtualId = consultasDoPet[0].id;
          } else {
            const todasConsultas = await getAllAppointments();
            const encontrada = todasConsultas.find((c) => String(c.petId) === String(animalId));
            if (encontrada) {
              consultaAtualId = encontrada.id;
            }
          }
        } catch (e) {
          console.warn('[useMedicalRecordControl] Erro ao buscar consulta do pet:', e);
        }
      }

      // Se ainda não achou consulta para este pet, tenta buscar em registros anteriores
      if (!consultaAtualId) {
        try {
          const { getRecordsByPetId } = await import('../repository/medicalRecordRepository');
          const priorRecords = await getRecordsByPetId(animalId);
          if (priorRecords.length > 0 && priorRecords[0].consultaId) {
            consultaAtualId = priorRecords[0].consultaId;
          }
        } catch (e) {}
      }

      if (!consultaAtualId) {
        const candidateJanelas = [41, 42, 43, 44, 45, 50, 55, 60, 70, 80, 90, 100];
        for (const jId of candidateJanelas) {
          try {
            const { createAppointment } = await import('../repository/appointmentRepository');
            const nova = await createAppointment({
              petId: animalId,
              date: new Date().toISOString(),
              reason: 'Atendimento Clínico Imediato',
              janelaId: jId,
            });
            if (nova?.id) {
              consultaAtualId = nova.id;
              break;
            }
          } catch {}
        }
      }

      const registro = await medicalRecordSchema.validate(
        {
          id: `rec-${Date.now()}`,
          animalId,
          consultaId: consultaAtualId ? String(consultaAtualId) : null,
          dataAtendimento: new Date().toISOString().slice(0, 10),
          anamnese: anamnFinal || undefined,
          diagnostico: diagFinal,
          tratamento: precisaPrescrever
            ? 'Vide prescrição estruturada'
            : 'Apenas orientação em consultório',
          observacao: observacaoFinal,
        },
        { abortEarly: false }
      );

      let registroFinal = registro;
      if (precisaPrescrever) {
        // Fluxo Atômico (Decisão D2): não gravamos o registro de atendimento isoladamente.
        // Ele vai viajar em memória para a próxima tela e será enviado junto com as prescrições
        // na rota de fechamento atômico POST /consulta/{id}/fechamento.
        registroFinal = registro;
      } else {
        if (consultaAtualId) {
          const { fecharAtendimento } = await import('../repository/appointmentRepository');
          await fecharAtendimento(String(consultaAtualId), { registroAtendimento: registro, prescricoes: [] });
        } else {
          const { createRecord } = await import('../repository/medicalRecordRepository');
          registroFinal = await createRecord(registro);
        }
      }

      return { registro: registroFinal, consultaAtualId: consultaAtualId ? String(consultaAtualId) : '', precisaPrescrever };
    },
    onSuccess: ({ registro, consultaAtualId, precisaPrescrever }) => {
      queryClient.invalidateQueries({ queryKey: registrosQueryKey(animalId) });
      if (precisaPrescrever) {
        onSaved?.(registro, String(consultaAtualId));
      } else {
        Alert.alert('Sucesso', 'O prontuário foi salvo e o atendimento fechado.');
        onSavedWithoutPrescription?.();
      }
    },
    onError: (error: any) => {
      if (error?.message === 'YUP_VACINA') {
        setDiagnosticoErro('Nome da vacina é obrigatório');
        return;
      }
      if (error?.message === 'YUP_EXAME') {
        setDiagnosticoErro('Tipo de exame é obrigatório');
        return;
      }
      if (error?.message === 'YUP_PROCEDIMENTO') {
        setDiagnosticoErro('Nome do procedimento é obrigatório');
        return;
      }
      if (error?.inner) {
        for (const erro of error.inner) {
          if (erro.path === 'diagnostico') setDiagnosticoErro(erro.message);
        }
        return;
      }
      Alert.alert('Erro ao salvar', buildApiErrorMessage(error));
    },
  });

  const salvar = (precisaPrescrever: boolean) => {
    setDiagnosticoErro(null);
    salvarMutation.mutate(precisaPrescrever);
  };

  return {
    registros: registrosQuery.data,
    carregandoRegistros: registrosQuery.isLoading,
    recordType, setRecordType,
    anamnese, setAnamnese,
    diagnostico, setDiagnostico,
    observacao, setObservacao,
    nomeVacina, setNomeVacina,
    loteVacina, setLoteVacina,
    nomeExame, setNomeExame,
    nomeProcedimento, setNomeProcedimento,
    weight, setWeight,
    handleWeightChange,
    homeInstructionOn, setHomeInstructionOn,
    homeInstructionText, setHomeInstructionText,
    diagnosticoErro,
    isSaving: salvarMutation.isPending,
    salvar,
  };
};

export type { MedicalRecordControl };
export default useMedicalRecordControl;
