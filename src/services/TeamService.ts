import { BaseService } from './BaseService'
import { PlayerService } from './PlayerService'
import {
  TeamName,
  TeamStatistics,
  TeamMemberContribution,
  PlayerName
} from '../models/tournament.types'

export class TeamService extends BaseService {
  private playerService: PlayerService
  private teamCache: Map<TeamName, TeamStatistics> = new Map()

  constructor() {
    super()
    this.playerService = new PlayerService()
  }

  /**
   * Get all team names
   */
  getAllTeamNames(): TeamName[] {
    return ['Banana Boys', '3 Lefties make a Righty']
  }

  /**
   * Get team members
   */
  getTeamMembers(teamName: TeamName): PlayerName[] {
    if (teamName === 'Banana Boys') {
      return ['Mike', 'Ryan', 'Nixon', 'Doug']
    } else {
      return ['Jimbo', 'AJ', 'Todd', 'Dave']
    }
  }

  /**
   * Get comprehensive team statistics
   */
  getTeamStatistics(teamName: TeamName): TeamStatistics {
    // Check cache first
    if (this.teamCache.has(teamName)) {
      return this.teamCache.get(teamName)!
    }

    const members = this.getTeamMembers(teamName)
    const memberContributions = new Map<PlayerName, TeamMemberContribution>()
    
    let totalScore = 0
    let totalMatchPlayPoints = 0
    let totalPossibleMatchPlay = 0

    // Calculate member contributions
    members.forEach(memberName => {
      const playerStats = this.playerService.getPlayerStatistics(memberName)
      if (!playerStats) return

      const contribution: TeamMemberContribution = {
        playerName: memberName,
        totalScore: playerStats.basicStats.totalScore,
        averageScore: playerStats.basicStats.scoringAverage,
        matchPlayPoints: playerStats.matchPlayPerformance.totalPoints,
        bestRound: playerStats.basicStats.bestRound,
        contribution: 0 // Will calculate after totals
      }

      memberContributions.set(memberName, contribution)
      totalScore += playerStats.basicStats.totalScore
      totalMatchPlayPoints += playerStats.matchPlayPerformance.totalPoints
      totalPossibleMatchPlay += playerStats.matchPlayPerformance.possiblePoints
    })

    // Calculate contribution percentages
    memberContributions.forEach(contribution => {
      contribution.contribution = totalScore > 0 
        ? (contribution.totalScore / totalScore) * 100 
        : 0
    })

    // Get team points from tournament summary
    const teamPoints = this.getTeamPoints(teamName)

    // Calculate team-level stats
    const allBestRounds = Array.from(memberContributions.values()).map(m => m.bestRound)
    const allWorstRounds = Array.from(memberContributions.values()).map(m => {
      const playerStats = this.playerService.getPlayerStatistics(m.playerName)
      return playerStats?.basicStats.worstRound || 0
    })
    const teamConsistency = Array.from(memberContributions.values()).reduce((sum, member) => {
      const playerStats = this.playerService.getPlayerStatistics(member.playerName)
      return sum + (playerStats?.consistencyStats.standardDeviation || 0)
    }, 0) / members.length

    const stats: TeamStatistics = {
      name: teamName,
      members,
      totalScore,
      averageScore: members.length > 0 ? totalScore / members.length : 0,
      matchPlayPoints: totalMatchPlayPoints,
      matchPlayPercentage: totalPossibleMatchPlay > 0 
        ? (totalMatchPlayPoints / totalPossibleMatchPlay) * 100 
        : 0,
      teamPoints,
      memberContributions,
      bestRound: Math.min(...allBestRounds),
      worstRound: Math.max(...allWorstRounds),
      consistencyRating: teamConsistency
    }

    // Cache the result
    this.teamCache.set(teamName, stats)
    return stats
  }

  /**
   * Get all teams' statistics
   */
  getAllTeamStatistics(): TeamStatistics[] {
    return this.getAllTeamNames().map(name => this.getTeamStatistics(name))
  }

