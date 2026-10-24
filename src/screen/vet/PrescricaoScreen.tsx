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
import { capitalize, daysText } from '../../model/careHome';
import { MedicationCard, closedSummary } from '../../component/prescricao/MedicationCard';
import { Button } from '../../component/ui/Button';
import { FieldError } from '../../component/forms/FieldError';
import { Input } from '../../component/ui/Input';
import {
  type CondicaoNovaPendente,
  usePrescricaoDraftControl,
  useDraftPrescription,
  useNovaRegraControl,
  useCondicoesClinicas,
  useCriarCondicao,
  usePrescriptionTemplates,
} from '../../control/usePrescriptionControl';
import { extrairPrescricoesDaNarrativa } from '../../control/prescriptionExtractor';
import type { ItemReceitaDraft, PrescriptionTemplate } from '../../model/prescription';
import { descreverCondicao, OPERADOR_SIMBOLO, rotuloAcao, type Operador, type RegraDraft, type TipoAcao } from '../../model/prescriptionRule';
import { usePet } from '../../control/usePetsControl';
import { usePatients } from '../../control/usePatientsControl';
import type { PacientesTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

import { useTabBarSpace } from '../navigation/useTabBarSpace';


type Props = NativeStackScreenProps<PacientesTabParamList, 'Prescricao'>;

export function PrescricaoScreen({ route }: Props) {
  const { animalId, receita } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  
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

  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [ruleTargetKey, setRuleTargetKey] = useState<string | null>(null);
  // Quantos medicamentos o último ditado trouxe; só aparece no resultado quando passa de um.
  const [foundCount, setFoundCount] = useState<number | null>(null);
  const [criandoTipo, setCriandoTipo] = useState<'BOOLEANO' | 'NUMERICO' | null>(null);
  const [criandoUnidade, setCriandoUnidade] = useState('');

  const {
    itens,
    openKey,
    toggleOpen,
    addItem,
    removeItem,
    updateItem,
    setRegras,
    replaceItens,
    condicoesNovas,
    setCondicoesNovas,
    erros,
    validar,
  } = usePrescricaoDraftControl({
    animalId,
    registroAtendimentoId: receita?.registroAtendimentoId ?? '',
    initial: receita,
  });

  const { data: catalogo = [], isLoading: isLoadingCondicoes } = useCondicoesClinicas();
  const criarCondicao = useCriarCondicao();
  const { data: templates = [], isLoading: isLoadingTemplates } = usePrescriptionTemplates();
  const {
    condicao, filtradas, termoCriavel, tipoRegra, escolherTipoRegra, acoes, operadores,
    busca, setBusca,
    condicaoClinicaId, selecionarCondicao,
    acao, setAcao,
    operador, setOperador,
    limiteTexto, setLimiteTexto,
    erro: erroRegra,
    construirRegra,
    reiniciar: reiniciarRegra,
  } = useNovaRegraControl(catalogo);

  const abrirModalRegra = (key: string) => {
    reiniciarRegra();
    setCriandoTipo(null);
    setCriandoUnidade('');
    setRuleTargetKey(key);
    setRuleModalVisible(true);
  };

  const handleAddRule = () => {
    const regra = construirRegra();
    if (!regra || !ruleTargetKey) return;
    setRegras(ruleTargetKey, (prev) => [...prev, regra]);
    setRuleModalVisible(false);
  };

  // "+ criar «termo»": cria a condição na clínica (409 já resolvido no repositório) e a seleciona.
  const handleCriarCondicao = async (tipoDado: 'BOOLEANO' | 'NUMERICO') => {
    if (!termoCriavel) return;
    if (tipoDado === 'NUMERICO' && !criandoUnidade.trim()) {
      Alert.alert('Unidade', 'Informe a unidade da condição (ex.: °C, bpm).');
      return;
    }
    try {
      const criada = await criarCondicao.mutateAsync({
        rotulo: termoCriavel,
        tipoDado,
        unidade: tipoDado === 'NUMERICO' ? criandoUnidade : null,
      });
      selecionarCondicao(criada.id);
      setBusca(criada.rotulo);
      setCriandoTipo(null);
      setCriandoUnidade('');
    } catch (error: any) {
      Alert.alert('Não foi possível criar a condição', buildApiErrorMessage(error));
    }
  };

  // Faixa "Condição nova": cria a condição proposta pela IA e já usa na regra do medicamento dela.
  const handleCriarEUsar = async (key: string, nova: CondicaoNovaPendente) => {
    try {
      const criada = await criarCondicao.mutateAsync({ rotulo: nova.rotulo, tipoDado: nova.tipoDado });
      setRegras(key, (prev) => [
        ...prev,
        {
          condicaoClinicaId: criada.id,
          rotuloCongelado: criada.rotulo,
          acao: nova.acao,
          operador: criada.tipoDado === 'NUMERICO' ? nova.operador : null,
          limite: criada.tipoDado === 'NUMERICO' ? nova.limite : null,
        },
      ]);
      setCondicoesNovas(key, (condicoesNovas[key] ?? []).filter((c) => c.chave !== nova.chave));
    } catch (error: any) {
      Alert.alert('Não foi possível criar a condição', buildApiErrorMessage(error));
    }
  };

  const handleDescartarNova = (key: string, chave: string) =>
    setCondicoesNovas(key, (condicoesNovas[key] ?? []).filter((c) => c.chave !== chave));

  // Copia a receita-modelo para o medicamento aberto; tudo continua editável e a origem segue junto.
  const handleApplyTemplate = (modelo: PrescriptionTemplate) => {
    const target = itens.find((i) => i.key === openKey) ?? itens[itens.length - 1];
    updateItem(target.key, {
      medicamento: modelo.medicamento,
      doseMin: modelo.doseMin,
      doseMax: modelo.doseMax,
      unidade: modelo.unidade,
      frequenciaDia: modelo.frequenciaDia,
      duracaoDias: modelo.duracaoDias,
      orientacao: modelo.orientacao ?? '',
      regras: [...modelo.regras]
        .sort((x, y) => (x.ordem ?? 0) - (y.ordem ?? 0))
        .map((r) => ({
          condicaoClinicaId: r.condicaoClinicaId,
          rotuloCongelado: r.condicaoRotulo,
          acao: r.acaoDose,
          operador: r.operador,
          limite: r.limite,
        })),
      receitaModeloId: modelo.id,
      receitaModeloVersao: modelo.versao,
    });
    setCondicoesNovas(target.key, []);
    setTemplateModalVisible(false);
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

  const itemFromExtraction = (e: {
    medicamento?: string;
    doseMin?: number | null;
    doseMax?: number | null;
    unidade?: string | null;
    frequenciaDia?: number | null;
    duracaoDias?: number | null;
    orientacao?: string | null;
  }): Omit<ItemReceitaDraft, 'key'> => ({
    medicamento: e.medicamento ?? '',
    doseMin: e.doseMin ?? 0,
    doseMax: e.doseMax ?? 0,
    unidade: e.unidade ?? 'mg',
    frequenciaDia: e.frequenciaDia ?? 1,
    duracaoDias: e.duracaoDias ?? 7,
    orientacao: e.orientacao ?? '',
    regras: [],
  });

  // Preenche a receita com o extrator local (sem IA da API). Os valores são só uma sugestão.
  const preencherComExtratorLocal = (texto: string, aviso: string) => {
    const extraidos = extrairPrescricoesDaNarrativa(texto);
    replaceItens(extraidos.map(itemFromExtraction));
    setFoundCount(extraidos.length);
    Alert.alert('Prescrição Estruturada', aviso);
  };

  const handleGerarIA = async (textoCustomizado?: string) => {
    const textoParaProcessar = (textoCustomizado ?? narrativaIA).trim();
    if (!textoParaProcessar) return;

    try {
      // O fechamento é único (nada gravado ainda): o servidor lê o paciente só pelo animalId.
      const rascunho = await draftPrescription.mutateAsync({
        animalId,
        narrativa: textoParaProcessar,
      });

      // Modelo de IA indisponível — preenchimento com o extrator local
      if (!rascunho.extracaoDisponivel) {
        preencherComExtratorLocal(
          textoParaProcessar,
          'A IA do servidor está indisponível. Campos preenchidos pelo extrator local: revise antes de assinar.'
        );
        return;
      }

      // Back antigo não manda itens[]: o 1º medicamento vem nos campos legados.
      const propostos = rascunho.itens?.length
        ? rascunho.itens
        : [{ prescricao: rascunho.prescricao, regrasPropostas: rascunho.regrasPropostas }];

      // Regras da condição conhecida entram direto (o rótulo vem do servidor); sinal de alarme não
      // vira regra. As de condição nova esperam a vet criar ou descartar.
      const pendentesPorIndice: CondicaoNovaPendente[][] = [];
      const novos = propostos.map((proposto, n) => {
        const prontas: RegraDraft[] = [];
        const pendentes: CondicaoNovaPendente[] = [];
        (proposto.regrasPropostas ?? []).forEach((r, i) => {
          const idCond = r.condicaoClinicaId != null ? Number(r.condicaoClinicaId) : null;
          const doCatalogo = idCond != null ? catalogo.find((c) => c.id === idCond) : undefined;
          const rotulo = r.condicaoRotulo || r.condicaoNova?.rotulo || doCatalogo?.rotulo || `Condição #${idCond}`;
          if (idCond == null || r.condicaoNova) {
            pendentes.push({
              chave: `nova-${n}-${i}`,
              rotulo,
              tipoDado: r.condicaoNova?.tipoDado ?? (r.operador ? 'NUMERICO' : 'BOOLEANO'),
              acao: r.acaoDose,
              operador: r.operador ?? null,
              limite: r.limite ?? null,
            });
            return;
          }
          if (doCatalogo?.critica) return;
          prontas.push({
            condicaoClinicaId: idCond,
            rotuloCongelado: rotulo,
            acao: r.acaoDose,
            operador: r.operador ?? null,
            limite: r.limite ?? null,
          });
        });
        pendentesPorIndice.push(pendentes);
        return { ...itemFromExtraction(proposto.prescricao), regras: prontas };
      });

      const keys = replaceItens(novos);
      keys.forEach((key, n) => setCondicoesNovas(key, pendentesPorIndice[n]));
      setFoundCount(novos.length);
    } catch (error: any) {
      console.warn('[PrescricaoScreen] IA do servidor indisponível ou recusou a requisição:', error);
      try {
        preencherComExtratorLocal(
          textoParaProcessar,
          'A IA do servidor não respondeu. Campos preenchidos pelo extrator local: revise e adicione regras se desejar.'
        );
      } catch {
        Alert.alert('Erro ao chamar IA', buildApiErrorMessage(error));
      }
    }
  };

  const irParaAssinatura = async () => {
    if (Object.values(condicoesNovas).some((lista) => lista.length > 0)) {
      Alert.alert('Condição nova pendente', 'Crie ou descarte as condições novas antes de adicionar ao atendimento.');
      return;
    }
    const draft = await validar();
    if (draft) navigation.popTo('ProntuarioForm', { petId: animalId, prescricao: draft }, { merge: true });
  };

  const pendentesTodas = itens.flatMap((item) => (condicoesNovas[item.key] ?? []).map((nova) => ({ item, nova })));
  const errosDoItem = (key: string) =>
    Object.fromEntries(
      Object.entries(erros)
        .filter(([k]) => k.startsWith(`${key}.`))
        .map(([k, v]) => [k.slice(key.length + 1), v])
    );

  return (
    <>
    <ScrollView keyboardDismissMode="on-drag" style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: tabBarSpace }]} keyboardShouldPersistTaps="handled">
      <CheckInTopBar
        title="Prescrição"
        subtitle={pet ? `${pet.nome}${tutorName ? ` • ${tutorName}` : ''}` : undefined}
        stepLabel="rascunho"
      />

      <Pressable accessibilityRole="button" style={styles.templateButton} onPress={() => setTemplateModalVisible(true)}>
        <Ionicons name="document-text-outline" size={18} color={colors.primary} />
        <Text style={styles.templateButtonText}>Usar receita-modelo</Text>
      </Pressable>

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
        {pendentesTodas.length > 0 || (foundCount ?? 0) > 1 ? (
          <>
            <Text style={styles.resultLabel}>Resultado do assistente</Text>
            {(foundCount ?? 0) > 1 ? (
              <Text style={styles.novaBandSub}>{foundCount} medicamentos encontrados. Confira cada cartão abaixo.</Text>
            ) : null}
            {pendentesTodas.map(({ item, nova }) => (
              <View key={nova.chave} style={styles.novaBand}>
                <Text style={styles.novaBandTitle}>Condição nova: «{nova.rotulo}»</Text>
                <Text style={styles.novaBandSub}>
                  {itens.length > 1 && item.medicamento
                    ? `O ditado trouxe, para ${item.medicamento}, uma condição que o catálogo da clínica não tem.`
                    : 'O ditado trouxe uma condição que o catálogo da clínica não tem.'}
                </Text>
                <View style={styles.novaBandActions}>
                  <Button
                    label="Criar e usar"
                    loading={criarCondicao.isPending}
                    onPress={() => handleCriarEUsar(item.key, nova)}
                    style={styles.flex1}
                  />
                  <Button
                    label="Descartar"
                    variant="secondary"
                    disabled={criarCondicao.isPending}
                    onPress={() => handleDescartarNova(item.key, nova.chave)}
                    style={styles.flex1}
                  />
                </View>
              </View>
            ))}
          </>
        ) : null}
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerLabel}>ou confira os campos</Text>
        <View style={styles.divider} />
      </View>

      {itens.map((item) => (
        <MedicationCard
          key={item.key}
          item={item}
          single={itens.length === 1}
          open={openKey === item.key}
          errors={errosDoItem(item.key)}
          onToggle={() => toggleOpen(item.key)}
          onRemove={() => removeItem(item.key)}
          onChange={(patch) => updateItem(item.key, patch)}
          onAddRule={() => abrirModalRegra(item.key)}
        />
      ))}

      <Pressable accessibilityRole="button" onPress={() => addItem()} style={styles.addMedication}>
        <Text style={styles.addMedicationText}>+ Adicionar medicamento</Text>
      </Pressable>

      <Button
        label="Salvar receita"
        backgroundColor={colors.action}
        onPress={irParaAssinatura}
        style={{ marginTop: spacing.md }}
      />
    </ScrollView>

    {templateModalVisible && (
      <View style={[styles.modalOverlay, { paddingTop: insets.top }]}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Receitas-modelo</Text>
            <Pressable onPress={() => setTemplateModalVisible(false)} style={{ padding: 4 }}>
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </Pressable>
          </View>
          <Text style={styles.modalSubtitle}>Escolha uma receita-modelo para preencher a prescrição. Você pode editar tudo depois.</Text>

          <ScrollView keyboardDismissMode="on-drag" style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: tabBarSpace + spacing.lg }}>
            {isLoadingTemplates ? (
              <ActivityIndicator color={colors.primary} />
            ) : templates.length === 0 ? (
              <Text style={styles.noteText}>Nenhuma receita-modelo cadastrada — cadastre no painel da clínica.</Text>
            ) : (
              templates.map((modelo) => (
                <Pressable key={modelo.id} style={styles.templateCard} onPress={() => handleApplyTemplate(modelo)}>
                  <Text style={styles.templateCardName}>{modelo.titulo}</Text>
                  <Text style={styles.templateCardDetail}>
                    {capitalize(modelo.medicamento)} · {modelo.frequenciaDia}x ao dia · {daysText(modelo.duracaoDias)}
                    {modelo.regras.length > 0 ? ` · ${modelo.regras.length} ${modelo.regras.length === 1 ? 'regra' : 'regras'}` : ''}
                  </Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    )}

    {ruleModalVisible && (
      <View style={[styles.modalOverlay, { paddingTop: insets.top }]}>
        <View style={styles.ruleModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nova regra de dose</Text>
            <Pressable onPress={() => setRuleModalVisible(false)} style={{ padding: 4 }}>
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </Pressable>
          </View>
          <Text style={styles.modalSubtitle}>Se o responsável relatar no check-in:</Text>

          <ScrollView keyboardDismissMode="on-drag"
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sectionLabel}>Tipo da regra</Text>
            <View style={styles.chipsRow}>
              {([['RELATO', 'relato (sim/não)'], ['MEDIDA', 'medida (> <)']] as const).map(([tipo, rotulo]) => (
                <Pressable
                  key={tipo}
                  onPress={() => escolherTipoRegra(tipo)}
                  accessibilityState={{ selected: tipoRegra === tipo }}
                  style={[styles.chip, tipoRegra === tipo && styles.chipActive]}
                >
                  <Text style={[styles.chipText, tipoRegra === tipo && styles.chipTextActive]}>{rotulo}</Text>
                </Pressable>
              ))}
            </View>

            <Input
              label="Condição"
              placeholder="Buscar ou criar condição"
              value={busca}
              onChangeText={(texto) => {
                setBusca(texto);
                setCriandoTipo(null);
              }}
              autoCorrect={false}
            />

            {isLoadingCondicoes ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <View style={styles.chipsRow}>
                {filtradas.map((item) => {
                  const selecionada = condicaoClinicaId === item.id && !item.critica;
                  return (
                    <Pressable
                      key={item.id}
                      disabled={item.critica}
                      onPress={() => selecionarCondicao(item.id)}
                      accessibilityState={{ disabled: item.critica, selected: selecionada }}
                      style={[styles.chip, selecionada && styles.chipActive, item.critica && styles.chipAlarm]}
                    >
                      <Text style={[styles.chipText, selecionada && styles.chipTextActive]}>{item.rotulo}</Text>
                      {item.critica ? <Text style={styles.chipAlarmTag}>sinal de alarme · já escala sozinho</Text> : null}
                    </Pressable>
                  );
                })}
              </View>
            )}

            {!isLoadingCondicoes && filtradas.length === 0 && !termoCriavel ? (
              <Text style={styles.noteText}>Nenhuma condição cadastrada na clínica. Digite um nome para criar.</Text>
            ) : null}

            {termoCriavel ? (
              <View style={styles.criarBox}>
                <Pressable onPress={() => setCriandoTipo(null)} accessibilityRole="button">
                  <Text style={styles.criarTitle}>+ criar «{termoCriavel}»</Text>
                </Pressable>
                <Text style={styles.noteText}>Essa condição é do tipo:</Text>
                <View style={styles.chipsRow}>
                  <Pressable
                    style={styles.chip}
                    disabled={criarCondicao.isPending}
                    onPress={() => handleCriarCondicao('BOOLEANO')}
                  >
                    <Text style={styles.chipText}>Sim ou não</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.chip, criandoTipo === 'NUMERICO' && styles.chipActive]}
                    disabled={criarCondicao.isPending}
                    onPress={() => setCriandoTipo('NUMERICO')}
                  >
                    <Text style={[styles.chipText, criandoTipo === 'NUMERICO' && styles.chipTextActive]}>Número</Text>
                  </Pressable>
                </View>
                {criandoTipo === 'NUMERICO' ? (
                  <>
                    <Input
                      label="Unidade"
                      placeholder="Ex.: °C, bpm"
                      value={criandoUnidade}
                      onChangeText={setCriandoUnidade}
                      autoCorrect={false}
                    />
                    <Button
                      label="Criar condição"
                      variant="secondary"
                      loading={criarCondicao.isPending}
                      onPress={() => handleCriarCondicao('NUMERICO')}
                    />
                  </>
                ) : null}
              </View>
            ) : null}

            {condicao?.tipoDado === 'NUMERICO' ? (
              <>
                <Text style={styles.sectionLabel}>Quando o valor for:</Text>
                <View style={styles.chipsRow}>
                  {operadores.map((op) => (
                    <Pressable
                      key={op}
                      onPress={() => setOperador(op)}
                      style={[styles.chip, operador === op && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, operador === op && styles.chipTextActive]}>
                        {OPERADOR_SIMBOLO[op]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Input
                  label={`Limite${condicao.unidade ? ` (${condicao.unidade})` : ''}`}
                  placeholder="Ex.: 39,5"
                  value={limiteTexto}
                  onChangeText={setLimiteTexto}
                  keyboardType="decimal-pad"
                />
              </>
            ) : null}

            <Text style={styles.sectionLabel}>Então aplicaremos:</Text>
            <View style={styles.chipsRow}>
              {acoes.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setAcao(option)}
                  style={[styles.chip, acao === option && styles.chipActive]}
                >
                  <Text style={[styles.chipText, acao === option && styles.chipTextActive]}>{rotuloAcao(option)}</Text>
                </Pressable>
              ))}
            </View>

            {condicao ? (
              <View style={styles.previewBox}>
                <Text style={styles.previewText}>
                  {capitalize(
                    descreverCondicao({
                      condicaoClinicaId: condicao.id,
                      rotuloCongelado: condicao.rotulo,
                      acao,
                      operador: condicao.tipoDado === 'NUMERICO' ? operador : null,
                      limite:
                        condicao.tipoDado === 'NUMERICO' && !Number.isNaN(parseFloat(limiteTexto.replace(',', '.')))
                          ? parseFloat(limiteTexto.replace(',', '.'))
                          : null,
                    })
                  )}{' '}
                  → {rotuloAcao(acao)}
                </Text>
              </View>
            ) : null}

            {erroRegra ? <FieldError message={erroRegra} /> : null}

          </ScrollView>
          <View style={[styles.ruleFooter, { paddingBottom: tabBarSpace }]}>
            <Button label="Adicionar regra" backgroundColor={colors.action} onPress={handleAddRule} />
          </View>
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
  
  // UX: receita-modelo
  templateButton: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  templateButtonText: {
    color: colors.primary,
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
  ruleFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
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
  templateCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  templateCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  templateCardDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
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
    color: colors.textPrimary,
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

  flex1: { flex: 1 },
  addMedication: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addMedicationText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  
  // Rules Section
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  novaBand: {
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.cardMax,
    borderRadius: radii.md,
  },
  novaBandTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  novaBandSub: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  novaBandActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  // Rule Modal specific styles
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
  chipAlarm: {
    height: 'auto',
    minHeight: 34,
    paddingVertical: 4,
    opacity: 0.6,
    borderStyle: 'dashed',
  },
  chipAlarmTag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.error,
  },
  criarBox: {
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  criarTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  previewBox: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
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
});