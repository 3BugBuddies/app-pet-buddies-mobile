import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckInTopBar } from '../../component/checkin/CheckInTopBar';
import { colors, radii, spacing, typography } from '../../styles/theme';
import { useTabBarSpace } from '../navigation/useTabBarSpace';

export function PataSeguraScreen() {
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.topBar}>
        <CheckInTopBar title="Pata Segura" />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]} showsVerticalScrollIndicator={false}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Em breve</Text>
        </View>
        <Text style={styles.body}>O Pata Segura é o programa de pontos da clínica.</Text>
        <Text style={styles.body}>Cada consulta efetivada vira ponto, e os pontos viram benefícios na clínica.</Text>
        <Text style={styles.body}>Ele chega na próxima versão do app.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.cardMax,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
