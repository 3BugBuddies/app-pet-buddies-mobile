import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PatientCard } from '../../component/patients/PatientCard';
import { ErrorState } from '../../component/ui/ErrorState';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useResumosPlano } from '../../control/usePatientsControl';
import { useClinicPets } from '../../control/usePetsControl';
import { rotuloEspecie, rotuloRaca } from '../../model/pet';
import type { PacientesTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

type Filtro = 'TODOS' | 'TRATAMENTO' | 'PREVENTIVO';

const FILTROS: { key: Filtro; label: string }[] = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'TRATAMENTO', label: 'Em tratamento' },
  { key: 'PREVENTIVO', label: 'Preventivo' },
];

const semAcento = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const dataCurta = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

export function PacientesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const insets = useSafeAreaInsets();
  const { data: pets, isLoading, isError, refetch } = useClinicPets();
  const resumos = useResumosPlano((pets ?? []).map((p) => String(p.id)));
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('TODOS');

  const filtered = useMemo(() => {
    if (!pets) return [];
    const termo = semAcento(busca.trim());
    return pets.filter((p) => {
      const categoria = resumos[String(p.id)]?.categoria;
      const emTratamento = categoria === 'TRATAMENTO' || categoria === 'POS_CIRURGICO';
      if (filtro === 'TRATAMENTO' && !emTratamento) return false;
      if (filtro === 'PREVENTIVO' && categoria !== 'PREVENTIVO') return false;
      if (!termo) return true;
      return (
        semAcento(p.nome).includes(termo) ||
        semAcento(p.responsavelNome ?? '').includes(termo)
      );
    });
  }, [pets, busca, filtro, resumos]);

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
        value={busca}
        onChangeText={setBusca}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />

      <View style={styles.filters}>
        {FILTROS.map((f) => {
          const active = f.key === filtro;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFiltro(f.key)}
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
            const resumo = resumos[String(pet.id)];
            const emTratamento = resumo?.categoria === 'TRATAMENTO' || resumo?.categoria === 'POS_CIRURGICO';
            const pilula = !resumo
              ? null
              : emTratamento
                ? {
                    label: resumo.ultimaData ? `em tratamento até ${dataCurta(resumo.ultimaData)}` : 'em tratamento',
                    tratamento: true,
                  }
                : { label: 'preventivo', tratamento: false };
            return (
              <PatientCard
                key={pet.id}
                petName={pet.nome}
                descricao={`${rotuloEspecie(pet.especie)} · ${rotuloRaca(pet.raca)}`}
                responsavel={pet.responsavelNome}
                pilula={pilula}
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
