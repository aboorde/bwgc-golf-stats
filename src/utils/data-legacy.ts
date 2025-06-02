// Legacy data utility functions - kept for backward compatibility
// These functions will be gradually replaced by the new service architecture

import { services } from '../services/ServiceContainer'

// Re-export the raw data for components that still need it
export { data } from './data'

/**
 * @deprecated Use services.players.getAllPlayerNames() instead
 */
export const getPlayerList = () => {
  return services.players.getAllPlayerNames()
}

/**
 * @deprecated Use services.teams.getAllTeamStatistics() instead
 */
export const getTeamData = () => {
  return services.teams.getAllTeamStatistics().map(team => ({
    team: team.name,
    totalScore: team.totalScore,
    averageScore: team.averageScore,
    players: team.members
  }))
}

/**
 * @deprecated Use services.courses.getAllCourseStatistics() instead
 */
export const getCourseData = () => {
  return services.courses.getAllCourseStatistics().map(course => ({
    course: course.name,
    average_score: course.averageScore,
    average_over_par: course.averageOverPar,
    best_score: course.bestScore,
    worst_score: course.worstScore,
    rounds_played: course.roundsPlayed
  }))
}

/**
 * @deprecated Use services.players.getLeaderboard() instead
 */
export const getAllPlayerProgressions = () => {
  const players = services.players.getAllPlayerStatistics()
  return players.map(player => ({
    player: player.name,
    scores: player.dailyPerformances.map(perf => ({
      day: perf.day,
      score: perf.score,
      course: perf.course
    }))
  }))
}

/**
 * @deprecated Use services directly with useMatchPlayData hook
 */
export const getMatchPlayMatrix = () => {
  // This is a complex function that simulates match play matrix
  // For now, return an empty object since the new architecture 
  // handles this through the MatchPlay service
  return {}
}