import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../component/ui/Button';
import { ErrorState } from '../../component/ui/ErrorState';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { usePet } from '../../control/usePetsControl';
import { usePlanSummary } from '../../control/usePatientsControl';
import { formatDateBR } from '../../model/formatDate';
import { breedLabel, sexLabel } from '../../model/pet';
import type { PacientesTabParamList } from '../navigation/types';
import { colors, radii, spacing } from '../../styles/theme';

import { useTabBarSpace } from '../navigation/useTabBarSpace';
type Props = NativeStackScreenProps<PacientesTabParamList, 'DetalhesPet'>;

const MAX_CARES = 3;

function openLink(url: string) {
  Linking.openURL(url).catch(() => Alert.alert('Não foi possível abrir o link.'));
}

export function DetalhesPetScreen({ route }: Props) {
  const { petId, consultaId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<PacientesTabParamList>>();
  const tabBarSpace = useTabBarSpace();
  const { data: pet, isLoading: isLoadingPet, isError: isPetError } = usePet(petId);
  const { data: summary } = usePlanSummary(petId);

  if (isLoadingPet) {
    return <LoadingIndicator label="Carregando o pet..." />;
  }

  if (isPetError || !pet) {
    return (
      <ErrorState
        type="500"
        message="Não foi possível carregar as informações do pet."
        onRetry={() => navigation.goBack()}
        retryLabel="Voltar"
      />
    );
  }

  const nascimento = pet.dataNascimento ? `nascido em ${pet.dataNascimento.slice(0, 4)}` : null;
  const details = [breedLabel(pet.raca), sexLabel(pet.sexo).toLowerCase(), nascimento]
    .filter(Boolean)
    .join(' · ');
  const telefone = pet.responsavelTelefone;
  const endereco = pet.responsavelEndereco;
  const upcoming = (summary?.upcoming ?? []).slice(0, MAX_CARES);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{pet.nome.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.heroText}>
          <Text style={styles.name}>{pet.nome}</Text>
          <Text style={styles.detail}>{details}</Text>
        </View>
      </View>

      {pet.responsavelNome ? (
        <View style={styles.card}>
          <View style={styles.responsavelRow}>
            <View style={styles.flex}>
              <Text style={styles.label}>Responsável</Text>
              <Text style={styles.responsavelNome}>{pet.responsavelNome}</Text>
              {telefone ? <Text style={styles.detail}>{telefone}</Text> : null}
            </View>
            {telefone ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => openLink(`tel:${telefone.replace(/\D/g, '')}`)}
                style={styles.ligar}
              >
                <Ionicons name="call-outline" size={18} color={colors.textPrimary} />
                <Text style={styles.ligarText}>Ligar</Text>
              </Pressable>
            ) : null}
          </View>

          {endereco ? (
            <View style={styles.addressBox}>
              <Text style={styles.label}>Endereço</Text>
              <Text style={styles.addressText}>{endereco}</Text>
              <View style={styles.rotaRow}>
                <Button
                  variant="secondary"
                  label="Maps"
                  style={styles.rotaButton}
                  onPress={() =>
                    openLink(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`)
                  }
                />
                <Button
                  variant="secondary"
                  label="Waze"
                  style={styles.rotaButton}
                  onPress={() => openLink(`https://waze.com/ul?q=${encodeURIComponent(endereco)}&navigate=yes`)}
                />
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.card}>
        <View style={styles.cuidadosHead}>
          <Text style={styles.label}>Próximos cuidados</Text>
          <Pressable onPress={() => navigation.navigate('PlanoPaciente', { petId })} hitSlop={8}>
            <Text style={styles.link}>Ver plano</Text>
          </Pressable>
        </View>
        {upcoming.length === 0 ? (
          <Text style={styles.detail}>Nenhum cuidado pendente no plano.</Text>
        ) : (
          upcoming.map((c) => (
            <View key={c.id} style={styles.cuidadoRow}>
              <Text style={styles.cuidadoNome}>{c.name}</Text>
              <Text style={styles.detail}>{formatDateBR(c.targetDate)}</Text>
            </View>
          ))
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
        <Button
          label="Atendimento"
          onPress={() => navigation.navigate('ProntuarioForm', { petId, consultaId })}
          style={{ flex: 1 }}
        />
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
  },
  flex: { flex: 1 },
  hero: {
    backgroundColor: colors.cardChia,
    borderRadius: radii.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  detail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  responsavelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  responsavelNome: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ligar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ligarText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addressBox: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  addressText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  rotaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  rotaButton: {
    flex: 1,
    minHeight: 40,
  },
  cuidadosHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textDecorationLine: 'underline',
  },
  cuidadoRow: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cuidadoNome: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
