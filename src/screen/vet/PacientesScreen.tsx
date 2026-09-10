import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PatientCard } from '../../component/patients/PatientCard';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { usePatients } from '../../control/usePatientsControl';
import type { PacientesTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

type FilterKey = 'ATENCAO' | 'EM_DIA' | 'RENOVAR';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ATENCAO', label: 'Atenção' },
  { key: 'EM_DIA', label: 'Em dia' },
  { key: 'RENOVAR', label: 'Renovar' },
];

export function PacientesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const { data: patients, isLoading, isError } = usePatients();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('ATENCAO');

  const filtered = useMemo(() => {
    if (!patients) return [];
    if (activeFilter === 'ATENCAO') return patients.filter((p) => p.alert);
    if (activeFilter === 'RENOVAR') return patients.filter((p) => p.adherencePct >= 100);
    return patients.filter((p) => !p.alert && p.adherencePct < 100);
  }, [patients, activeFilter]);

  if (isLoading) {
    return <LoadingIndicator label="Carregando pacientes..." />;
  }

  if (isError || !patients) {
    return <LoadingIndicator label="Não foi possível carregar os pacientes." />;
  }

  const attentionCount = patients.filter((p) => p.alert).length;
  const averageAdherence = Math.round(
    patients.reduce((sum, p) => sum + p.adherencePct, 0) / (patients.length || 1)
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>
        {patients.length} planos ativos · {averageAdherence}% de adesão
      </Text>

      <View style={styles.searchBar}>
        <View style={styles.searchDot} />
        <Text style={styles.searchPlaceholder}>Buscar pet ou tutor</Text>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((filter) => {
          const active = filter.key === activeFilter;
          const count = filter.key === 'ATENCAO' ? attentionCount : undefined;
          return (
            <Pressable
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {filter.label}
                {count !== undefined ? ` · ${count}` : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum paciente nesse filtro.</Text>
        ) : (
          filtered.map((patient) => (
            <PatientCard
              key={patient.petId}
              patient={patient}
              onPress={() => navigation.navigate('DetalhesPet', { petId: patient.petId })}
            />
          ))
        )}
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
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textLight,
  },
  list: {
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
