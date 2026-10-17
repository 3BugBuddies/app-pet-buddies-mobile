import { useContext, useState } from 'react';
import { Alert } from 'react-native';
import { buildApiErrorMessage } from './apiErrorHelper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MedicalRecord, medicalRecordSchema } from '../model/medicalRecord';
import { AuthContext } from '../context/authContext';
import { getRecordsByPetId } from '../repository/medicalRecordRepository';
import {
  createWalkInAppointment,
  fecharAtendimento,
  findTodaysOpenAppointment,
} from '../repository/appointmentRepository';
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
  const { session } = useContext(AuthContext);

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

      // Tipos que não são consulta (vacina, exame, procedimento) preenchem diagnóstico e anamnese
      // com um texto padrão, porque a API ainda não tem campos próprios para eles.
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

      // A API só registra atendimento dentro de uma consulta: usa a que veio da agenda; senão a
      // consulta aberta de hoje do paciente; senão abre uma consulta de atendimento imediato.
      // Consulta antiga ou de outro dia nunca é reaproveitada.
      let consultaAtualId: string | null = initialConsultaId || null;
      if (!consultaAtualId) {
        const veterinarioId = session?.veterinarioId;
        if (!veterinarioId) {
          throw new Error('Sessão sem veterinário: entre novamente para registrar o atendimento.');
        }
        const aberta = await findTodaysOpenAppointment(animalId, veterinarioId);
        consultaAtualId = (aberta ?? (await createWalkInAppointment(animalId, veterinarioId))).id;
      }

      const registro = await medicalRecordSchema.validate(
        {
          id: `rec-${Date.now()}`,
          animalId,
          consultaId: String(consultaAtualId),
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
        // O registro não é gravado isoladamente: segue em memória para a próxima tela e vai junto
        // com as prescrições no fechamento atômico POST /consulta/{id}/fechamento.
        registroFinal = registro;
      } else {
        await fecharAtendimento(String(consultaAtualId), { registroAtendimento: registro, prescricoes: [] });
      }

      return { registro: registroFinal, consultaAtualId: String(consultaAtualId), precisaPrescrever };
    },
    onSuccess: ({ registro, consultaAtualId, precisaPrescrever }) => {
      queryClient.invalidateQueries({ queryKey: registrosQueryKey(animalId) });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
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
