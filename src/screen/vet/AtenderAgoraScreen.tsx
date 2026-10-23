import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useClinicPets } from '../../control/usePetsControl';
import type { Pet } from '../../model/pet';
import { abrirFechamento } from '../navigation/abrirFechamento';
import type { HojeTabParamList, VetTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

const responsavelDe = (pet: Pet): string =>
  'responsavelNome' in pet && typeof pet.responsavelNome === 'string' ? pet.responsavelNome : '';

const semAcento = (texto: string) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function AtenderAgoraScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HojeTabParamList, 'AtenderAgora'>>();
  const { data: pets, isLoading } = useClinicPets();
  const [busca, setBusca] = useState('');

  const filtrados = useMemo(() => {
    const termo = semAcento(busca.trim());
    if (!pets) return [];
    if (!termo) return pets;
    return pets.filter((p) => semAcento(`${p.nome} ${responsavelDe(p)}`).includes(termo));
  }, [pets, busca]);

  const atender = (petId: string) => {
    const tabs = navigation.getParent<BottomTabNavigationProp<VetTabParamList>>();
    if (!tabs) return;
    navigation.goBack();
    abrirFechamento(tabs, { petId });
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
          value={busca}
          onChangeText={setBusca}
          autoFocus
        />
      </View>

      <Text style={styles.label}>PACIENTES</Text>
      <FlatList
        data={filtrados}
        keyExtractor={(pet) => String(pet.id)}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.empty}>Nenhum paciente encontrado.</Text>}
        ListFooterComponent={
          <Text style={styles.hint}>Escolha o paciente para registrar o atendimento, sem agenda.</Text>
        }
        renderItem={({ item: pet }) => (
          <Pressable style={styles.card} onPress={() => atender(String(pet.id))}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{pet.nome.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.name}>{pet.nome}</Text>
              <Text style={styles.detail}>
                {[pet.raca || pet.especie, responsavelDe(pet)].filter(Boolean).join(' · ')}
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
