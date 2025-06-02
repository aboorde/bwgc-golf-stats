import { BaseService } from './BaseService'
import { PlayerService } from './PlayerService'
import { TeamService } from './TeamService'
import { CourseService } from './CourseService'
import {
  TournamentSummary,
  TournamentStatistics,
  TournamentInsight,
  InsightCategory,
  PlayerName,
  TeamName,
  CourseName,
  Achievement
} from '../models/tournament.types'

export class TournamentService extends BaseService {
  private playerService: PlayerService
  private teamService: TeamService
  private courseService: CourseService
  private insightsCache: TournamentInsight[] | null = null

  constructor() {
    super()
    this.playerService = new PlayerService()
    this.teamService = new TeamService()
    this.courseService = new CourseService()
  }

  /**
   * Get tournament summary
   */
  getTournamentSummary(): TournamentSummary {
    const summary = this.data.tournament_summary || {}
    
    return {
      name: 'BWGC Myrtle Beach Golf Tournament',
      dates: 'November 2024',
      location: 'Myrtle Beach, SC',
      totalRounds: summary.total_rounds || 24,
      totalPlayers: summary.total_players || 8,
      teams: this.teamService.getAllTeamNames(),
      courses: this.courseService.getAllCourseNames(),
      formats: ['Scramble', 'Match Play', 'Best Ball', 'Stableford'],
      champion: summary.individual_winner || 'Mike',
      teamChampion: summary.team_winner || 'Banana Boys'
    }
  }

  /**
   * Get tournament statistics
   */
  getTournamentStatistics(): TournamentStatistics {
    const allPlayers = this.playerService.getAllPlayerStatistics()
    const funFacts = this.data.tournament_insights?.fun_facts || []
    
    // Find lowest and highest rounds
    let lowestRound = { player: '', score: Infinity, course: '' as CourseName }
    let highestRound = { player: '', score: 0, course: '' as CourseName }
    
    allPlayers.forEach(player => {
      player.dailyPerformances.forEach(perf => {
        if (perf.score < lowestRound.score) {
          lowestRound = {
            player: player.name,
            score: perf.score,
            course: perf.course
          }
        }
        if (perf.score > highestRound.score) {
          highestRound = {
            player: player.name,
            score: perf.score,
            course: perf.course
          }
        }
      })
    })

    // Most consistent player
    const mostConsistent = allPlayers
      .sort((a, b) => b.consistencyStats.consistencyRating - a.consistencyStats.consistencyRating)[0]

    // Most improved (biggest positive change from first to last round)
    let mostImprovedPlayer = ''
    let biggestImprovement = 0
    
    allPlayers.forEach(player => {
      const dailyScores = player.dailyPerformances.map(p => p.score)
      if (dailyScores.length >= 2) {
        const improvement = dailyScores[0] - dailyScores[dailyScores.length - 1]
        if (improvement > biggestImprovement) {
          biggestImprovement = improvement
          mostImprovedPlayer = player.name
        }
      }
    })

    // Match play champion
    const matchPlayChampion = allPlayers
      .sort((a, b) => b.matchPlayPerformance.totalPoints - a.matchPlayPerformance.totalPoints)[0]

    // Course champions
    const courseChampions = new Map<CourseName, PlayerName>()
    this.courseService.getAllCourseNames().forEach(courseName => {
      const leaderboard = this.courseService.getCourseLeaderboard(courseName, 1)
      if (leaderboard[0]) {
        courseChampions.set(courseName, leaderboard[0].player)
      }
    })

    return {
      lowestRound,
      highestRound,
      mostConsistent: mostConsistent.name,
      mostImproved: mostImprovedPlayer,
      matchPlayChampion: matchPlayChampion.name,
      courseChampions
    }
  }

