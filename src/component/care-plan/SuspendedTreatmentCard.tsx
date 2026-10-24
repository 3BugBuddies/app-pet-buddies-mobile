import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { colors, radii, spacing } from '../../styles/theme';
import { formatShortDate } from '../../model/formatDate';
import { phoneDigits, type TreatmentWeek } from '../../model/careHome';
import { medicationsTitle, type ClinicaContato } from '../../model/care';
import { WeekStrip } from './WeekStrip';

interface SuspendedTreatmentCardProps {
  medications: string[];
  suspendedAt: string;
  week: TreatmentWeek | null;
  clinic: ClinicaContato | null | undefined;
}

export function SuspendedTreatmentCard({ medications, suspendedAt, week, clinic }: SuspendedTreatmentCardProps) {
  const call = async () => {
    if (!clinic) return;
    try {
      await Linking.openURL(`tel:${phoneDigits(clinic.telefone)}`);
    } catch {
      Alert.alert('Não foi possível ligar', clinic.telefone);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.texts}>
        <Text style={styles.eyebrow}>{`Tratamento · ${medicationsTitle(medications)}`}</Text>
        <Text style={styles.title}>{`Suspenso pelo alarme de ${formatShortDate(suspendedAt)}`}</Text>
        <Text style={styles.body}>
          {medications.length > 1
            ? 'O relato de hoje acionou a clínica, e ela já recebeu. Não dê nenhum dos remédios até falar com ela.'
            : 'O relato de hoje acionou a clínica, e ela já recebeu. Não dê a dose até falar com ela.'}
        </Text>
      </View>
      {week ? <WeekStrip days={week.days} tone="suspended" /> : null}
      {clinic ? (
        <View style={styles.clinic}>
          <Text style={styles.clinicText}>{[clinic.nome, clinic.telefone].filter(Boolean).join(' · ')}</Text>
          {clinic.telefone ? (
            <Button
              label="Ligar para a clínica"
              backgroundColor={colors.primary}
              textColor={colors.background}
              icon={<Ionicons name="call-outline" size={18} color={colors.background} />}
              onPress={call}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.peach,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm + 4,
  },
  texts: { gap: 2 },
  eyebrow: {
    fontFamily: 'Inter',
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  title: { fontFamily: 'Sora', fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  body: { fontFamily: 'Inter', fontSize: 12, lineHeight: 17, color: colors.textSecondary },
  clinic: { gap: spacing.sm },
  clinicText: { fontFamily: 'Inter', fontSize: 12, color: colors.textSecondary },
});
