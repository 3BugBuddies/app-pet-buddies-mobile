import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../styles/theme';
import type { ClinicPatient } from '../../model/patient';

interface PatientCardProps {
  patient: ClinicPatient;
  onPress: () => void;
}

export function PatientCard({ patient, onPress }: PatientCardProps) {
  const tone = patient.alert ? colors.warning : colors.success;
  const toneTint = patient.alert ? colors.cardMax : `${colors.success}1F`;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.avatar, { backgroundColor: toneTint }]}>
        <Text style={[styles.avatarText, { color: patient.alert ? colors.textPrimary : colors.success }]}>
          {patient.petName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.textBlock}>
        <View style={styles.headRow}>
          <Text style={styles.name}>
            {patient.petName} <Text style={styles.idText}>#{patient.petId}</Text>
          </Text>
          <Text style={styles.meta}>
            {patient.tutorName} · {patient.weekLabel}
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${patient.adherencePct}%`, backgroundColor: tone }]} />
        </View>
        <Text style={[styles.note, { color: patient.alert ? colors.warning : colors.textSecondary }]}>
          {patient.note}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '700',
    fontSize: 20,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  note: {
    fontSize: 13,
  },
  idText: { fontSize: 12, color: colors.textMuted, fontWeight: '400' },
});
