import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BadgeGrid } from '../../component/score/BadgeGrid';
import { PointsHeroCard } from '../../component/score/PointsHeroCard';
import { StatsGrid } from '../../component/score/StatsGrid';
import { LoadingIndicator } from '../../component/ui/LoadingIndicator';
import { useBadges, useScore } from '../../control/useScoreControl';
import type { HomeTabParamList } from '../navigation/types';
import { colors, spacing } from '../../styles/theme';

type Props = NativeStackScreenProps<HomeTabParamList, 'Score'>;

export function ScoreScreen({ route }: Props) {
  const { petId } = route.params;
  const { data: score, isLoading: isLoadingScore, isError: isScoreError } = useScore(petId);
  const { data: badges, isLoading: isLoadingBadges, isError: isBadgesError } = useBadges(petId);

  if (isLoadingScore || isLoadingBadges) {
    return <LoadingIndicator label="Carregando pontos e selos..." />;
  }

  if (isScoreError || isBadgesError || !score || !badges) {
    return <LoadingIndicator label="Não foi possível carregar o score." />;
  }

  const unlockedCount = badges.filter((badge) => badge.unlocked).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <PointsHeroCard
        totalPoints={score.totalPoints}
        pointsToday={score.pointsToday}
        tier={score.tier}
        nextTier={score.nextTier}
        pointsToNextTier={score.pointsToNextTier}
        progressPct={score.progressPct}
      />

      <StatsGrid
        stats={[
          { value: `${score.streakDays}`, label: 'dias seguidos', color: colors.success },
          { value: `${score.appointmentsCount}`, label: 'consultas', color: colors.primary },
          { value: `${score.homeAdherencePct}%`, label: 'em casa', color: colors.warning },
        ]}
      />

      <View style={styles.badgesHead}>
        <Text style={styles.badgesTitle}>Selos</Text>
        <Text style={styles.badgesCount}>
          {unlockedCount} de {badges.length}
        </Text>
      </View>
      <BadgeGrid badges={badges} />
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
  badgesHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  badgesTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  badgesCount: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
