import { BaseService } from './BaseService'
import {
  PlayerName,
  PlayerStatistics,
  PlayerBasicStats,
  PlayerConsistencyStats,
  PlayerScoringStats,
  MatchPlayPerformance,
  PlayerDailyPerformance,
  PlayerCoursePerformance,
  LeaderboardEntry,
  Achievement,
  AchievementCategory,
  SortConfig,
  CourseName
} from '../models/tournament.types'

export class PlayerService extends BaseService {
  private playerCache: Map<PlayerName, PlayerStatistics> = new Map()

  /**
   * Get all player names
   */
  getAllPlayerNames(): PlayerName[] {
    if (!this.data.player_statistics) return []
    return Object.keys(this.data.player_statistics)
  }

  /**
   * Get comprehensive statistics for a specific player
   */
  getPlayerStatistics(playerName: PlayerName): PlayerStatistics | null {
    // Check cache first
    if (this.playerCache.has(playerName)) {
      return this.playerCache.get(playerName)!
    }

    const rawStats = this.data.player_statistics[playerName]
    if (!rawStats) return null

    const stats: PlayerStatistics = {
      name: playerName,
      team: this.getPlayerTeam(playerName),
      position: this.getPlayerPosition(playerName),
      basicStats: this.getBasicStats(playerName),
      consistencyStats: this.getConsistencyStats(playerName),
      scoringStats: this.getScoringStats(playerName),
      matchPlayPerformance: this.getMatchPlayPerformance(playerName),
      dailyPerformances: this.getDailyPerformances(playerName),
      coursePerformances: this.getCoursePerformances(playerName)
    }

    // Cache the result
    this.playerCache.set(playerName, stats)
    return stats
  }

  /**
   * Get all players' statistics
   */
  getAllPlayerStatistics(): PlayerStatistics[] {
    return this.getAllPlayerNames()
      .map(name => this.getPlayerStatistics(name))
      .filter((stats): stats is PlayerStatistics => stats !== null)
  }

