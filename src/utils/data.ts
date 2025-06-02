import tournamentData from '../../advanced_stats.json'

export interface TournamentData {
  tournament_summary: {
    winner: string
    winning_score: number
    leaderboard: Array<{
      player: string
      total_score: number
      rounds_played: number
      scoring_average: number
    }>
    total_rounds: number
    courses_played: number
  }
  player_statistics: Record<string, PlayerStats>
  course_analysis: {
    course_stats: Record<string, CourseStats>
    difficulty_ranking: Array<{
      course: string
      avg_over_par: number
    }>
  }
  head_to_head: {
    match_play_leaderboard: Array<{
      player: string
      points: number
      percentage: number
    }>
    match_play_champion: string
    dominant_performers: Array<any>
    struggled_performers: Array<any>
  }
  performance_trends: Record<string, PerformanceTrend>
  tournament_insights: {
    tournament_champion: string
    lowest_single_round: {
      player: string
      score: number
      course: string
      day: number
    }
    highest_single_round: {
      player: string
      score: number
      course: string
      day: number
    }
    most_consistent_player: {
      player: string
      standard_deviation: number
    }
    match_play_dominator: {
      player: string
      points: number
    }
    birdie_machine: {
      player: string
      birdies: number
    }
    steady_eddie: {
      player: string
      pars: number
    }
    big_number_specialist: {
      player: string
      big_numbers: number
    }
    fun_facts: string[]
  }
}

export interface PlayerStats {
  basic_stats: {
    total_score: number
    rounds_played: number
    scoring_average: number
    average_relative_to_par: number
    best_round: number
    worst_round: number
    best_relative_round: number
    worst_relative_round: number
  }
  consistency: {
    score_standard_deviation: number
    relative_par_standard_deviation: number
    consistency_rating: string
  }
  detailed_performance: {
    birdies: number
    pars: number
    bogeys: number
    double_bogeys: number
    triple_bogeys: number
    big_numbers: number
    under_par_percentage: number
    par_or_better_percentage: number
  }
  match_play_performance: {
    total_points: number
    possible_points: number
    win_percentage: number
  }
  daily_performance: Record<string, {
    score: number
    par: number
    relative_to_par: number
    course: string
    format: string
  }>
  course_performance: Record<string, {
    rounds_played: number
    average_score: number
    average_relative_to_par: number
    best_round: number
    performance_rating: string
  }>
}

export interface PerformanceTrend {
  daily_scores: number[]
  daily_relative_to_par: number[]
  score_change: number
  relative_change: number
  trend_direction: string
  most_improved_day: string
  consistency_across_days: number
}

export interface CourseStats {
  average_score: number
  average_over_par: number
  rounds_played: number
  difficulty_rating: string
  best_score: number
  worst_score: number
}

export interface CourseDetails {
  name: string
  par: number
  yardage: number
  rating: number
  slope: number
  holes: Array<{
    number: number
    par: number
    yardage: number
    handicap: number
  }>
}

// Load and export the tournament data
export const data: TournamentData = tournamentData as TournamentData

