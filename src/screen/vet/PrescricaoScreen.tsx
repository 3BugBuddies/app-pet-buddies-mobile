import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { buildApiErrorMessage } from '../../control/apiErrorHelper';
import { Ionicons } from '@expo/vector-icons';
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';
import { transcribeAudio } from '../../repository/speechTranscriptionService';

import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { Button } from '../../component/ui/Button';
import { FieldError } from '../../component/forms/FieldError';
import { Input } from '../../component/ui/Input';
import { usePrescricaoDraftControl, useDraftPrescription, useNovaRegraControl } from '../../control/usePrescriptionControl';
import { extrairPrescricaoDaNarrativa } from '../../control/prescriptionExtractor';
import { CONDICOES_CLINICAS } from '../../model/prescriptionRule';
import { usePet } from '../../control/usePetsControl';
import { usePatients } from '../../control/usePatientsControl';
import type { PacientesTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

const ACAO_LABEL: Record<string, string> = {
  DOSE_MIN: 'dose mínima',
  DOSE_MAX: 'dose máxima',
  DOSE_PADRAO: 'dose padrão',
  ACIONAR_CLINICA: 'acionar clínica',
};

type Props = NativeStackScreenProps<PacientesTabParamList, 'Prescricao'>;

export function PrescricaoScreen({ route }: Props) {
  const { animalId, consultaId, prontuario } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const insets = useSafeAreaInsets();
  
  const { data: pet } = usePet(animalId);
  const { data: patients } = usePatients();
  const tutorName = patients?.find((p) => p.petId === animalId)?.tutorName;
  
  const [narrativaIA, setNarrativaIA] = useState('');
  const draftPrescription = useDraftPrescription();

  // Estados de áudio e transcrição
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [protocolModalVisible, setProtocolModalVisible] = useState(false);
  const [protocolSearch, setProtocolSearch] = useState('');
  const [ruleModalVisible, setRuleModalVisible] = useState(false);

  const FAKE_PROTOCOLS_LIST = [
    {
      id: 'p1',
      nome: 'Otite Padrão',
      medicamento: 'Natalene',
      doseMin: 2,
      doseMax: 4,
      unidade: 'gotas',
      frequenciaDia: 2,
      duracaoDias: 7,
      orientacao: 'Limpar o conduto antes da aplicação. Retornar se o cão apresentar dor severa.',
    },
    {
      id: 'p2',
      nome: 'Vermifugação Canina',
      medicamento: 'Drontal Plus',
      doseMin: 1,
      doseMax: 1,
      unidade: 'comp',
      frequenciaDia: 1,
      duracaoDias: 1,
      orientacao: 'Dose única. Dar junto com o alimento.',
    },
    {
      id: 'p3',
      nome: 'Gastroenterite Leve',
      medicamento: 'Cerenia',
      doseMin: 2,
      doseMax: 2,
      unidade: 'mg/kg',
      frequenciaDia: 1,
      duracaoDias: 3,
      orientacao: 'Apenas se houver vômito. Manter dieta leve.',
    }
  ];

  const handleApplyProtocol = (protocol: any) => {
    setMedicamento(protocol.medicamento);
    setDoseMin(protocol.doseMin);
    setDoseMax(protocol.doseMax);
    setUnidade(protocol.unidade);
    setFrequenciaDia(protocol.frequenciaDia);
    setDuracaoDias(protocol.duracaoDias);
    setOrientacao(protocol.orientacao);
    setRegras([]); // Reseta regras ao aplicar um protocolo limpo
    setProtocolModalVisible(false);
  };

  const {
    medicamento, setMedicamento,
    doseMin, setDoseMin,
    doseMax, setDoseMax,
    unidade, setUnidade,
    frequenciaDia, setFrequenciaDia,
    duracaoDias, setDuracaoDias,
    orientacao, setOrientacao,
    regras, setRegras, removerRegra,
    erros,
    validar,
  } = usePrescricaoDraftControl({
    animalId,
    registroAtendimentoId: prontuario?.id ? String(prontuario.id) : '',
  });

  const {
    condicoes, acoes,
    condicaoClinicaId, setCondicaoClinicaId,
    acao, setAcao,
    construirRegra,
  } = useNovaRegraControl();

  const handleAddRule = () => {
    const regra = construirRegra();
    setRegras(prev => [...prev, regra]);
    setRuleModalVisible(false);
  };

  // Cronômetro da gravação
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (recorderState.isRecording) {
      setRecordingSeconds(0);
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recorderState.isRecording]);

  const handleStartRecording = async () => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert(
          'Permissão necessária',
          'O Pet Buddies precisa de permissão de acesso ao microfone para ditar condutas médicas.'
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error: any) {
      Alert.alert('Erro ao gravar', error?.message ?? 'Não foi possível acessar o microfone.');
    }
  };

  const handleStopRecording = async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) {
        Alert.alert('Aviso', 'Nenhum áudio foi capturado.');
        return;
      }

      setIsTranscribing(true);
      const textoTranscrito = await transcribeAudio(uri);
      setNarrativaIA(textoTranscrito);

      // Dispara o preenchimento inteligente dos campos com o texto transcrito
      await handleGerarIA(textoTranscrito);
    } catch (error: any) {
      Alert.alert('Erro na transcrição', error?.message ?? 'Falha ao processar o áudio.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleGerarIA = async (textoCustomizado?: string) => {
    const textoParaProcessar = (textoCustomizado ?? narrativaIA).trim();
    if (!textoParaProcessar) return;

    try {
      let regId: string | number | undefined =
        prontuario?.id && !String(prontuario.id).startsWith('rec-')
          ? prontuario.id
          : undefined;

      // Se ainda não tiver ID real do banco, tenta buscar registros existentes do animal
      if (!regId) {
        try {
          const { getRecordsByPetId } = await import('../../repository/medicalRecordRepository');
          const records = await getRecordsByPetId(animalId);
          if (records && records.length > 0) {
            regId = records[0].id;
          }
        } catch (e) {
          console.warn('[PrescricaoScreen] Não foi possível consultar histórico de registros:', e);
        }
      }

      // Se o pet não tem nenhum registro no banco, persiste o prontuário atual
      if (!regId && prontuario) {
        try {
          const { createRecord } = await import('../../repository/medicalRecordRepository');
          const salvo = await createRecord(prontuario);
          if (salvo?.id) {
            regId = salvo.id;
            prontuario.id = salvo.id;
          }
        } catch (e) {
          console.warn('[PrescricaoScreen] Não foi possível salvar prontuário:', e);
        }
      }

      const rascunho = await draftPrescription.mutateAsync({
        animalId,
        registroAtendimentoId: regId ? String(regId) : undefined,
        narrativa: textoParaProcessar,
      });

      // Modelo de IA indisponível — tenta preenchimento com o extrator local
      if (!rascunho.extracaoDisponivel) {
        const extraido = extrairPrescricaoDaNarrativa(textoParaProcessar);
        if (extraido.medicamento) setMedicamento(extraido.medicamento);
        setDoseMin(extraido.doseMin);
        setDoseMax(extraido.doseMax);
        setUnidade(extraido.unidade);
        setFrequenciaDia(extraido.frequenciaDia);
        setDuracaoDias(extraido.duracaoDias);
        if (extraido.orientacao) setOrientacao(extraido.orientacao);
        Alert.alert(
          'Prescrição Estruturada',
          'Campos preenchidos com base no seu relato de áudio! Revise os valores antes de assinar.',
        );
        return;
      }

      const prescricao = rascunho.prescricao;
      setMedicamento(prescricao.medicamento ?? '');
      setDoseMin(prescricao.doseMin ?? 0);
      setDoseMax(prescricao.doseMax ?? 0);
      setUnidade(prescricao.unidade ?? 'mg');
      setFrequenciaDia(prescricao.frequenciaDia ?? 1);
      setDuracaoDias(prescricao.duracaoDias ?? 7);
      if (prescricao.orientacao) setOrientacao(prescricao.orientacao);

      const regrasSeguras = rascunho.regrasPropostas || [];
      setRegras(
        regrasSeguras.map((r: any) => {
          const idCond = Number(r.condicaoClinicaId);
          const condEncontrada = CONDICOES_CLINICAS.find((c) => c.id === idCond);
          const rotulo = r.rotuloCongelado || condEncontrada?.rotulo || `Condição #${idCond}`;
          const acaoFinal = (r.acao || r.acaoDose || 'DOSE_MIN') as any;
          return {
            condicaoClinicaId: idCond,
            rotuloCongelado: rotulo,
            acao: acaoFinal,
          };
        })
      );
    } catch (error: any) {
      console.warn('[PrescricaoScreen] API de IA do backend indisponível ou recusou payload, usando extrator local:', error);
      try {
        const extraido = extrairPrescricaoDaNarrativa(textoParaProcessar);
        if (extraido.medicamento) setMedicamento(extraido.medicamento);
        setDoseMin(extraido.doseMin);
        setDoseMax(extraido.doseMax);
        setUnidade(extraido.unidade);
        setFrequenciaDia(extraido.frequenciaDia);
        setDuracaoDias(extraido.duracaoDias);
        if (extraido.orientacao) setOrientacao(extraido.orientacao);
        Alert.alert(
          'Prescrição Estruturada',
          'Campos preenchidos automaticamente a partir do áudio! Revise e adicione regras caso desejar.',
        );
      } catch (extractorErr) {
        Alert.alert('Erro ao chamar IA', buildApiErrorMessage(error));
      }
    }
  };

  const irParaAssinatura = async () => {
    const draft = await validar();
    if (draft) navigation.navigate('AssinarPrescricao', { draft, consultaId, prontuario });
  };

  return (
    <>
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 80 }]} keyboardShouldPersistTaps="handled">
      <CheckInTopBar
        title="Prescrição"
        subtitle={pet ? `${pet.nome}${tutorName ? ` • ${tutorName}` : ''}` : undefined}
        stepLabel="rascunho"
      />

      {/* Assistente de Prescrição: Suporta Áudio (Microfone) ou Digitação */}
      <View style={styles.iaCard}>
        <View style={styles.iaHeader}>
          <Ionicons name="sparkles" size={20} color={colors.accent} />
          <Text style={styles.iaTitle}>Assistente de Prescrição</Text>
        </View>
        <Text style={styles.iaSub}>
          Dite pelo microfone ou digite a conduta. A IA transcreverá sua fala e preencherá as doses e regras automaticamente.
        </Text>

        {/* Bloco de Gravação / Transcrição de Voz */}
        {recorderState.isRecording ? (
          <View style={styles.recordingActiveContainer}>
            <View style={styles.recordingPulseRow}>
              <View style={styles.recordingPulseDot} />
              <Text style={styles.recordingText}>
                Gravando... {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}
              </Text>
            </View>
            <Pressable
              style={styles.stopRecordingButton}
              onPress={handleStopRecording}
            >
              <Ionicons name="stop" size={14} color="#FFFFFF" />
              <Text style={styles.stopRecordingButtonText}>Parar e Preencher</Text>
            </Pressable>
          </View>
        ) : isTranscribing ? (
          <View style={styles.transcribingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.transcribingText}>Transcrevendo áudio com IA...</Text>
          </View>
        ) : (
          <Pressable
            style={styles.startRecordingButton}
            onPress={handleStartRecording}
            disabled={draftPrescription.isPending}
          >
            <Ionicons name="mic" size={18} color={colors.primary} />
            <Text style={styles.startRecordingButtonText}>Ditar conduta médica por voz</Text>
          </Pressable>
        )}

        <TextInput
          value={narrativaIA}
          onChangeText={setNarrativaIA}
          placeholder="Ex: Amoxicilina 500mg 2x ao dia por 7 dias. Administrar com alimento."
          placeholderTextColor={colors.textMuted}
          multiline
          editable={!recorderState.isRecording && !isTranscribing}
          style={styles.iaInput}
        />
        <Button
          label="Preencher formulário mágico"
          variant="secondary"
          disabled={!narrativaIA.trim() || recorderState.isRecording || isTranscribing}
          loading={draftPrescription.isPending}
          onPress={() => handleGerarIA()}
        />
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerLabel}>ou digite os campos abaixo</Text>
        <View style={styles.divider} />
      </View>

      <Pressable style={styles.protocolButton} onPress={() => setProtocolModalVisible(true)}>
        <Ionicons name="star" size={18} color="#EAB308" />
        <Text style={styles.protocolButtonText}>Usar Protocolo Salvo</Text>
      </Pressable>

      {/* UX Otimizada: Formulário Limpo, Agrupamento Lógico e Inputs Numéricos Livres */}
      <View style={styles.medCard}>
        <Text style={styles.sectionLabel}>Dados do Medicamento</Text>
        
        <Input
          label="Nome do Medicamento"
          placeholder="medicamento genérico ou comercial"
          value={medicamento}
          onChangeText={setMedicamento}
          hasError={!!erros.medicamento}
        />
        <FieldError message={erros.medicamento} />

        {/* Linha de Dosagem e Unidade agrupadas */}
        <View style={styles.row}>
          <View style={styles.flex2}>
            <Input
              label="Dose Mínima"
              keyboardType="decimal-pad"
              placeholder="0.0"
              value={doseMin ? String(doseMin) : ''}
              onChangeText={(v) => setDoseMin(Number(v.replace(',', '.')) || 0)}
              hasError={!!erros.doseMin}
            />
          </View>
          <View style={styles.flex2}>
            <Input
              label="Dose Máxima"
              keyboardType="decimal-pad"
              placeholder="0.0"
              value={doseMax ? String(doseMax) : ''}
              onChangeText={(v) => setDoseMax(Number(v.replace(',', '.')) || 0)}
              hasError={!!erros.doseMax}
            />
          </View>
          <View style={styles.flex1}>
            <Input
              label="Unid."
              placeholder="mg, ml, g..."
              value={unidade}
              onChangeText={setUnidade}
              hasError={!!erros.unidade}
            />
          </View>
        </View>
        <FieldError message={erros.doseMax} />

        {/* Linha de Posologia agrupada */}
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Input
              label="Vezes ao dia"
              keyboardType="number-pad"
              placeholder=""
              value={String(frequenciaDia || '')}
              onChangeText={(v) => setFrequenciaDia(Number(v) || 0)}
              hasError={!!erros.frequenciaDia}
            />
          </View>
          <View style={styles.flex1}>
            <Input
              label="Dias de tratamento"
              keyboardType="number-pad"
              placeholder=""
              value={String(duracaoDias || '')}
              onChangeText={(v) => setDuracaoDias(Number(v) || 0)}
              hasError={!!erros.duracaoDias}
            />
          </View>
        </View>

        <Input
          label="Orientação para o Tutor (opcional)"
          placeholder=""
          value={orientacao}
          onChangeText={setOrientacao}
          multiline
          numberOfLines={3}
          style={styles.notesInput}
        />
      </View>

      <View style={styles.regrasSection}>
        <Text style={styles.sectionLabel}>Regras Condicionais (SE • ENTÃO)</Text>
        <Text style={styles.noteText}>
          Opcional. Adicione regras para que o app adapte a dose conforme os sintomas relatados pelo tutor no check-in.
        </Text>

        {regras.length === 0 ? (
          <Text style={styles.regrasVazias}>Nenhuma regra adicionada</Text>
        ) : (
          regras.map((regra, index) => (
            <View key={index} style={styles.regraRow}>
              <View style={styles.regraDot} />
              <Text style={styles.regraText} numberOfLines={2}>
                Se <Text style={styles.regraBold}>{(regra.rotuloCongelado || 'Condição Desconhecida').toLowerCase()}</Text>
                <Text style={styles.regraArrow}> → </Text>
                {ACAO_LABEL[regra.acao] ?? (regra.acao ? regra.acao.toLowerCase() : 'ação desconhecida')}
              </Text>
              <Pressable
                onPress={() => removerRegra(index)}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Text style={styles.removerText}>remover</Text>
              </Pressable>
            </View>
          ))
        )}
        <Button label="+ Adicionar regra condicional" variant="secondary" onPress={() => setRuleModalVisible(true)} />
      </View>

      <Button label="Revisar e Assinar Prescrição" onPress={irParaAssinatura} style={{ marginTop: spacing.md }} />
    </ScrollView>

    {protocolModalVisible && (
      <View style={[styles.modalOverlay, { paddingTop: insets.top }]}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Meus Protocolos Salvos</Text>
            <Pressable onPress={() => setProtocolModalVisible(false)} style={{ padding: 4 }}>
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </Pressable>
          </View>
          <Text style={styles.modalSubtitle}>Escolha um protocolo para preencher a prescrição rapidamente.</Text>
          
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}>
            {FAKE_PROTOCOLS_LIST.map((protocol) => (
              <Pressable key={protocol.id} style={styles.protocolCard} onPress={() => handleApplyProtocol(protocol)}>
                <Text style={styles.protocolCardName}>💊 {protocol.nome}</Text>
                <Text style={styles.protocolCardDetail}>
                  {protocol.medicamento} · {protocol.frequenciaDia}x ao dia · {protocol.duracaoDias} dias
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    )}

    {ruleModalVisible && (
      <View style={[styles.modalOverlay, { paddingTop: insets.top }]}>
        <View style={styles.ruleModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nova Regra Condicional</Text>
            <Pressable onPress={() => setRuleModalVisible(false)} style={{ padding: 4 }}>
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </Pressable>
          </View>
          <Text style={styles.modalSubtitle}>Se o tutor relatar no check-in:</Text>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: insets.bottom + 100 }}>
            <View style={styles.chipsRow}>
              {condicoes.map((condicao) => (
                <Pressable
                  key={condicao.id}
                  onPress={() => setCondicaoClinicaId(condicao.id)}
                  style={[styles.chip, condicaoClinicaId === condicao.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, condicaoClinicaId === condicao.id && styles.chipTextActive]}>
                    {condicao.rotulo}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Então aplicaremos:</Text>
            
            <View style={styles.card}>
              {acoes.map((option, index) => {
                const selected = option === acao;
                return (
                  <View key={option}>
                    <Pressable style={styles.actionRow} onPress={() => setAcao(option)}>
                      <View style={[styles.radio, selected && styles.radioSelected]}>
                        {selected ? <View style={styles.radioDot} /> : null}
                      </View>
                      <Text style={styles.actionLabel}>{ACAO_LABEL[option]}</Text>
                    </Pressable>
                    {index < acoes.length - 1 ? <View style={styles.divider} /> : null}
                  </View>
                );
              })}
            </View>

            <Pressable style={styles.submitButton} onPress={handleAddRule}>
              <Text style={styles.submitButtonText}>Adicionar regra e revisar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    )}
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  
  // UX: Protocol Button
  protocolButton: {
    backgroundColor: '#FEF9C3', // yellow-100
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: '#EAB308', // yellow-500
    gap: spacing.sm,
  },
  protocolButtonText: {
    color: '#854D0E', // yellow-800
    fontWeight: '700',
    fontSize: 16,
  },

  // UX: Modal
  modalOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.lg,
    borderTopRightRadius: spacing.lg,
    height: '60%',
    paddingTop: spacing.lg,
  },
  ruleModalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.lg,
    borderTopRightRadius: spacing.lg,
    height: '85%',
    paddingTop: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  protocolCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  protocolCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  protocolCardDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    paddingLeft: 22, // align with text after emoji
  },
  
  // UX: Clean IA Card
  iaCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  iaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  iaSub: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  startRecordingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: '#E6F4FE',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  startRecordingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  recordingActiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FEE2E2',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  recordingPulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recordingPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991B1B',
  },
  stopRecordingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
  },
  stopRecordingButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  transcribingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transcribingText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  iaInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderStrong,
  },
  dividerLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // UX: Clean Form Card
  medCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Rules Section
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  regrasSection: {
    gap: spacing.sm,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  regrasVazias: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  regraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  regraDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    flexShrink: 0,
  },
  regraText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  regraBold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  regraArrow: {
    color: colors.primary,
    fontWeight: '700',
  },
  removerText: {
    fontSize: 12,
    color: colors.error,
    textDecorationLine: 'underline',
    flexShrink: 0,
  },
  // Rule Modal specific styles
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  chipTextActive: {
    color: colors.textLight,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 50,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.textLight,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  submitButton: {
    marginTop: spacing.sm,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textLight,
  },
});