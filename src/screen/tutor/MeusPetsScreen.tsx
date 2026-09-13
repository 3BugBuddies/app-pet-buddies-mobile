import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../component/ui/Card';
import { ErrorState } from '../../component/ui/ErrorState';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { AuthContext } from '../../context/authContext';
import { useLogoutControl } from '../../control/authControl';
import { usePets } from '../../control/usePetsControl';
import type { Pet } from '../../model/pet';
import type { PetTabParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../../styles/theme';

export function MeusPetsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PetTabParamList>>();
  const insets = useSafeAreaInsets();
  const { data: pets, isLoading, isError, refetch, isRefetching } = usePets();
  const { session } = useContext(AuthContext);
  const { sair } = useLogoutControl();

  if (isLoading) {
    return <LoadingIndicator label="Carregando seus pets..." />;
  }

  if (isError) return <ErrorState type="500" onRetry={refetch} />;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.lg) }]}>
        <View>
          <Text style={styles.greeting}>Olá, {session?.nome ?? 'tutor'} 👋</Text>
          <Text style={styles.subtitle}>Seus pets</Text>
        </View>
        <Pressable onPress={sair}>
          <Text style={styles.logout}>Sair</Text>
        </Pressable>
      </View>

      <FlatList
        data={pets}
        keyExtractor={(pet) => pet.id!}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 130 }]}
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
            <Text style={styles.petName} numberOfLines={1}>
              {item.nome}
            </Text>
            <Text style={styles.petBreed} numberOfLines={1}>
              {item.raca}
            </Text>
          </Card>
        )}
      />

      <Pressable
        accessibilityRole="button"
        style={styles.fab}
        onPress={() => navigation.navigate('NovoPet')}
      >
        <Text style={styles.fabLabel}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  logout: {
    ...typography.body,
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  petCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  petAvatar: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.cardChia,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  petAvatarLetter: {
    ...typography.title,
    color: colors.primary,
  },
  petName: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  petBreed: {
    ...typography.caption,
    color: colors.textMuted,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
  retryText: {
    ...typography.body,
    color: colors.primary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 110,
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.surfaceDark,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabLabel: {
    fontSize: 28,
    color: colors.textLight,
    lineHeight: 30,
  },
});