  /**
   * Get leaderboard data with optional sorting
   */
  getLeaderboard(sortConfig?: SortConfig<LeaderboardEntry>): LeaderboardEntry[] {
    const players = this.getAllPlayerStatistics()
    
    const leaderboard: LeaderboardEntry[] = players.map((player, index) => ({
      position: index + 1, // Will be recalculated after sorting
      player: player.name,
      team: player.team,
      totalScore: player.basicStats.totalScore,
      average: player.basicStats.scoringAverage,
      bestRound: player.basicStats.bestRound,
      worstRound: player.basicStats.worstRound,
      consistency: player.consistencyStats.consistencyRating,
      matchPlayPoints: player.matchPlayPerformance.totalPoints,
      matchPlayPercentage: player.matchPlayPerformance.winPercentage,
      trend: this.calculateTrend(player)
    }))

    // Apply sorting
    if (sortConfig) {
      leaderboard.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }
        
        return 0
      })
    } else {
      // Default sort by total score (ascending)
      leaderboard.sort((a, b) => a.totalScore - b.totalScore)
    }

    // Update positions after sorting
    leaderboard.forEach((entry, index) => {
      entry.position = index + 1
    })

    return leaderboard
  }

  /**
   * Get player achievements
   */
  getPlayerAchievements(playerName: PlayerName): Achievement[] {
    const achievements: Achievement[] = []
    const stats = this.getPlayerStatistics(playerName)
    if (!stats) return achievements

    // Tournament winner
    if (this.isTournamentWinner(playerName)) {
      achievements.push({
        id: 'tournament-winner',
        playerName,
        title: 'Tournament Champion',
        description: 'Won the overall tournament',
        category: 'special',
        icon: '🏆',
        rarity: 'legendary'
      })
    }

    // Match play champion
    if (this.isMatchPlayChampion(playerName)) {
      achievements.push({
        id: 'match-play-champion',
        playerName,
        title: 'Match Play Master',
        description: 'Won the match play competition',
        category: 'matchPlay',
        icon: '⚔️',
        rarity: 'epic'
      })
    }

    // Most consistent
    if (this.isMostConsistent(playerName)) {
      achievements.push({
        id: 'most-consistent',
        playerName,
        title: 'Mr. Consistency',
        description: 'Most consistent player across all rounds',
        category: 'consistency',
        icon: '🎯',
        rarity: 'epic'
      })
    }

    // Low round
    if (this.hasLowestRound(playerName)) {
      achievements.push({
        id: 'lowest-round',
        playerName,
        title: 'Course Record',
        description: 'Shot the lowest round of the tournament',
        category: 'scoring',
        icon: '🔥',
        rarity: 'epic'
      })
    }

    // Course excellence
    const coursesExcelled = this.getCoursesExcelled(playerName)
    if (coursesExcelled.length > 0) {
      achievements.push({
        id: 'course-excellence',
        playerName,
        title: 'Course Crusher',
        description: `Excelled at ${coursesExcelled.join(', ')}`,
        category: 'course',
        icon: '⛳',
        rarity: coursesExcelled.length > 1 ? 'epic' : 'rare'
      })
    }

    return achievements
  }

  // Private helper methods
  private getPlayerTeam(playerName: PlayerName): string {
    // Team assignments from CLAUDE.md
    const bananaboys = ['Mike', 'Ryan', 'Nixon', 'Doug']
    return bananaboys.includes(playerName) ? 'Banana Boys' : '3 Lefties make a Righty'
  }

  private getPlayerPosition(playerName: PlayerName): number {
    // Get position directly from tournament summary to avoid circular dependency
    const tournamentSummary = this.data.tournament_summary
    const leaderboard = tournamentSummary?.leaderboard || []
    const index = leaderboard.findIndex((entry: any) => entry.player === playerName)
    return index >= 0 ? index + 1 : 999
  }

  private getBasicStats(playerName: PlayerName): PlayerBasicStats {
    const rawStats = this.data.player_statistics[playerName]
    return {
      totalScore: rawStats?.basic_stats?.total_score || 0,
      scoringAverage: rawStats?.basic_stats?.scoring_average || 0,
      bestRound: rawStats?.basic_stats?.best_round || 0,
      worstRound: rawStats?.basic_stats?.worst_round || 0,
      roundsPlayed: rawStats?.basic_stats?.rounds_played || 0
    }
  }

  private getConsistencyStats(playerName: PlayerName): PlayerConsistencyStats {
    const rawStats = this.data.player_statistics[playerName]
    const consistency = rawStats?.consistency
    const standardDeviation = consistency?.score_standard_deviation || 0
    
    // Calculate consistency rating based on actual standard deviation
    // Lower standard deviation = more consistent = higher rating
    // Golf scoring: 0-3 = Excellent, 3-6 = Very Good, 6-9 = Good, 9-12 = Fair, 12+ = Poor
    let consistencyRating = 0
    if (standardDeviation <= 3) {
      consistencyRating = Math.round((100 - (standardDeviation * 5)) * 10) / 10  // 85-100
    } else if (standardDeviation <= 6) {
      consistencyRating = Math.round((85 - ((standardDeviation - 3) * 5)) * 10) / 10  // 70-85
    } else if (standardDeviation <= 9) {
      consistencyRating = Math.round((70 - ((standardDeviation - 6) * 5)) * 10) / 10  // 55-70
    } else if (standardDeviation <= 12) {
      consistencyRating = Math.round((55 - ((standardDeviation - 9) * 5)) * 10) / 10  // 40-55
    } else {
      consistencyRating = Math.max(10, Math.round((40 - ((standardDeviation - 12) * 2)) * 10) / 10)  // 10-40
    }
    
    return {
      standardDeviation,
      consistencyRating,
      scoreSpread: (rawStats?.basic_stats?.worst_round || 0) - (rawStats?.basic_stats?.best_round || 0)
    }
  }

  private getScoringStats(playerName: PlayerName): PlayerScoringStats {
    const rawStats = this.data.player_statistics[playerName]
    return {
      birdies: rawStats?.scoring_details?.birdies || 0,
      pars: rawStats?.scoring_details?.pars || 0,
      bogeys: rawStats?.scoring_details?.bogeys || 0,
      doubleBogeys: rawStats?.scoring_details?.double_bogeys || 0,
      tripleBogeys: rawStats?.scoring_details?.triple_bogeys || 0,
      bigNumbers: rawStats?.scoring_details?.big_numbers || 0,
      underParPercentage: rawStats?.scoring_details?.under_par_percentage || 0,
      parOrBetterPercentage: rawStats?.scoring_details?.par_or_better_percentage || 0
    }
  }

  private getMatchPlayPerformance(playerName: PlayerName): MatchPlayPerformance {
    const rawStats = this.data.player_statistics[playerName]
    const matchPlayData = rawStats?.match_play_performance || {}
    
    // TODO: Build actual match-up map from matrix data
    const matchUps = new Map<PlayerName, number>()
    
    return {
      totalPoints: matchPlayData.total_points || 0,
      possiblePoints: matchPlayData.possible_points || 18,
      winPercentage: matchPlayData.win_percentage || 0,
      matchUps
    }
  }

  private getDailyPerformances(playerName: PlayerName): PlayerDailyPerformance[] {
    const rawStats = this.data.player_statistics[playerName]
    const dailyPerf = rawStats?.daily_performance || {}
    const performances: PlayerDailyPerformance[] = []

    // Extract daily performances
    if (dailyPerf.day_2) {
      performances.push({
        day: 2,
        course: dailyPerf.day_2.course,
        score: dailyPerf.day_2.score,
        toPar: dailyPerf.day_2.to_par,
        format: 'Match Play'
      })
    }
    if (dailyPerf.day_3) {
      performances.push({
        day: 3,
        course: dailyPerf.day_3.course,
        score: dailyPerf.day_3.score,
        toPar: dailyPerf.day_3.to_par,
        format: 'Best Ball'
      })
    }
    if (dailyPerf.day_4) {
      performances.push({
        day: 4,
        course: dailyPerf.day_4.course,
        score: dailyPerf.day_4.score,
        toPar: dailyPerf.day_4.to_par,
        format: 'Stableford'
      })
    }

    return performances
  }

  private getCoursePerformances(playerName: PlayerName): Map<CourseName, PlayerCoursePerformance> {
    const rawStats = this.data.player_statistics[playerName]
    const coursePerf = rawStats?.course_performance || {}
    const performances = new Map<CourseName, PlayerCoursePerformance>()

    Object.entries(coursePerf).forEach(([courseName, perf]: [string, any]) => {
      const performanceRating = this.calculatePerformanceRating(playerName, courseName, perf.average_score || 0)
      
      performances.set(courseName, {
        averageScore: perf.average_score || 0,
        bestRound: perf.best_round || 0,
        worstRound: perf.worst_round,
        performanceRating,
        relativeTopar: perf.average_relative_to_par || 0
      })
    })

    return performances
  }

  /**
   * Calculate performance rating based on player's score relative to course average and other players
   */
  private calculatePerformanceRating(playerName: PlayerName, courseName: CourseName, playerScore: number): 'Excelled' | 'Solid' | 'Struggled' | 'N/A' {
    if (playerScore === 0) return 'N/A'
    
    // Get course stats
    const courseStats = this.data.course_analysis?.course_stats?.[courseName]
    if (!courseStats) return 'N/A'
    
    const courseAverage = courseStats.average_score
    const courseBest = courseStats.best_score
    const courseWorst = courseStats.worst_score
    
    // Calculate percentile within the course results
    const range = courseWorst - courseBest
    const playerFromBest = playerScore - courseBest
    const percentile = 1 - (playerFromBest / range) // 1 = best, 0 = worst
    
    // Also consider performance vs course average
    const vsAverage = playerScore - courseAverage
    
    // Rating logic:
    // Excelled: Top 25% of players AND significantly better than average
    // Solid: Better than average OR in top 50%
    // Struggled: Below average AND in bottom 50%
    
    if (percentile >= 0.75 && vsAverage <= -2) {
      return 'Excelled'
    } else if (percentile >= 0.5 || vsAverage <= 0) {
      return 'Solid'  
    } else {
      return 'Struggled'
    }
  }

  private calculateTrend(player: PlayerStatistics): 'up' | 'down' | 'steady' {
    const dailyScores = player.dailyPerformances.map(p => p.score)
    if (dailyScores.length < 2) return 'steady'
    
    const lastScore = dailyScores[dailyScores.length - 1]
    const previousScore = dailyScores[dailyScores.length - 2]
    
    if (lastScore < previousScore) return 'up'
    if (lastScore > previousScore) return 'down'
    return 'steady'
  }

  private isTournamentWinner(playerName: PlayerName): boolean {
    const summary = this.data.tournament_summary
    return summary?.individual_winner === playerName
  }

  private isMatchPlayChampion(playerName: PlayerName): boolean {
    const players = this.getAllPlayerStatistics()
    const sortedByMatchPlay = players.sort((a, b) => 
      b.matchPlayPerformance.totalPoints - a.matchPlayPerformance.totalPoints
    )
    return sortedByMatchPlay[0]?.name === playerName
  }

  private isMostConsistent(playerName: PlayerName): boolean {
    const players = this.getAllPlayerStatistics()
    const sortedByConsistency = players.sort((a, b) => 
      b.consistencyStats.consistencyRating - a.consistencyStats.consistencyRating
    )
    return sortedByConsistency[0]?.name === playerName
  }

  private hasLowestRound(playerName: PlayerName): boolean {
    const insights = this.data.tournament_insights?.fun_facts || []
    const lowestRoundFact = insights.find((f: any) => f.category === 'record' && f.fact.includes('lowest'))
    return lowestRoundFact?.fact.includes(playerName)
  }

  private getCoursesExcelled(playerName: PlayerName): CourseName[] {
    const stats = this.getPlayerStatistics(playerName)
    if (!stats) return []
    
    const excelled: CourseName[] = []
    stats.coursePerformances.forEach((perf, courseName) => {
      if (perf.performanceRating === 'Excelled') {
        excelled.push(courseName)
      }
    })
    
    return excelled
  }
}