import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../../styles/theme';

export type ClosingIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface AccordionRowProps {
  icon: ClosingIconName;
  title: string;
  summary: string;
  done: boolean;
  open?: boolean;
  forward?: boolean;
  onPress: () => void;
  children?: ReactNode;
}

export function AccordionRow({ icon, title, summary, done, open, forward, onPress, children }: AccordionRowProps) {
  const chevron = forward ? 'chevron-forward' : open ? 'chevron-up' : 'chevron-down';
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: !!open }}
        onPress={onPress}
        style={styles.head}
      >
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.summary}>{summary}</Text>
        </View>
        {done && !open ? (
          <View style={styles.check}>
            <Ionicons name="checkmark" size={16} color={colors.primary} />
          </View>
        ) : null}
        <Ionicons name={chevron} size={20} color={colors.primary} />
      </Pressable>
      {open && children ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    shadowColor: colors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.cardChia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  summary: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  check: {
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { marginTop: spacing.md },
});
