import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from '../../component/ui/Card';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
// import { usePatients } from '../../control/usePatientsControl'; // Sprint 4: /pacientes-clinica não existe no Java v2.3.1
import { useClinicPets } from '../../control/usePetsControl';
import type { PacientesTabParamList } from '../navigation/types';
import { colors, radii, spacing, typography } from '../../styles/theme';

const ESPECIE_LABEL: Record<string, string> = {
  CACHORRO: 'Cachorro',
  GATO: 'Gato',
  PASSARO: 'Pássaro',
  COELHO: 'Coelho',
  HAMSTER: 'Hamster',
  OUTRO: 'Outro',
};

export function PacientesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const { data: pets, isLoading, isError } = useClinicPets();
  const [busca, setBusca] = useState('');

  const filtered = useMemo(() => {
    if (!pets) return [];
    const termo = busca.trim().toLowerCase();
    if (!termo) return pets;
    return pets.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        (p.raca ?? '').toLowerCase().includes(termo)
    );
  }, [pets, busca]);

  if (isLoading) {
    return <LoadingIndicator label="Carregando pacientes..." />;
  }

  if (isError || !pets) {
    return <LoadingIndicator label="Não foi possível carregar os pacientes." />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Sprint 4: reativar quando /pacientes-clinica estiver disponível
      <Text style={styles.subtitle}>
        {patients.length} planos ativos · {averageAdherence}% de adesão
      </Text>
      */}

      <TextInput
        style={styles.searchBar}
        placeholder="Buscar pet ou raça"
        placeholderTextColor={colors.textMuted}
        value={busca}
        onChangeText={setBusca}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />

      {/* Sprint 4: reativar filtros de adesão quando /pacientes-clinica estiver disponível
      <View style={styles.filters}>
        {FILTERS.map((filter) => { ... })}
      </View>
      */}

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum paciente encontrado.</Text>
        ) : (
          filtered.map((pet) => (
            <Pressable
              key={pet.id}
              onPress={() => navigation.navigate('DetalhesPet', { petId: pet.id! })}
            >
              <Card>
                <Text style={styles.petNome}>{pet.nome}</Text>
                <Text style={styles.petMeta}>
                  {ESPECIE_LABEL[pet.especie] ?? pet.especie}
                  {pet.raca ? ` · ${pet.raca}` : ''}
                </Text>
              </Card>
            </Pressable>
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
  list: {
    gap: spacing.sm,
  },
  petNome: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  petMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
