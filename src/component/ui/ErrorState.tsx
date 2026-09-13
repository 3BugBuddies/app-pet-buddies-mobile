import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { colors, spacing, typography } from '../../styles/theme';

type ErrorType = '404' | '500' | '400' | 'timeout' | 'generic';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

interface ErrorConfig {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  message: string;
}

const CONFIG: Record<ErrorType, ErrorConfig> = {
  '404': {
    icon: 'search-outline',
    iconBg: colors.cardChia,
    title: 'Caminho perdido',
    message: 'Parece que o que você procurava foi dar um passeio longo.',
  },
  '500': {
    icon: 'cloud-offline-outline',
    iconBg: colors.cardAlert,
    title: 'Tropeçamos na coleira',
    message: 'Nossos servidores demoraram a responder. Que tal tentar de novo?',
  },
  timeout: {
    icon: 'warning-outline',
    iconBg: colors.cardAlert,
    title: 'Tropeçamos na coleira',
    message: 'Nossos servidores demoraram a responder. Que tal tentar de novo?',
  },
  '400': {
    icon: 'alert-circle-outline',
    iconBg: colors.cardAlert,
    title: 'Ops, algo não encaixou',
    message: 'Alguma informação parece incorreta. Revise e tente novamente.',
  },
  generic: {
    icon: 'paw-outline',
    iconBg: colors.cardChia,
    title: 'Algo deu errado',
    message: 'Não conseguimos carregar essas informações agora.',
  },
};

export function ErrorState({
  type = 'generic',
  title,
  message,
  onRetry,
  retryLabel,
}: ErrorStateProps) {
  const config = CONFIG[type];

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: config.iconBg }]}>
        <Ionicons name={config.icon} size={40} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title ?? config.title}</Text>
      <Text style={styles.message}>{message ?? config.message}</Text>
      {onRetry ? (
        <View style={styles.buttonWrapper}>
          <Button label={retryLabel ?? 'Tentar novamente'} onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonWrapper: {
    marginTop: spacing.sm,
    width: '100%',
  },
});
