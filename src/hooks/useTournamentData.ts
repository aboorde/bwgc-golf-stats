import { useMemo } from 'react'
import { services } from '../services/ServiceContainer'
import {
  PlayerStatistics,
  TeamStatistics,
  CourseStatistics,
  TournamentSummary,
  TournamentInsight,
  LeaderboardEntry,
  PlayerName,
  TeamName,
  CourseName,
  SortConfig,
  Achievement,
  InsightCategory
} from '../models/tournament.types'

/**
 * Hook for tournament overview data
 */
export const useTournamentSummary = () => {
  return useMemo(() => ({
    summary: services.tournament.getTournamentSummary(),
    statistics: services.tournament.getTournamentStatistics(),
    highlights: services.tournament.getTournamentHighlights(),
    trends: services.tournament.getPerformanceTrends(),
    quickStats: services.tournament.getQuickStats()
  }), [])
}

/**
 * Hook for tournament insights and fun facts
 */
export const useTournamentInsights = (category?: InsightCategory) => {
  return useMemo(() => {
    if (category) {
      return services.tournament.getInsightsByCategory(category)
    }
    return services.tournament.getTournamentInsights()
  }, [category])
}

/**
 * Hook for player data
 */
export const usePlayerData = (playerName?: PlayerName) => {
  return useMemo(() => {
    if (playerName) {
      return {
        player: services.players.getPlayerStatistics(playerName),
        achievements: services.players.getPlayerAchievements(playerName)
      }
    }
    
    return {
      allPlayers: services.players.getAllPlayerStatistics(),
      playerNames: services.players.getAllPlayerNames()
    }
  }, [playerName])
}

/**
 * Hook for leaderboard data with sorting
 */
export const useLeaderboard = (sortConfig?: SortConfig<LeaderboardEntry>) => {
  return useMemo(() => {
    return services.players.getLeaderboard(sortConfig)
  }, [sortConfig])
}

/**
 * Hook for team data
 */
export const useTeamData = (teamName?: TeamName) => {
  return useMemo(() => {
    if (teamName) {
      return {
        team: services.teams.getTeamStatistics(teamName),
        extremes: services.teams.getTeamExtremes(teamName),
        dailyPerformance: services.teams.getTeamDailyPerformance(teamName)
      }
    }
    
    return {
      allTeams: services.teams.getAllTeamStatistics(),
      comparison: services.teams.getTeamComparison(),
      teamNames: services.teams.getAllTeamNames()
    }
  }, [teamName])
}

/**
 * Hook for course data
 */
export const useCourseData = (courseName?: CourseName) => {
  return useMemo(() => {
    if (courseName) {
      return {
        course: services.courses.getCourseStatistics(courseName),
        info: services.courses.getCourseInfo(courseName),
        leaderboard: services.courses.getCourseLeaderboard(courseName),
        playerPerformances: services.courses.getCoursePlayerPerformances(courseName),
        holeAnalysis: services.courses.getSimulatedHoleAnalysis(courseName)
      }
    }
    
    return {
      allCourses: services.courses.getAllCourseStatistics(),
      courseNames: services.courses.getAllCourseNames(),
      difficultyAnalysis: services.courses.getCourseDifficultyAnalysis(),
      records: services.courses.getCourseRecords()
    }
  }, [courseName])
}

/**
 * Hook for match play data
 */
export const useMatchPlayData = () => {
  return useMemo(() => {
    const allPlayers = services.players.getAllPlayerStatistics()
    const teams = services.teams.getAllTeamStatistics()
    
    // Calculate match play specific data
    const matchPlayLeaderboard = allPlayers
      .map(player => ({
        player: player.name,
        points: player.matchPlayPerformance.totalPoints,
        possiblePoints: player.matchPlayPerformance.possiblePoints,
        winPercentage: player.matchPlayPerformance.winPercentage
      }))
      .sort((a, b) => b.points - a.points)
    
    const teamMatchPlay = teams.map(team => ({
      ...team,
      matchPlayTotal: team.members.reduce((sum, member) => {
        const playerStats = services.players.getPlayerStatistics(member)
        return sum + (playerStats?.matchPlayPerformance.totalPoints || 0)
      }, 0)
    }))
    
    return {
      individualLeaderboard: matchPlayLeaderboard,
      teamComparison: teamMatchPlay,
      champion: matchPlayLeaderboard[0],
      totalPointsEarned: matchPlayLeaderboard.reduce((sum, p) => sum + p.points, 0),
      totalPossiblePoints: matchPlayLeaderboard.reduce((sum, p) => sum + p.possiblePoints, 0)
    }
  }, [])
}

