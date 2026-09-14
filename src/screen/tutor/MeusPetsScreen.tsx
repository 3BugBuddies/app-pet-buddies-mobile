import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      <View style={{ paddingTop: Math.max(insets.top, spacing.lg), paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
        <View style={styles.headerCard}>
          {/* Esquerda — Títulos */}
          <View style={styles.headerTexts}>
            <Text style={styles.headerTitle}>Meus Pets</Text>
            <Image
              source={require('../../../assets/images/amigos-tranparentes.png')}
              style={styles.mascote}
              resizeMode="contain"
            />
            <Text style={styles.headerSubtitle}>Seus companheiros</Text>
          </View>

          {/* Centro — Mascote flutuante */}
          {/* <Image
            source={require('../../../assets/images/amigos-tranparentes.png')}
            style={styles.mascote}
            resizeMode="contain"
          /> */}

          {/* Direita — Logout */}
          <Pressable onPress={sair} style={styles.logoutBtn} accessibilityRole="button" accessibilityLabel="Sair">
            <Ionicons name="log-out-outline" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
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
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    overflow: 'hidden',
    shadowColor: colors.surfaceDark,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    minHeight: 84,
  },
  headerTexts: {
    flex: 1,
    zIndex: 2,
  },
  headerTitle: {
    fontFamily: 'Sora',
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mascote: {
    position: 'absolute',
    width: 120,
    height: 90,
    alignSelf: 'center',
    left: '40%',
    top: -5,
    zIndex: 1,
    opacity: 0.95,
  },
  logoutBtn: {
    padding: 4,
    zIndex: 2,
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