// Course information from courses.md
// Note: The actual tournament data only contains 3 courses (not Myrtle Beach National)
export const courseDetails: Record<string, CourseDetails> = {
  /*'Myrtle Beach National': {
    name: 'Myrtle Beach National Golf Course',
    par: 72,
    yardage: 6018,
    rating: 69.4,
    slope: 125,
    holes: [
      { number: 1, par: 4, yardage: 382, handicap: 4 },
      { number: 2, par: 5, yardage: 462, handicap: 2 },
      { number: 3, par: 4, yardage: 338, handicap: 14 },
      { number: 4, par: 3, yardage: 149, handicap: 18 },
      { number: 5, par: 4, yardage: 341, handicap: 10 },
      { number: 6, par: 5, yardage: 437, handicap: 8 },
      { number: 7, par: 4, yardage: 321, handicap: 12 },
      { number: 8, par: 3, yardage: 183, handicap: 16 },
      { number: 9, par: 4, yardage: 368, handicap: 6 },
      { number: 10, par: 5, yardage: 515, handicap: 1 },
      { number: 11, par: 4, yardage: 332, handicap: 11 },
      { number: 12, par: 4, yardage: 356, handicap: 9 },
      { number: 13, par: 3, yardage: 154, handicap: 15 },
      { number: 14, par: 4, yardage: 324, handicap: 13 },
      { number: 15, par: 4, yardage: 376, handicap: 3 },
      { number: 16, par: 5, yardage: 487, handicap: 5 },
      { number: 17, par: 3, yardage: 130, handicap: 17 },
      { number: 18, par: 4, yardage: 363, handicap: 7 }
    ]
  },*/
  'Barefoot Dye': {
    name: 'Barefoot Dye Golf Course',
    par: 72,
    yardage: 6005,
    rating: 69.7,
    slope: 128,
    holes: [
      { number: 1, par: 4, yardage: 359, handicap: 6 },
      { number: 2, par: 4, yardage: 256, handicap: 14 },
      { number: 3, par: 3, yardage: 160, handicap: 12 },
      { number: 4, par: 4, yardage: 321, handicap: 18 },
      { number: 5, par: 5, yardage: 401, handicap: 10 },
      { number: 6, par: 3, yardage: 155, handicap: 8 },
      { number: 7, par: 4, yardage: 337, handicap: 2 },
      { number: 8, par: 5, yardage: 400, handicap: 16 },
      { number: 9, par: 4, yardage: 405, handicap: 4 },
      { number: 10, par: 4, yardage: 287, handicap: 13 },
      { number: 11, par: 4, yardage: 366, handicap: 1 },
      { number: 12, par: 5, yardage: 452, handicap: 15 },
      { number: 13, par: 4, yardage: 332, handicap: 17 },
      { number: 14, par: 4, yardage: 367, handicap: 3 },
      { number: 15, par: 3, yardage: 162, handicap: 7 },
      { number: 16, par: 5, yardage: 494, handicap: 11 },
      { number: 17, par: 3, yardage: 158, handicap: 9 },
      { number: 18, par: 4, yardage: 368, handicap: 5 }
    ]
  },
  'Aberdeen Country Club': {
    name: 'Aberdeen Country Club',
    par: 72,
    yardage: 6079,
    rating: 69.5,
    slope: 131,
    holes: [
      { number: 1, par: 5, yardage: 491, handicap: 7 },
      { number: 2, par: 4, yardage: 358, handicap: 11 },
      { number: 3, par: 3, yardage: 138, handicap: 15 },
      { number: 4, par: 4, yardage: 337, handicap: 13 },
      { number: 5, par: 5, yardage: 514, handicap: 1 },
      { number: 6, par: 4, yardage: 345, handicap: 9 },
      { number: 7, par: 3, yardage: 144, handicap: 17 },
      { number: 8, par: 4, yardage: 353, handicap: 5 },
      { number: 9, par: 4, yardage: 389, handicap: 3 },
      { number: 10, par: 4, yardage: 306, handicap: 16 },
      { number: 11, par: 5, yardage: 494, handicap: 6 },
      { number: 12, par: 4, yardage: 300, handicap: 14 },
      { number: 13, par: 3, yardage: 129, handicap: 18 },
      { number: 14, par: 4, yardage: 358, handicap: 10 },
      { number: 15, par: 4, yardage: 365, handicap: 12 },
      { number: 16, par: 5, yardage: 546, handicap: 2 },
      { number: 17, par: 3, yardage: 160, handicap: 8 },
      { number: 18, par: 4, yardage: 352, handicap: 4 }
    ]
  },
  'Arcadian Shores': {
    name: 'Arcadian Shores Golf Course',
    par: 72,
    yardage: 6026,
    rating: 69.2,
    slope: 130,
    holes: [
      { number: 1, par: 5, yardage: 486, handicap: 8 },
      { number: 2, par: 3, yardage: 148, handicap: 4 },
      { number: 3, par: 5, yardage: 465, handicap: 10 },
      { number: 4, par: 4, yardage: 370, handicap: 12 },
      { number: 5, par: 4, yardage: 370, handicap: 2 },
      { number: 6, par: 4, yardage: 373, handicap: 6 },
      { number: 7, par: 4, yardage: 330, handicap: 18 },
      { number: 8, par: 3, yardage: 151, handicap: 16 },
      { number: 9, par: 4, yardage: 338, handicap: 14 },
      { number: 10, par: 5, yardage: 444, handicap: 9 },
      { number: 11, par: 4, yardage: 357, handicap: 3 },
      { number: 12, par: 4, yardage: 355, handicap: 13 },
      { number: 13, par: 4, yardage: 367, handicap: 1 },
      { number: 14, par: 4, yardage: 271, handicap: 11 },
      { number: 15, par: 3, yardage: 168, handicap: 15 },
      { number: 16, par: 5, yardage: 511, handicap: 7 },
      { number: 17, par: 3, yardage: 138, handicap: 17 },
      { number: 18, par: 4, yardage: 384, handicap: 5 }
    ]
  }
}

