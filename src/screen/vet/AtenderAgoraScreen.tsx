import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useClinicPets } from '../../control/usePetsControl';
import { breedLabel } from '../../model/pet';
import { normalizeSearch } from '../../model/text';
import { openClosing } from '../navigation/openClosing';
import type { HojeTabParamList, VetTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

export function AtenderAgoraScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HojeTabParamList, 'AtenderAgora'>>();
  const { data: pets, isLoading } = useClinicPets();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = normalizeSearch(search.trim());
    if (!pets) return [];
    if (!term) return pets;
    return pets.filter((p) => normalizeSearch(`${p.nome} ${p.responsavelNome ?? ''}`).includes(term));
  }, [pets, search]);

  const attend = (petId: string) => {
    const tabs = navigation.getParent<BottomTabNavigationProp<VetTabParamList>>();
    if (!tabs) return;
    navigation.goBack();
    openClosing(tabs, { petId });
  };

  if (isLoading) return <LoadingIndicator label="Carregando os pacientes..." />;

  return (
    <View style={styles.screen}>
      <View style={styles.search}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar pet ou responsável"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoFocus
        />
      </View>

      <Text style={styles.label}>PACIENTES</Text>
      <FlatList
        keyboardDismissMode="on-drag"
        data={filtered}
        keyExtractor={(pet) => String(pet.id)}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.empty}>Nenhum paciente encontrado.</Text>}
        ListFooterComponent={
          <Text style={styles.hint}>Escolha o paciente para registrar o atendimento, sem agenda.</Text>
        }
        renderItem={({ item: pet }) => (
          <Pressable style={styles.card} onPress={() => attend(String(pet.id))}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{pet.nome.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.name}>{pet.nome}</Text>
              <Text style={styles.detail}>
                {[breedLabel(pet.raca), pet.responsavelNome].filter(Boolean).join(' · ')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
  },
  searchInput: { flex: 1, height: 52, fontSize: 16, color: colors.textPrimary },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 1.2, color: colors.textSecondary },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardChia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  cardText: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  detail: { fontSize: 14, color: colors.textSecondary },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl },
  hint: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.md },
});
