import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FieldError } from '../../component/forms/FieldError';
import { Button } from '../../component/ui/Button';
import { Input } from '../../component/ui/Input';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { usePetFormControl } from '../../control/usePetFormControl';
import type { PetTabParamList } from '../navigation/types';
import { colors, radii, spacing, typography } from '../../styles/theme';

// botao-passaro-1.png não existe nos assets — usando botao-passaro.png
const ESPECIE_ICONS: Record<string, any> = {
  CACHORRO: require('../../../assets/botoes/botao-cachorro-1.png'),
  GATO: require('../../../assets/botoes/botao-gato-1.png'),
  PASSARO: require('../../../assets/botoes/botao-passaro.png'),
  HAMSTER: require('../../../assets/botoes/botao-roedor-1.png'),
  OUTRO: require('../../../assets/botoes/botao-outros-1.png'),
};

const SEXO_ICON: Record<string, string> = {
  MACHO: '♂',
  FEMEA: '♀',
};

const SEXO_LABEL: Record<string, string> = {
  MACHO: 'Macho',
  FEMEA: 'Fêmea',
};

type Props = NativeStackScreenProps<PetTabParamList, 'NovoPet'>;

export function NovoPetScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const petId = route.params?.petId;

  const {
    nome, setNome,
    especie, setEspecie,
    raca, setRaca,
    porte, setPorte,
    sexo, setSexo,
    peso, handlePesoChange,
    dataNascimento,
    handleDataChange,
    castrado, setCastrado,
    condicaoCronica, setCondicaoCronica,
    alergia, setAlergia,
    erros,
    salvar,
    isFetchingPet,
    isSaving,
    ESPECIES,
    PORTES,
    SEXOS,
  } = usePetFormControl((novoPetId) => {
    if (novoPetId) {
      navigation.replace('PetProfile', { petId: novoPetId });
    } else {
      navigation.goBack();
    }
  }, petId);

  if (isFetchingPet) {
    return <LoadingIndicator label="Carregando dados..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero banner ilustrado */}
        <Image
          source={require('../../../assets/images/banner.png')}
          style={styles.heroBanner}
          resizeMode="contain"
        />
        <Text style={styles.heroSubtitle}>
          {petId
            ? 'Atualize os dados do seu companheiro'
            : 'Cadastre o novo companheiro...'}
        </Text>

        {/* Cartão 1 — Informações básicas */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconCircle, { backgroundColor: colors.cardChia }]}>
              <Ionicons name="paw-outline" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Informações básicas</Text>
              <Text style={styles.cardSubtitle}>Vamos começar pelo essencial.</Text>
            </View>
          </View>

          <Input
            label="Nome *"
            placeholder="Mínimo de 2 caracteres"
            value={nome}
            onChangeText={setNome}
            hasError={!!erros.nome}
          />
          <FieldError message={erros.nome} />

          {/* Espécie — COELHO removido, chip quadrado só com ícone */}
          <Text style={styles.fieldLabel}>Espécie *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.especieRow}
          >
            {ESPECIES.filter((e) => e !== 'COELHO').map((e) => {
              const active = especie === e;
              return (
                <Pressable
                  key={e}
                  style={[styles.especieChip, active && styles.especieChipActive]}
                  onPress={() => setEspecie(e)}
                  accessibilityRole="button"
                  accessibilityLabel={e}
                >
                  <Image
                    source={ESPECIE_ICONS[e]}
                    style={styles.especieImg}
                    resizeMode="contain"
                  />
                </Pressable>
              );
            })}
          </ScrollView>
          <FieldError message={erros.especie} />

          {/* Sexo */}
          <Text style={styles.fieldLabel}>Sexo *</Text>
          <View style={styles.sexoRow}>
            {SEXOS.map((s) => {
              const active = sexo === s;
              return (
                <Pressable
                  key={s}
                  style={[styles.sexoButton, active && styles.sexoButtonActive]}
                  onPress={() => setSexo(s)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.sexoIcon, active && styles.sexoTextActive]}>
                    {SEXO_ICON[s]}
                  </Text>
                  <Text style={[styles.sexoLabel, active && styles.sexoTextActive]}>
                    {SEXO_LABEL[s].toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <FieldError message={erros.sexo} />
        </View>

        {/* Cartão 2 — Detalhes do pet */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconCircle, { backgroundColor: colors.cardMax }]}>
              <Ionicons name="list-outline" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Detalhes do pet</Text>
              <Text style={styles.cardSubtitle}>Mais informações para um cuidado melhor.</Text>
            </View>
          </View>

          <Input
            label="Raça"
            placeholder="Digite a raça (opcional)"
            value={raca}
            onChangeText={setRaca}
          />

          <Text style={styles.fieldLabel}>Porte</Text>
          <View style={styles.porteRow}>
            {PORTES.map((p) => {
              const active = porte === p;
              return (
                <Pressable
                  key={p}
                  style={[styles.porteChip, active && styles.porteChipActive]}
                  onPress={() => setPorte(active ? null : p)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.porteLabel, active && styles.porteLabelActive]}>
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <FieldError message={erros.porte} />

          <View style={styles.halfRow}>
            <View style={styles.halfField}>
              <Input
                label="Peso (kg)"
                placeholder="Ex.: 10,5"
                value={peso}
                onChangeText={handlePesoChange}
                keyboardType="decimal-pad"
                hasError={!!erros.peso}
              />
              <FieldError message={erros.peso} />
            </View>
            <View style={styles.halfField}>
              <Input
                label="Data de nascimento"
                placeholder="DD/MM/AAAA"
                value={dataNascimento}
                onChangeText={handleDataChange}
                keyboardType="number-pad"
                maxLength={10}
                hasError={!!erros.dataNascimento}
              />
              <FieldError message={erros.dataNascimento} />
            </View>
          </View>
        </View>

        {/* Cartão 3 — Saúde */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconCircle, { backgroundColor: '#FFE4E4' }]}>
              <Ionicons name="heart-outline" size={20} color="#EF4444" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Saúde</Text>
              <Text style={styles.cardSubtitle}>Essas informações ajudam a cuidar ainda melhor.</Text>
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Castrado</Text>
            <Switch
              value={castrado}
              onValueChange={setCastrado}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <Input
            label="Alergia"
            placeholder="Descreva se houver (opcional)"
            value={alergia}
            onChangeText={setAlergia}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Condição crônica</Text>
            <Switch
              value={condicaoCronica}
              onValueChange={setCondicaoCronica}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </View>

        {/* Aviso de campos obrigatórios */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <View style={styles.infoTextBlock}>
            <Text style={styles.infoStrong}>Campos com * são obrigatórios.</Text>
            <Text style={styles.infoMuted}>As validações são aplicadas no envio.</Text>
          </View>
        </View>

        {/* Rodapé — empilhado: ação principal no topo */}
        <View style={styles.footer}>
          <Button
            label={petId ? 'Salvar alterações' : 'Salvar pet'}
            loading={isSaving}
            onPress={salvar}
          />
          <Button label="Cancelar" variant="secondary" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  // Hero banner
  heroBanner: {
    width: '100%',
    height: 140,
    borderRadius: radii.lg,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  cardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Field label
  fieldLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: -spacing.sm,
  },

  // Espécie — chip quadrado, apenas ícone
  especieRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  especieChip: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xs,
  },
  especieChipActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}12`,
  },
  especieImg: {
    width: 52,
    height: 52,
  },

  // Sexo
  sexoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sexoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sexoButtonActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}12`,
  },
  sexoIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  sexoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  sexoTextActive: {
    color: colors.primary,
  },

  // Porte
  porteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  porteChip: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  porteChipActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}12`,
  },
  porteLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: colors.textSecondary,
  },
  porteLabelActive: {
    color: colors.primary,
  },

  // Half row (Peso + DataNascimento)
  halfRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },

  // Switch row
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  switchLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  // Info box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.cardChia,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  infoTextBlock: {
    flex: 1,
    gap: 2,
  },
  infoStrong: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  infoMuted: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Footer — empilhado (coluna), ação primária no topo
  footer: {
    flexDirection: 'column',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