  /**
   * Get team vs team comparison
   */
  getTeamComparison(): {
    teams: TeamStatistics[]
    winner: TeamName
    scoreDifference: number
    matchPlayDifference: number
    closestMember: { team1: PlayerName, team2: PlayerName, difference: number }
  } {
    const teams = this.getAllTeamStatistics()
    const [team1, team2] = teams

    // Find closest member matchup
    let closestDifference = Infinity
    let closestMember = { team1: '', team2: '', difference: 0 }

    team1.members.forEach(member1 => {
      const stats1 = team1.memberContributions.get(member1)
      if (!stats1) return

      team2.members.forEach(member2 => {
        const stats2 = team2.memberContributions.get(member2)
        if (!stats2) return

        const difference = Math.abs(stats1.totalScore - stats2.totalScore)
        if (difference < closestDifference) {
          closestDifference = difference
          closestMember = {
            team1: member1,
            team2: member2,
            difference
          }
        }
      })
    })

    return {
      teams,
      winner: teams[0].teamPoints > teams[1].teamPoints ? teams[0].name : teams[1].name,
      scoreDifference: Math.abs(team1.totalScore - team2.totalScore),
      matchPlayDifference: Math.abs(team1.matchPlayPoints - team2.matchPlayPoints),
      closestMember
    }
  }

  /**
   * Get team performance by day
   */
  getTeamDailyPerformance(teamName: TeamName): {
    day: number
    totalScore: number
    averageScore: number
    format: string
  }[] {
    const members = this.getTeamMembers(teamName)
    const dailyPerformance: Map<number, { total: number, count: number, format: string }> = new Map()

    members.forEach(memberName => {
      const playerStats = this.playerService.getPlayerStatistics(memberName)
      if (!playerStats) return

      playerStats.dailyPerformances.forEach(daily => {
        const existing = dailyPerformance.get(daily.day) || { total: 0, count: 0, format: daily.format }
        existing.total += daily.score
        existing.count += 1
        dailyPerformance.set(daily.day, existing)
      })
    })

    return Array.from(dailyPerformance.entries()).map(([day, data]) => ({
      day,
      totalScore: data.total,
      averageScore: data.count > 0 ? data.total / data.count : 0,
      format: data.format
    })).sort((a, b) => a.day - b.day)
  }

  /**
   * Get best and worst performers for a team
   */
  getTeamExtremes(teamName: TeamName): {
    bestPerformer: { player: PlayerName, score: number }
    worstPerformer: { player: PlayerName, score: number }
    mostConsistent: { player: PlayerName, rating: number }
    matchPlayMVP: { player: PlayerName, points: number }
  } {
    const members = this.getTeamMembers(teamName)
    
    let bestPerformer = { player: '', score: Infinity }
    let worstPerformer = { player: '', score: 0 }
    let mostConsistent = { player: '', rating: 0 }
    let matchPlayMVP = { player: '', points: 0 }

    members.forEach(memberName => {
      const playerStats = this.playerService.getPlayerStatistics(memberName)
      if (!playerStats) return

      // Best overall score
      if (playerStats.basicStats.totalScore < bestPerformer.score) {
        bestPerformer = {
          player: memberName,
          score: playerStats.basicStats.totalScore
        }
      }

      // Worst overall score
      if (playerStats.basicStats.totalScore > worstPerformer.score) {
        worstPerformer = {
          player: memberName,
          score: playerStats.basicStats.totalScore
        }
      }

      // Most consistent
      if (playerStats.consistencyStats.consistencyRating > mostConsistent.rating) {
        mostConsistent = {
          player: memberName,
          rating: playerStats.consistencyStats.consistencyRating
        }
      }

      // Match play MVP
      if (playerStats.matchPlayPerformance.totalPoints > matchPlayMVP.points) {
        matchPlayMVP = {
          player: memberName,
          points: playerStats.matchPlayPerformance.totalPoints
        }
      }
    })

    return {
      bestPerformer,
      worstPerformer,
      mostConsistent,
      matchPlayMVP
    }
  }

  // Private helper methods
  private getTeamPoints(teamName: TeamName): number {
    const summary = this.data.tournament_summary
    if (teamName === 'Banana Boys') {
      return summary?.team_points?.['Banana Boys'] || 171.5
    } else {
      return summary?.team_points?.['3 Lefties make a Righty'] || 139.5
    }
  }
}