import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../../styles/theme';

interface NarrativeInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  isRecording?: boolean;
  isTranscribing?: boolean;
  recordingSeconds?: number;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
}

export function NarrativeInput({
  value,
  onChangeText,
  placeholder,
  isRecording = false,
  isTranscribing = false,
  recordingSeconds = 0,
  onStartRecording,
  onStopRecording,
}: NarrativeInputProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={styles.card}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline
        editable={!isRecording && !isTranscribing}
        style={styles.textarea}
      />

      {isRecording && (
        <View style={styles.recordingBar}>
          <View style={styles.recordingStatus}>
            <View style={styles.pulseDot} />
            <Text style={styles.recordingText}>
              Gravando relato... {formatTime(recordingSeconds)}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Parar gravação"
            onPress={onStopRecording}
            style={styles.stopBtn}
          >
            <Ionicons name="stop" size={14} color="#FFFFFF" />
            <Text style={styles.stopBtnText}>Parar</Text>
          </Pressable>
        </View>
      )}

      {isTranscribing && (
        <View style={styles.transcribingBar}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.transcribingText}>Transcrevendo seu áudio com IA...</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.charCount}>{value.length} caracteres</Text>

        {!isRecording && !isTranscribing && onStartRecording && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ditar por voz"
            onPress={onStartRecording}
            style={styles.micBtn}
          >
            <Ionicons name="mic" size={18} color={colors.action} />
            <Text style={styles.micBtnLabel}>Ditar por voz</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 180,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  textarea: {
    minHeight: 100,
    fontSize: 17,
    lineHeight: 24,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#FEE2E2',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  recordingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991B1B',
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EF4444',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
  },
  stopBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  transcribingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transcribingText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  charCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
  micBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: '#FFF4E6',
    borderWidth: 1,
    borderColor: `${colors.action}40`,
  },
  micBtnLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.action,
  },
});
