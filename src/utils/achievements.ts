import { data } from './data'

// Achievement types and interfaces
export interface Achievement {
  id: string
  title: string
  description: string
  player: string
  value: string | number
  emoji: string
  category: 'scoring' | 'consistency' | 'improvement' | 'performance'
  bgColor: string
  textColor: string
  borderColor: string
}

export interface ConsistencyRanking {
  rank: number
  player: string
  standardDeviation: number
  rating: string
  description: string
}

// Achievement categories with styling
const ACHIEVEMENT_STYLES = {
  scoring: { bgColor: 'bg-green-900/20', textColor: 'text-green-400', borderColor: 'border-green-800/30' },
  consistency: { bgColor: 'bg-blue-900/20', textColor: 'text-blue-400', borderColor: 'border-blue-800/30' },
  improvement: { bgColor: 'bg-purple-900/20', textColor: 'text-purple-400', borderColor: 'border-purple-800/30' },
  performance: { bgColor: 'bg-orange-900/20', textColor: 'text-orange-400', borderColor: 'border-orange-800/30' }
}

// Calculate all achievements from tournament data
export function calculateAchievements(): Achievement[] {
  const achievements: Achievement[] = []
  const tournamentData = data.tournament_summary
  const playerStats = data.player_statistics
  const insights = data.tournament_insights

  // Tournament Winner
  achievements.push({
    id: 'tournament_winner',
    title: 'Tournament Champion',
    description: `${tournamentData.winning_score} total strokes`,
    player: tournamentData.winner,
    value: tournamentData.winning_score,
    emoji: '🏆',
    category: 'scoring',
    ...ACHIEVEMENT_STYLES.scoring
  })

  // Lowest Single Round
  achievements.push({
    id: 'lowest_round',
    title: 'Lowest Single Round',
    description: `${insights.lowest_single_round.score} at ${insights.lowest_single_round.course}`,
    player: insights.lowest_single_round.player,
    value: insights.lowest_single_round.score,
    emoji: '🎯',
    category: 'scoring',
    ...ACHIEVEMENT_STYLES.scoring
  })

  // Most Consistent Player
  achievements.push({
    id: 'most_consistent',
    title: 'Most Consistent Player',
    description: `σ=${insights.most_consistent_player.standard_deviation.toFixed(1)}`,
    player: insights.most_consistent_player.player,
    value: `${insights.most_consistent_player.standard_deviation.toFixed(1)}σ`,
    emoji: '📊',
    category: 'consistency',
    ...ACHIEVEMENT_STYLES.consistency
  })

  // Match Play Champion
  achievements.push({
    id: 'match_play_champion',
    title: 'Match Play Dominator',
    description: `${insights.match_play_dominator.points} points earned`,
    player: insights.match_play_dominator.player,
    value: `${insights.match_play_dominator.points} pts`,
    emoji: '⚔️',
    category: 'performance',
    ...ACHIEVEMENT_STYLES.performance
  })

  // Birdie Machine (player with most birdies)
  if (insights.birdie_machine) {
    achievements.push({
      id: 'birdie_machine',
      title: 'Birdie Machine',
      description: `${insights.birdie_machine.birdies} birdies total`,
      player: insights.birdie_machine.player,
      value: insights.birdie_machine.birdies,
      emoji: '🦅',
      category: 'scoring',
      ...ACHIEVEMENT_STYLES.scoring
    })
  }

  // Steady Eddie (most pars)
  if (insights.steady_eddie) {
    achievements.push({
      id: 'steady_eddie',
      title: 'Steady Eddie',
      description: `${insights.steady_eddie.pars} pars made`,
      player: insights.steady_eddie.player,
      value: insights.steady_eddie.pars,
      emoji: '🎳',
      category: 'consistency',
      ...ACHIEVEMENT_STYLES.consistency
    })
  }

  // Most Improved Player (biggest score improvement from first to last round)
  const improvementData = Object.entries(data.performance_trends).map(([player, trends]) => ({
    player,
    improvement: trends.score_change,
    direction: trends.trend_direction
  })).filter(p => p.improvement < 0) // Only improvements (negative change is better)
  
  if (improvementData.length > 0) {
    const mostImproved = improvementData.reduce((best, current) => 
      current.improvement < best.improvement ? current : best
    )
    
    achievements.push({
      id: 'most_improved',
      title: 'Most Improved',
      description: `${Math.abs(mostImproved.improvement)} stroke improvement`,
      player: mostImproved.player,
      value: `${Math.abs(mostImproved.improvement)} strokes`,
      emoji: '📈',
      category: 'improvement',
      ...ACHIEVEMENT_STYLES.improvement
    })
  }

  return achievements
}

// Calculate consistency rankings
export function calculateConsistencyRankings(): ConsistencyRanking[] {
  const playerStats = data.player_statistics
  
  const rankings = Object.entries(playerStats).map(([player, stats]) => ({
    player,
    standardDeviation: stats.consistency.score_standard_deviation,
    rating: stats.consistency.consistency_rating
  }))
  .sort((a, b) => a.standardDeviation - b.standardDeviation) // Lower std dev = more consistent
  .map((item, index) => ({
    rank: index + 1,
    player: item.player,
    standardDeviation: item.standardDeviation,
    rating: item.rating,
    description: `${item.standardDeviation.toFixed(1)}σ standard deviation`
  }))

  return rankings
}

// Get top N achievements by category
export function getTopAchievements(category?: Achievement['category'], limit: number = 6): Achievement[] {
  const achievements = calculateAchievements()
  
  if (category) {
    return achievements.filter(a => a.category === category).slice(0, limit)
  }
  
  return achievements.slice(0, limit)
}

// Get specific achievement by player
export function getPlayerAchievements(playerName: string): Achievement[] {
  const achievements = calculateAchievements()
  return achievements.filter(a => a.player === playerName)
}

// Course difficulty rankings
export function getCourseDifficultyRankings() {
  return data.course_analysis.difficulty_ranking.map((course, index) => ({
    rank: index + 1,
    course: course.course,
    avgOverPar: course.avg_over_par,
    difficulty: data.course_analysis.course_stats[course.course].difficulty_rating
  }))
}

// Fun facts from tournament data
export function getTournamentFunFacts(): string[] {
  return data.tournament_insights.fun_facts || []
}

// Best performer by category
export function getBestPerformerByCategory() {
  const achievements = calculateAchievements()
  const categories = ['scoring', 'consistency', 'improvement', 'performance'] as const
  
  return categories.reduce((result, category) => {
    const categoryAchievements = achievements.filter(a => a.category === category)
    if (categoryAchievements.length > 0) {
      result[category] = categoryAchievements[0] // First achievement in category
    }
    return result
  }, {} as Record<string, Achievement>)
}