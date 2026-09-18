import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useContext, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { Button } from '../../component/ui/Button';
import { AuthContext } from '../../context/authContext';
import { useAssinarPrescricaoControl } from '../../control/usePrescriptionControl';
import { usePet } from '../../control/usePetsControl';
import type { PacientesTabParamList } from '../navigation/types';
import type { VetTabParamList } from '../navigation/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<PacientesTabParamList, 'AssinarPrescricao'>;
type AssinarNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<PacientesTabParamList, 'AssinarPrescricao'>,
  BottomTabNavigationProp<VetTabParamList>
>;

export function AssinarPrescricaoScreen({ route }: Props) {
  const { draft, consultaId, prontuario } = route.params;
  const navigation = useNavigation<AssinarNavigationProp>();
  const insets = useSafeAreaInsets();
  const { session } = useContext(AuthContext);
  const { data: pet } = usePet(draft.animalId);
  const { assinar, isAssinando, erro } = useAssinarPrescricaoControl(draft, prontuario, consultaId);

  const [isSigned, setIsSigned] = useState(false);

  const handleSign = async () => {
    try {
      await assinar();
      setIsSigned(true);
    } catch {
      // erro já fica visível via `erro` (estado da mutation).
    }
  };

  const handleSharePDF = async () => {
    try {
      await Share.share({
        message: `Receita Pet Buddies 🐾\nPaciente: ${pet?.nome ?? 'o paciente'}\n\nPrescrição Autenticada ICP-Brasil:\n${draft.medicamento} ${draft.frequenciaDia}x ao dia por ${draft.duracaoDias} dias\n\nAcesse o documento original com certificado digital no link seguro!`,
        title: `Receita Digital - ${pet?.nome}`,
      });
    } catch (error: any) {
      // Ignorar erros de cancelamento do usuário
    }
  };

  const handleFinish = () => {
    navigation.navigate('HojeTab', { screen: 'AgendaClinica' });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 80 }]}>
      <CheckInTopBar title="Assinar prescrição" subtitle={pet?.nome} />

      <View style={styles.headline}>
        <Text style={styles.title}>
          {draft.medicamento} · {draft.doseMin}–{draft.doseMax} {draft.unidade}
        </Text>
        <Text style={styles.subtitle}>
          {draft.frequenciaDia}×/dia · {draft.duracaoDias} dias · {draft.regras.length} regra(s) condicional(is)
        </Text>
      </View>

      {draft.orientacao ? (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Orientação</Text>
          <Text style={styles.orientacaoText}>{draft.orientacao}</Text>
        </View>
      ) : null}

      {draft.regras.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Regras condicionais</Text>
          {draft.regras.map((regra, index) => (
            <View key={`${regra.condicaoClinicaId}-${index}`}>
              <View style={styles.ruleRow}>
                <View style={styles.ruleDot} />
                <Text style={styles.ruleText}>
                  {regra.rotuloCongelado.toLowerCase()} → {regra.acao.replace(/_/g, ' ').toLowerCase()}
                </Text>
              </View>
              {index < draft.regras.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.footNote}>
        <View style={styles.footNoteDot} />
        <Text style={styles.footNoteText}>
          Relato sem regra correspondente cai em <Text style={styles.bold}>«confirmar com a clínica»</Text>, nunca em dose.
        </Text>
      </View>

      <View style={styles.signatureSection}>
        {!isSigned ? (
          // ESTADO 1: Antes de Assinar
          <View style={styles.preSignContainer}>
            <View style={styles.certificateStatus}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.certificateText}>Certificado A1 Conectado</Text>
            </View>
            
            <Text style={styles.disclaimer}>
              Ao assinar, este documento terá validade jurídica em todo o território nacional (ICP-Brasil), conforme resolução do CFMV.
            </Text>

            <Button 
              label="Assinar Receita Digitalmente" 
              loading={isAssinando} 
              onPress={handleSign}
              icon={<Ionicons name="document-lock-outline" size={20} color={colors.textLight} style={{ marginRight: 8 }} />}
              style={{ width: '100%' }}
            />
          </View>
        ) : (
          // ESTADO 2: Após a Assinatura (Sucesso)
          <View style={styles.postSignContainer}>
            <View style={styles.successAlert}>
              <Ionicons name="shield-checkmark-outline" size={36} color="#059669" />
              <Text style={styles.successText}>Receita assinada com sucesso!</Text>
              <Text style={styles.subSuccessText}>(Autenticada via ICP-Brasil)</Text>
            </View>

            {/* Thumbnail PDF Fake */}
            <View style={styles.pdfThumbnail}>
              <Ionicons name="document-text-outline" size={40} color={colors.textSecondary} />
              <View style={styles.pdfSeal}>
                <Ionicons name="ribbon" size={16} color="#059669" />
              </View>
            </View>

            <Button 
              label="Compartilhar com Tutor (WhatsApp)" 
              onPress={handleSharePDF}
              icon={<Ionicons name="logo-whatsapp" size={20} color={colors.textLight} style={{ marginRight: 8 }} />}
              style={{ width: '100%', backgroundColor: '#25D366', borderColor: '#25D366', marginBottom: spacing.md }}
            />

            <Button 
              label="Concluir e Salvar no Prontuário" 
              variant="secondary"
              onPress={handleFinish}
              icon={<Ionicons name="save-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />}
              style={{ width: '100%' }}
            />
          </View>
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
  headline: {
    gap: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  orientacaoText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 40,
  },
  ruleDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  ruleText: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  footNote: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  footNoteDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.warning,
    marginTop: 6,
  },
  footNoteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  bold: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  signCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  signRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  signAvatar: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.cardChia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signAvatarText: {
    fontWeight: '700',
    color: colors.primary,
  },
  signInfo: {
    flex: 1,
  },
  signName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  signBody: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  signatureSection: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  preSignContainer: {
    alignItems: 'center',
  },
  certificateStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    marginBottom: spacing.md,
  },
  certificateText: {
    color: '#065F46',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 13,
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  postSignContainer: {
    alignItems: 'center',
  },
  successAlert: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 12,
  },
  subSuccessText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  pdfThumbnail: {
    width: 80,
    height: 100,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  pdfSeal: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#D1FAE5',
    padding: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFF',
  },
});