/**
 * Hook for achievements data
 */
export const useAchievements = (playerName?: PlayerName) => {
  return useMemo(() => {
    if (playerName) {
      return services.players.getPlayerAchievements(playerName)
    }
    return services.tournament.getAllAchievements()
  }, [playerName])
}

/**
 * Hook for chart data
 */
export const useChartData = () => {
  return useMemo(() => ({
    courseDifficulty: services.courses.getCourseChartData('difficulty'),
    courseAverages: services.courses.getCourseChartData('average'),
    courseSpread: services.courses.getCourseChartData('spread')
  }), [])
}

/**
 * Hook for color and style utilities
 */
export const useStyleUtils = () => {
  return useMemo(() => ({
    getPositionIcon: (position: number) => {
      if (position === 1) return '🥇'
      if (position === 2) return '🥈'
      if (position === 3) return '🥉'
      return `#${position}`
    },
    
    getPerformanceColor: (percentage: number) => {
      if (percentage >= 70) return 'text-green-400'
      if (percentage >= 50) return 'text-blue-400'
      if (percentage >= 30) return 'text-yellow-400'
      return 'text-red-400'
    },
    
    getDifficultyColor: (rank: number) => {
      if (rank === 1) return 'text-red-400 bg-red-900/20'
      if (rank === 2) return 'text-yellow-400 bg-yellow-900/20'
      return 'text-green-400 bg-green-900/20'
    },
    
    getRatingColor: (rating: string) => {
      switch (rating) {
        case 'Excelled': return 'text-green-400 bg-green-900/20'
        case 'Solid': return 'text-blue-400 bg-blue-900/20'
        case 'Struggled': return 'text-red-400 bg-red-900/20'
        default: return 'text-gray-400 bg-gray-800'
      }
    }
  }), [])
}

/**
 * Hook for fun facts with UI styling
 */
export const useFunFacts = () => {
  return useMemo(() => {
    const insights = services.tournament.getTournamentInsights()
    
    // Map insights to the format expected by FunFacts component
    const funFacts = insights.map(insight => {
      // Determine colors based on category
      let color = 'text-blue-400'
      let bg = 'bg-blue-900'
      let border = 'border-blue-600'
      
      switch (insight.category) {
        case 'achievement':
          color = 'text-yellow-400'
          bg = 'bg-yellow-900'
          border = 'border-yellow-600'
          break
        case 'consistency':
          color = 'text-blue-400'
          bg = 'bg-blue-900'
          border = 'border-blue-600'
          break
        case 'improvement':
          color = 'text-green-400'
          bg = 'bg-green-900'
          border = 'border-green-600'
          break
        case 'course':
          color = 'text-indigo-400'
          bg = 'bg-indigo-900'
          border = 'border-indigo-600'
          break
        case 'matchPlay':
          color = 'text-purple-400'
          bg = 'bg-purple-900'
          border = 'border-purple-600'
          break
        case 'record':
          color = 'text-orange-400'
          bg = 'bg-orange-900'
          border = 'border-orange-600'
          break
        case 'team':
          color = 'text-teal-400'
          bg = 'bg-teal-900'
          border = 'border-teal-600'
          break
        case 'competition':
          color = 'text-red-400'
          bg = 'bg-red-900'
          border = 'border-red-600'
          break
        case 'scoring':
          color = 'text-emerald-400'
          bg = 'bg-emerald-900'
          border = 'border-emerald-600'
          break
        case 'adversity':
          color = 'text-gray-400'
          bg = 'bg-gray-800'
          border = 'border-gray-600'
          break
      }
      
      return {
        category: insight.title, // Use title as category for display
        icon: insight.icon, // Use emoji icon directly
        color,
        bg,
        border,
        title: insight.title,
        fact: insight.description
      }
    })
    
    return funFacts
  }, [])
}