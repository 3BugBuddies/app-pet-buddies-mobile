import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { buildApiErrorMessage } from '../../control/apiErrorHelper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';
import { transcribeAudio } from '../../repository/speechTranscriptionService';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { NarrativeInput } from '../../component/checkin/NarrativeInput';
import { QuickChips } from '../../component/checkin/QuickChips';
import { Button } from '../../component/ui/Button';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { LogoHeader } from '../../component/ui/LogoHeader';
import { usePet } from '../../control/usePetsControl';
import { useExtractCheckIn } from '../../control/useCheckInControl';
import type { PlanoTabParamList } from '../navigation/types';
import { colors, spacing } from '../../styles/theme';

const QUICK_OPTIONS = ['Deu o remédio', 'Comeu bem', 'Comeu pouco', 'Evacuou', 'Fezes moles', 'Não evacuou'];

type Props = NativeStackScreenProps<PlanoTabParamList, 'CheckInEntry'>;

export function CheckInEntryScreen({ route }: Props) {
  const { petId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PlanoTabParamList>>();
  const insets = useSafeAreaInsets();
  const { data: pet, isLoading: isLoadingPet } = usePet(petId);
  const [narrative, setNarrative] = useState('');
  const extractCheckIn = useExtractCheckIn();

  // Estados de áudio e gravação
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

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
          'O Pet Buddies precisa de permissão de acesso ao microfone para você ditar os cuidados do pet.'
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
      const textoTranscrito = await transcribeAudio(uri, {
        prompt: 'Relato do tutor sobre cuidados com o pet: remédio, alimentação, fezes, vômito, comportamento e sintomas.',
      });

      if (textoTranscrito.trim()) {
        setNarrative((current) => {
          const trimmed = current.trim();
          if (!trimmed) return textoTranscrito;
          return `${trimmed}. ${textoTranscrito}`;
        });
      }
    } catch (error: any) {
      Alert.alert('Erro na transcrição', error?.message ?? 'Falha ao processar o áudio.');
    } finally {
      setIsTranscribing(false);
    }
  };

  if (isLoadingPet) {
    return <LoadingIndicator label="Carregando check-in..." />;
  }

  if (!pet) {
    return <LoadingIndicator label="Pet não encontrado." />;
  }

  const handleContinue = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const extracaoResponse = await extractCheckIn.mutateAsync({
        animalId: petId,
        dataReferencia: today,
        narrativa: narrative,
      });
      navigation.navigate('CheckInConfirm', { petId, extracaoResponse });
    } catch (error: any) {
      const msg = error?.response?.status === 409
        ? 'Você já registrou os cuidados deste pet hoje!'
        : buildApiErrorMessage(error, 'Não foi possível analisar o seu relato. Tente novamente.');
      Alert.alert('Aviso', msg);
    }
  };

  const appendChip = (text: string) => {
    setNarrative((current) => (current.trim() ? `${current.trim()}. ${text}` : text));
  };

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
      <CheckInTopBar title="Check-in" subtitle="Cuidados de hoje" stepLabel="1 / 3" />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
        >
          <LogoHeader size="large" />

          <View style={styles.headline}>
            <Text style={styles.h1}>Como {pet.nome} passou hoje?</Text>
            <Text style={styles.p}>
              Conte do seu jeito. A dose de hoje sai da regra que a vet escreveu.
            </Text>
          </View>

          <NarrativeInput
            value={narrative}
            onChangeText={setNarrative}
            placeholder="ex.: dei o remédio, mas ela comeu pouco e as fezes tavam moles"
            isRecording={recorderState.isRecording}
            isTranscribing={isTranscribing}
            recordingSeconds={recordingSeconds}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />

          <QuickChips options={QUICK_OPTIONS} onSelect={appendChip} />

          <Button
            label="Continuar"
            backgroundColor={colors.textPrimary}
            textColor={colors.textLight}
            disabled={!narrative.trim()}
            loading={extractCheckIn.isPending}
            onPress={handleContinue}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  headline: {
    gap: spacing.xs,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 32,
    color: colors.textPrimary,
  },
  p: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
  },
});
