import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useProtocols } from '../../control/useProtocolsControl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';
import { CONDITION_SIGNAL_LABEL, GLOBAL_ALARM_SIGNALS } from '../../model/legacyPrescription';

export function ClinicaScreen() {
  const insets = useSafeAreaInsets();
  const { data: protocols, isLoading, isError } = useProtocols();

  if (isLoading) {
    return <LoadingIndicator label="Carregando protocolos..." />;
  }

  if (isError || !protocols) {
    return <LoadingIndicator label="Não foi possível carregar os protocolos." />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 130 }]}>
      <Text style={styles.subtitle}>
        Um protocolo é faixa + regras. Ao prescrever, você parte dele e ajusta por paciente.
      </Text>

      <View style={styles.searchBar}>
        <View style={styles.searchDot} />
        <Text style={styles.searchPlaceholder}>Buscar protocolo</Text>
      </View>

      <Text style={styles.sectionLabel}>Da clínica · {protocols.length}</Text>
      <View style={styles.card}>
        {protocols.map((protocol, index) => (
          <View key={protocol.id}>
            <View style={styles.row}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{protocol.ruleCount}</Text>
              </View>
              <View style={styles.textBlock}>
                <Text style={styles.name}>{protocol.name}</Text>
                <Text style={styles.meta}>
                  {protocol.categoryLabel} · {protocol.ruleCount} regras · {protocol.patientCount} pacientes
                </Text>
              </View>
            </View>
            {index < protocols.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Sinais de alarme · valem para todos</Text>
      <View style={styles.alarmCard}>
        <View style={styles.alarmHead}>
          <Text style={styles.alarmLabel}>Sempre sem dose</Text>
          <Text
            style={styles.alarmEdit}
            onPress={() => Alert.alert('Em breve', 'Edição de sinais de alarme globais em breve.')}
          >
            Editar
          </Text>
        </View>
        {GLOBAL_ALARM_SIGNALS.map((signal) => (
          <Text key={signal} style={styles.alarmCode}>
            {CONDITION_SIGNAL_LABEL[signal].toLowerCase()}
          </Text>
        ))}
        <Text style={styles.alarmNote}>
          Sobrepõem qualquer protocolo. Emergência 24h + aviso a você.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  searchBar: {
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchDot: {
    width: 16,
    height: 16,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.textMuted,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: colors.textMuted,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 68,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.cardChia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 13,
    color: colors.primary,
  },
  textBlock: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  alarmCard: {
    backgroundColor: `${colors.error}1A`,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  alarmHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alarmLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.error,
  },
  alarmEdit: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.error,
  },
  alarmCode: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  alarmNote: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
