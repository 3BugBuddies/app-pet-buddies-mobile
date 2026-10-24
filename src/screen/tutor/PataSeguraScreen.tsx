import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { useAppointments } from '../../control/useAppointmentsControl';
import { useActivePetId, usePets } from '../../control/usePetsControl';
import { formatShortDate } from '../../model/formatDate';
import { petArticle } from '../../model/pet';
import { isoLocal } from '../../repository/appointmentRepository';
import { colors, radii, spacing } from '../../styles/theme';
import { useTabBarSpace } from '../navigation/useTabBarSpace';

const STEPS = ['Consulta efetivada', 'Ponto', 'Selo', 'Benefício na clínica'];

export function PataSeguraScreen() {
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const { data: pets } = usePets();
  const { activePetId } = useActivePetId();
  const pet = pets?.find((p) => String(p.id) === activePetId) ?? pets?.[0];
  const { data: appointments } = useAppointments(pet?.id ?? undefined);

  const next = useMemo(() => {
    if (!appointments || !pet) return undefined;
    const today = isoLocal(new Date());
    return appointments
      .filter(
        (a) =>
          a.petId === String(pet.id) &&
          a.date?.slice(0, 10) >= today &&
          a.status !== 'CANCELED' &&
          a.status !== 'COMPLETED',
      )
      .sort((a, b) => a.date.localeCompare(b.date))[0];
  }, [appointments, pet]);

  const article = pet ? petArticle(pet.sexo) : 'do';
  const attended = article === 'da' ? 'atendida' : 'atendido';
  const petName = pet?.nome ?? 'pet';
  const balanceNote = next
    ? `A ${next.reason || 'consulta'} de ${formatShortDate(next.date)} vale pontos quando ${article === 'da' ? 'a' : 'o'} ${petName} for ${attended}.`
    : `Agende uma consulta: quando ${article === 'da' ? 'a' : 'o'} ${petName} for ${attended}, vale pontos.`;

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.topBar}>
        <CheckInTopBar title="Pata Segura" />
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image
            source={require('../../../assets/images/pata-segura.png')}
            style={styles.shield}
            resizeMode="contain"
          />
          <View style={styles.heroText}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Em breve</Text>
            </View>
            <Text style={styles.title}>Voltar à clínica vale ponto.</Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.eyebrow}>Seu saldo</Text>
          <Text style={styles.balance}>0 pontos</Text>
          <Text style={styles.balanceNote}>{balanceNote}</Text>
        </View>

        <View style={styles.howCard}>
          <Text style={styles.eyebrow}>Como funciona</Text>
          <View style={styles.pills}>
            {STEPS.map((step, i) => (
              <View key={step} style={styles.pillGroup}>
                {i > 0 ? <Ionicons name="arrow-forward" size={16} color={colors.textMuted} /> : null}
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{step}</Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.howNote}>
            Só conta quando você comparece. Agendar e fazer check-in não pontuam.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  content: { padding: spacing.lg, gap: spacing.md },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  shield: { width: 84, height: 96 },
  heroText: { flex: 1, gap: spacing.sm },
  badge: {
    alignSelf: 'stretch',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.cardMax,
  },
  badgeText: { fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  title: {
    fontFamily: 'Sora',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 30,
    color: colors.textPrimary,
  },
  balanceCard: {
    backgroundColor: colors.cardMax,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  eyebrow: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  balance: {
    fontFamily: 'Sora',
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1,
    color: colors.textPrimary,
  },
  balanceNote: { fontFamily: 'Inter', fontSize: 16, lineHeight: 23, color: colors.textSecondary },
  howCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
  pillGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pill: {
    backgroundColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pillText: { fontFamily: 'Inter', fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  howNote: { fontFamily: 'Inter', fontSize: 14, lineHeight: 20, color: colors.textSecondary },
});
