import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface NarrativeInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

// O microfone é só visual por enquanto: expo-speech faz texto→voz, não
// reconhecimento de voz. Ditado real precisaria de @react-native-voice/voice
// ou expo-speech-recognition, que exigem build de dev client (não roda no
// Expo Go padrão) — ver decisão registrada na conversa do Sprint 3.
export function NarrativeInput({ value, onChangeText, placeholder }: NarrativeInputProps) {
  return (
    <View style={styles.card}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline
        style={styles.textarea}
      />
      <View style={styles.footer}>
        <Text style={styles.charCount}>{value.length} caracteres</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Ditar por voz (em breve)" style={styles.micBtn}>
          <View style={styles.micBar} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 180,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  textarea: {
    flex: 1,
    fontSize: 19,
    lineHeight: 26,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.cardMax,
    borderWidth: 1,
    borderColor: `${colors.warning}59`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBar: {
    width: 12,
    height: 18,
    borderRadius: 6,
    backgroundColor: colors.warning,
  },
});
