import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PatientCard } from '../../component/patients/PatientCard';
import { ErrorState } from '../../component/ui/ErrorState';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { usePlanSummaries } from '../../control/usePatientsControl';
import { useClinicPets } from '../../control/usePetsControl';
import { formatShortDate } from '../../model/formatDate';
import { speciesLabel, breedLabel } from '../../model/pet';
import { normalizeSearch } from '../../model/text';
import type { PacientesTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

type Filter = 'TODOS' | 'TRATAMENTO' | 'PREVENTIVO';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'TRATAMENTO', label: 'Em tratamento' },
  { key: 'PREVENTIVO', label: 'Preventivo' },
];

export function PacientesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const insets = useSafeAreaInsets();
  const { data: pets, isLoading, isError, refetch } = useClinicPets();
  const summaries = usePlanSummaries((pets ?? []).map((p) => String(p.id)));
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('TODOS');

  const filtered = useMemo(() => {
    if (!pets) return [];
    const term = normalizeSearch(search.trim());
    return pets.filter((p) => {
      const category = summaries[String(p.id)]?.category;
      const inTreatment = category === 'TRATAMENTO' || category === 'POS_CIRURGICO';
      if (filter === 'TRATAMENTO' && !inTreatment) return false;
      if (filter === 'PREVENTIVO' && category !== 'PREVENTIVO') return false;
      if (!term) return true;
      return (
        normalizeSearch(p.nome).includes(term) ||
        normalizeSearch(p.responsavelNome ?? '').includes(term)
      );
    });
  }, [pets, search, filter, summaries]);

  if (isLoading) {
    return <LoadingIndicator label="Carregando pacientes..." />;
  }

  if (isError || !pets) return <ErrorState type="500" message="Não foi possível carregar seus pacientes no momento." onRetry={() => refetch()} />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 130 }]}>
      <Text style={styles.count}>
        {filtered.length} {filtered.length === 1 ? 'paciente' : 'pacientes'}
      </Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Buscar pet ou responsável"
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />

      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum paciente encontrado.</Text>
        ) : (
          filtered.map((pet) => {
            const summary = summaries[String(pet.id)];
            const inTreatment = summary?.category === 'TRATAMENTO' || summary?.category === 'POS_CIRURGICO';
            const pill = !summary
              ? null
              : inTreatment
                ? {
                    label: summary.lastDate ? `em tratamento até ${formatShortDate(summary.lastDate)}` : 'em tratamento',
                    treatment: true,
                  }
                : { label: 'preventivo', treatment: false };
            return (
              <PatientCard
                key={pet.id}
                petName={pet.nome}
                description={`${speciesLabel(pet.especie)} · ${breedLabel(pet.raca)}`}
                tutorName={pet.responsavelNome}
                pill={pill}
                onPress={() => navigation.navigate('DetalhesPet', { petId: pet.id! })}
              />
            );
          })
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
  count: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  searchBar: {
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
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
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
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
