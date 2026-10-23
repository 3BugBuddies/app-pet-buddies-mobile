import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../component/ui/Button';
import { Card } from '../../component/ui/Card';
import { ErrorState } from '../../component/ui/ErrorState';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { usePets } from '../../control/usePetsControl';
import { speciesLabel, breedLabel, sexLabel, type Pet } from '../../model/pet';
import type { PetTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../../styles/theme';

export function MeusPetsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PetTabParamList>>();
  const insets = useSafeAreaInsets();
  const { data: pets, isLoading, isError, refetch, isRefetching } = usePets();

  if (isLoading) {
    return <LoadingIndicator label="Carregando seus pets..." />;
  }

  if (isError) return <ErrorState type="500" onRetry={refetch} />;

  return (
    <View style={styles.container}>
      <Text style={[styles.headerTitle, { paddingTop: Math.max(insets.top, spacing.lg) }]}>Meus pets</Text>

      <FlatList
        data={pets}
        keyExtractor={(pet) => pet.id!}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 200 }]}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>Você ainda não cadastrou nenhum pet.</Text>
          </View>
        }
        renderItem={({ item }: { item: Pet }) => (
          <Card
            style={styles.petCard}
            onPress={() => navigation.navigate('PetProfile', { petId: item.id! })}
          >
            <View style={styles.petAvatar}>
              <Text style={styles.petAvatarLetter}>{item.nome.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.petText}>
              <Text style={styles.petName} numberOfLines={1}>
                {item.nome}
              </Text>
              <Text style={styles.petBreed} numberOfLines={1}>
                {`${breedLabel(item.raca)} · ${speciesLabel(item.especie).toLowerCase()} · ${sexLabel(item.sexo).toLowerCase()}`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Card>
        )}
      />

      <View style={[styles.footer, { bottom: 110 }]}>
        <Button label="Cadastrar pet" backgroundColor={colors.action} onPress={() => navigation.navigate('NovoPet')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.title,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    flexGrow: 1,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  petAvatar: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.cardChia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petAvatarLetter: {
    ...typography.title,
    color: colors.textPrimary,
  },
  petText: {
    flex: 1,
    gap: 2,
  },
  petName: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  petBreed: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
  },
});