// Utility functions for data transformation
export const getPlayerList = (): string[] => {
  return Object.keys(data.player_statistics)
}

export const getPlayerScoreProgression = (playerName: string) => {
  const trend = data.performance_trends[playerName]
  if (!trend || !trend.daily_scores) {
    return []
  }
  
  // Get daily performance data for course names
  const dailyPerf = data.player_statistics[playerName]?.daily_performance || {}
  const days = ['day_2', 'day_3', 'day_4'] // Day 1 was scramble, not individual scores
  
  return days.map((day, idx) => {
    const dayData = dailyPerf[day]
    return {
      day: idx + 2, // Start from day 2
      score: trend.daily_scores[idx] || 0,
      course: dayData?.course || '',
      player: playerName
    }
  }).filter(d => d.score > 0)
}

export const getAllPlayerProgressions = () => {
  const players = getPlayerList()
  return players.map(player => ({
    player,
    data: getPlayerScoreProgression(player)
  }))
}

export const getScoreDistribution = (playerName: string) => {
  const trend = data.performance_trends[playerName]
  if (!trend || !trend.daily_scores) {
    return []
  }
  return trend.daily_scores
}

export const getMatchPlayMatrix = () => {
  // Since we don't have individual hole-by-hole data, we'll simulate a match play matrix
  // based on the match play points earned
  const players = getPlayerList()
  const matrix: Record<string, Record<string, number>> = {}
  
  // Initialize matrix
  players.forEach(player => {
    matrix[player] = {}
    players.forEach(opponent => {
      if (player !== opponent) {
        matrix[player][opponent] = 0
      }
    })
  })
  
  // Distribute match play points based on performance
  // This is a simulation since we don't have actual hole-by-hole data
  players.forEach(player => {
    const playerStats = data.player_statistics[player]
    const totalPoints = playerStats?.match_play_performance.total_points || 0
    const possiblePoints = playerStats?.match_play_performance.possible_points || 18
    
    // Distribute points across opponents based on relative performance
    const opponents = players.filter(p => p !== player)
    opponents.forEach((opponent, idx) => {
      const opponentStats = data.player_statistics[opponent]
      const opponentPoints = opponentStats?.match_play_performance.total_points || 0
      
      // Simulate points based on relative performance
      const relativeStrength = totalPoints / (totalPoints + opponentPoints || 1)
      const pointsAgainstOpponent = Math.min(possiblePoints / opponents.length * relativeStrength * 2, possiblePoints / opponents.length)
      
      matrix[player][opponent] = Number(pointsAgainstOpponent.toFixed(1))
    })
  })
  
  return matrix
}