  /**
   * Get tournament insights (fun facts)
   */
  getTournamentInsights(): TournamentInsight[] {
    // Return cached insights if available
    if (this.insightsCache) {
      return this.insightsCache
    }

    const insights: TournamentInsight[] = []
    const stats = this.getTournamentStatistics()
    const summary = this.getTournamentSummary()
    const allPlayers = this.playerService.getAllPlayerStatistics()
    const teams = this.teamService.getAllTeamStatistics()
    const leaderboard = this.playerService.getLeaderboard()

    // Champion insight - detailed
    const champion = allPlayers.find(p => p.name === summary.champion)
    if (champion && leaderboard.length > 1) {
      const margin = leaderboard[1].totalScore - leaderboard[0].totalScore
      insights.push({
        id: 'champion',
        category: 'achievement',
        title: 'Tournament Domination',
        description: `${summary.champion} won by ${margin} strokes with a ${champion.basicStats.scoringAverage.toFixed(1)} average!`,
        value: summary.champion,
        icon: '👑'
      })
    }

    // Most consistent - detailed
    const mostConsistent = allPlayers
      .sort((a, b) => b.consistencyStats.consistencyRating - a.consistencyStats.consistencyRating)[0]
    insights.push({
      id: 'most-consistent',
      category: 'consistency',
      title: 'Mr. Reliable',
      description: `${mostConsistent.name} was the most consistent player with only ${mostConsistent.consistencyStats.standardDeviation.toFixed(1)} strokes standard deviation!`,
      value: mostConsistent.name,
      icon: '🎯'
    })

    // Biggest comeback - detailed
    let biggestComeback = { player: '', improvement: 0 }
    allPlayers.forEach(player => {
      const dailyScores = player.dailyPerformances.map(p => p.score)
      if (dailyScores.length >= 2) {
        const improvement = dailyScores[0] - dailyScores[dailyScores.length - 1]
        if (improvement > biggestComeback.improvement) {
          biggestComeback = { player: player.name, improvement }
        }
      }
    })
    
    if (biggestComeback.improvement > 0) {
      insights.push({
        id: 'biggest-comeback',
        category: 'improvement',
        title: 'The Phoenix',
        description: `${biggestComeback.player} had the biggest comeback, improving ${biggestComeback.improvement} strokes from first to last round!`,
        value: biggestComeback.player,
        icon: '📈'
      })
    }

    // Course crusher - detailed
    let bestCoursePerformance = { player: '', course: '', score: Infinity }
    allPlayers.forEach(player => {
      player.coursePerformances.forEach((perf, courseName) => {
        if (perf.averageScore < bestCoursePerformance.score) {
          bestCoursePerformance = {
            player: player.name,
            course: courseName,
            score: perf.averageScore
          }
        }
      })
    })
    
    if (bestCoursePerformance.score < Infinity) {
      insights.push({
        id: 'course-crusher',
        category: 'course',
        title: 'Course Crusher',
        description: `${bestCoursePerformance.player} performed best at ${bestCoursePerformance.course} with an average score of ${bestCoursePerformance.score.toFixed(1)}!`,
        value: bestCoursePerformance.player,
        icon: '⛰️'
      })
    }

    // Match play dominator - detailed
    const matchPlayKing = allPlayers
      .sort((a, b) => b.matchPlayPerformance.totalPoints - a.matchPlayPerformance.totalPoints)[0]
    insights.push({
      id: 'match-play-champion',
      category: 'matchPlay',
      title: 'Head-to-Head Hero',
      description: `${matchPlayKing.name} dominated match play with ${matchPlayKing.matchPlayPerformance.totalPoints} points and a ${matchPlayKing.matchPlayPerformance.winPercentage.toFixed(1)}% win rate!`,
      value: matchPlayKing.name,
      icon: '⚔️'
    })

    // Lowest round - detailed
    insights.push({
      id: 'lowest-round',
      category: 'record',
      title: 'Round of the Tournament',
      description: `${stats.lowestRound.player} fired the tournament's lowest round with a ${stats.lowestRound.score} at ${stats.lowestRound.course}!`,
      value: stats.lowestRound.score,
      icon: '🔥'
    })

    // Team battle - detailed
    const teamComparison = this.teamService.getTeamComparison()
    const winningTeam = teams[0] // Teams are sorted by points
    insights.push({
      id: 'team-battle',
      category: 'team',
      title: 'Team Champions',
      description: `Team ${winningTeam.name} won the team battle by ${teamComparison.scoreDifference.toFixed(1)} strokes per player on average!`,
      value: winningTeam.name,
      icon: '👥'
    })

    // Competition spread - detailed
    const totalScores = leaderboard.map(p => p.totalScore)
    const spread = Math.max(...totalScores) - Math.min(...totalScores)
    insights.push({
      id: 'competition-spread',
      category: 'competition',
      title: 'Competitive Field',
      description: `The tournament had a ${spread}-stroke spread from first to last place, showing how competitive our group is!`,
      value: spread,
      icon: '📊'
    })

    // Par performance - detailed
    const totalPars = allPlayers.reduce((sum, p) => sum + p.scoringStats.pars, 0)
    const totalHoles = allPlayers.length * 54 // 3 rounds of 18 holes each
    const parPercentage = (totalPars / totalHoles * 100).toFixed(1)
    insights.push({
      id: 'par-performance',
      category: 'scoring',
      title: 'Par Performance',
      description: `The group made par on ${parPercentage}% of holes played, with ${totalPars} total pars across all rounds!`,
      value: totalPars,
      icon: '🎯'
    })

    // Tough day - detailed
    insights.push({
      id: 'tough-day',
      category: 'adversity',
      title: 'Weathered the Storm',
      description: `Everyone has tough days - the highest round was ${stats.highestRound.score} by ${stats.highestRound.player} at ${stats.highestRound.course}!`,
      value: stats.highestRound.score,
      icon: '⛈️'
    })

    // Course difficulty - detailed  
    const courseDifficulty = this.courseService.getCourseDifficultyAnalysis()
    insights.push({
      id: 'toughest-course',
      category: 'course',
      title: 'Ultimate Challenge',
      description: `${courseDifficulty.mostDifficult.course} proved most challenging with players averaging +${courseDifficulty.mostDifficult.averageOverPar.toFixed(1)} over par!`,
      value: courseDifficulty.mostDifficult.course,
      icon: '🏔️'
    })

    // Birdie leader - detailed
    const birdieKing = allPlayers
      .sort((a, b) => b.scoringStats.birdies - a.scoringStats.birdies)[0]
    if (birdieKing.scoringStats.birdies > 0) {
      insights.push({
        id: 'birdie-king',
        category: 'scoring',
        title: 'Birdie Machine',
        description: `${birdieKing.name} led the birdie count with ${birdieKing.scoringStats.birdies} birdies throughout the tournament!`,
        value: birdieKing.scoringStats.birdies,
        icon: '🦅'
      })
    }

    // Cache the insights
    this.insightsCache = insights
    return insights
  }

