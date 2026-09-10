import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';

interface CheckInTopBarProps {
  title: string;
  subtitle?: string;
  stepLabel?: string;
  dark?: boolean;
}

export function CheckInTopBar({ title, subtitle, stepLabel, dark }: CheckInTopBarProps) {
  const navigation = useNavigation();
  const textColor = dark ? colors.textLight : colors.textPrimary;
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={() => navigation.goBack()}
        style={[styles.roundBtn, dark && styles.roundBtnDark]}
      >
        <Text style={[styles.roundBtnText, { color: textColor }]}>‹</Text>
      </Pressable>

      <View style={styles.mid}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, dark && styles.subtitleDark]}>{subtitle}</Text>
        ) : null}
      </View>

      <Text style={[styles.step, dark && styles.subtitleDark]}>{stepLabel ?? ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'transparent',
  },
  roundBtnText: {
    fontSize: 20,
  },
  mid: {
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  subtitleDark: {
    color: 'rgba(255,255,255,0.6)',
  },
  step: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 40,
    textAlign: 'right',
  },
});