export const getCourseData = () => {
  if (!data.course_analysis?.course_stats) {
    return []
  }
  return Object.entries(data.course_analysis.course_stats).map(([courseName, stats]) => ({
    course: courseName,
    ...stats
  }))
}

export const getTeamData = () => {
  // Teams based on CLAUDE.md: "3 Lefties make a Righty" vs "Banana Boys"
  const team1 = ['Mike', 'Ryan', 'Nixon', 'Doug'] // Banana Boys
  const team2 = ['Jimbo', 'AJ', 'Todd', 'Dave'] // 3 Lefties make a Righty
  
  const team1Total = team1.reduce((sum, player) => {
    const playerStats = data.player_statistics[player]
    return sum + (playerStats?.basic_stats.total_score || 0)
  }, 0)
  
  const team2Total = team2.reduce((sum, player) => {
    const playerStats = data.player_statistics[player]
    return sum + (playerStats?.basic_stats.total_score || 0)
  }, 0)
  
  return [
    {
      team: 'Banana Boys',
      totalScore: team1Total,
      averageScore: team1Total / team1.length,
      players: team1
    },
    {
      team: '3 Lefties make a Righty',
      totalScore: team2Total,
      averageScore: team2Total / team2.length,
      players: team2
    }
  ]
}

// Enhanced utility functions with course details
export const getCourseDetails = (courseName: string): CourseDetails | null => {
  return courseDetails[courseName] || null
}

export const getHoleDetails = (courseName: string, holeNumber: number) => {
  const course = getCourseDetails(courseName)
  if (!course) return null
  return course.holes.find(hole => hole.number === holeNumber)
}

export const getCourseDifficulty = () => {
  return Object.entries(courseDetails).map(([courseName, details]) => ({
    ...details,
    courseName,
    difficulty_score: details.slope + (details.rating - 69) * 10 // Custom difficulty calculation
  })).sort((a, b) => b.difficulty_score - a.difficulty_score)
}

// Simulate hole-by-hole performance data for heatmaps
export const generateHolePerformanceData = (courseName: string) => {
  const course = getCourseDetails(courseName)
  if (!course) return []
  
  const players = getPlayerList()
  const holeData = course.holes.map(hole => {
    const holePerformance = players.map(player => {
      // Simulate scoring based on hole difficulty and player skill
      const playerStats = data.player_statistics[player]
      const baseAvg = playerStats?.basic_stats.scoring_average || 100
      const skillFactor = Math.max(0.5, (100 - baseAvg) / 30) // Better players = lower factor
      
      // Par 3s are generally easier to get close to par
      // Par 5s offer more birdie opportunities
      // Handicap 1-6 holes are toughest
      const parFactor = hole.par === 3 ? 0.9 : hole.par === 5 ? 1.1 : 1.0
      const difficultyFactor = hole.handicap <= 6 ? 1.3 : hole.handicap >= 15 ? 0.8 : 1.0
      
      const avgScore = hole.par + (2 * difficultyFactor * parFactor / skillFactor)
      const variance = 0.5 + (hole.handicap <= 10 ? 0.3 : 0.1) // More variance on harder holes
      
      // Add some randomness
      const score = Math.max(hole.par - 1, Math.round(avgScore + (Math.random() - 0.5) * variance * 2))
      
      return {
        player,
        score,
        toPar: score - hole.par,
        difficulty: Math.min(5, Math.max(1, Math.round((score - hole.par + 2) * 1.5))) // 1-5 scale
      }
    })
    
    const avgScore = holePerformance.reduce((sum, p) => sum + p.score, 0) / players.length
    const avgToPar = avgScore - hole.par
    
    return {
      hole: hole.number,
      par: hole.par,
      yardage: hole.yardage,
      handicap: hole.handicap,
      avgScore: avgScore,
      avgToPar: avgToPar,
      difficulty: Math.min(5, Math.max(1, Math.round(avgToPar + 2.5))), // Course difficulty 1-5
      playerPerformance: holePerformance
    }
  })
  
  return holeData
}

export default data