  /**
   * Get insights by category
   */
  getInsightsByCategory(category: InsightCategory): TournamentInsight[] {
    return this.getTournamentInsights().filter(insight => insight.category === category)
  }

  /**
   * Get all player achievements
   */
  getAllAchievements(): Achievement[] {
    const achievements: Achievement[] = []
    const players = this.playerService.getAllPlayerNames()

    players.forEach(player => {
      const playerAchievements = this.playerService.getPlayerAchievements(player)
      achievements.push(...playerAchievements)
    })

    return achievements
  }

  /**
   * Get tournament highlights for display
   */
  getTournamentHighlights(): {
    stat: string
    value: string | number
    description: string
    icon: string
  }[] {
    const summary = this.getTournamentSummary()
    const stats = this.getTournamentStatistics()
    const teams = this.teamService.getAllTeamStatistics()

    return [
      {
        stat: 'Individual Champion',
        value: summary.champion,
        description: 'Tournament winner',
        icon: '🏆'
      },
      {
        stat: 'Team Champions',
        value: summary.teamChampion,
        description: `${teams[0].teamPoints} points`,
        icon: '👥'
      },
      {
        stat: 'Lowest Round',
        value: stats.lowestRound.score,
        description: `${stats.lowestRound.player} at ${stats.lowestRound.course}`,
        icon: '🔥'
      },
      {
        stat: 'Match Play King',
        value: stats.matchPlayChampion,
        description: 'Head-to-head champion',
        icon: '⚔️'
      }
    ]
  }

  /**
   * Get performance trends across days
   */
  getPerformanceTrends(): {
    day: number
    averageScore: number
    bestScore: number
    worstScore: number
    format: string
  }[] {
    const trends: Map<number, {
      scores: number[]
      format: string
    }> = new Map()

    const players = this.playerService.getAllPlayerStatistics()
    
    players.forEach(player => {
      player.dailyPerformances.forEach(perf => {
        const existing = trends.get(perf.day) || { scores: [], format: perf.format }
        existing.scores.push(perf.score)
        trends.set(perf.day, existing)
      })
    })

    return Array.from(trends.entries()).map(([day, data]) => {
      const scores = data.scores
      return {
        day,
        averageScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
        bestScore: Math.min(...scores),
        worstScore: Math.max(...scores),
        format: data.format
      }
    }).sort((a, b) => a.day - b.day)
  }

  /**
   * Get quick tournament statistics for display
   */
  getQuickStats(): {
    stat: string
    value: number
    label: string
    color: string
  }[] {
    const summary = this.getTournamentSummary()
    const allPlayers = this.playerService.getAllPlayerStatistics()
    const leaderboard = this.playerService.getLeaderboard()

    // Total pars across all players
    const totalPars = allPlayers.reduce((sum, p) => sum + p.scoringStats.pars, 0)
    
    // Total match play points
    const totalMatchPlayPoints = allPlayers.reduce((sum, p) => sum + p.matchPlayPerformance.totalPoints, 0)
    
    // Score spread 
    const totalScores = leaderboard.map(p => p.totalScore)
    const scoreSpread = Math.max(...totalScores) - Math.min(...totalScores)

    return [
      {
        stat: 'totalRounds',
        value: summary.totalRounds,
        label: 'Total Rounds',
        color: 'text-blue-400'
      },
      {
        stat: 'totalPars', 
        value: totalPars,
        label: 'Total Pars',
        color: 'text-green-400'
      },
      {
        stat: 'matchPlayPoints',
        value: Number(totalMatchPlayPoints.toFixed(1)),
        label: 'Match Play Points',
        color: 'text-purple-400'
      },
      {
        stat: 'scoreSpread',
        value: scoreSpread,
        label: 'Score Spread',
        color: 'text-orange-400'
      }
    ]
  }
}