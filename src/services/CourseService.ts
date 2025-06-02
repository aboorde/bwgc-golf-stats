import { BaseService } from './BaseService'
import { PlayerService } from './PlayerService'
import {
  CourseName,
  CourseInfo,
  CourseStatistics,
  CoursePerformance,
  PlayerCoursePerformance,
  PlayerName,
  ChartDataPoint
} from '../models/tournament.types'

export class CourseService extends BaseService {
  private playerService: PlayerService
  private courseCache: Map<CourseName, CourseStatistics> = new Map()

  // Course details from CLAUDE.md
  private readonly courseDetails: Map<CourseName, CourseInfo> = new Map([
    ['Barefoot Dye', {
      name: 'Barefoot Dye',
      par: 72,
      slope: 142,
      rating: 74.2,
      yardage: 7000,
      format: 'Match Play',
      day: 2
    }],
    ['Aberdeen Country Club', {
      name: 'Aberdeen Country Club',
      par: 72,
      slope: 137,
      rating: 73.4,
      yardage: 6800,
      format: 'Best Ball',
      day: 3
    }],
    ['Arcadian Shores', {
      name: 'Arcadian Shores',
      par: 72,
      slope: 132,
      rating: 71.8,
      yardage: 6600,
      format: 'Stableford',
      day: 4
    }]
  ])

  constructor() {
    super()
    this.playerService = new PlayerService()
  }

  /**
   * Get all course names
   */
  getAllCourseNames(): CourseName[] {
    return Array.from(this.courseDetails.keys())
  }

  /**
   * Get course information
   */
  getCourseInfo(courseName: CourseName): CourseInfo | null {
    return this.courseDetails.get(courseName) || null
  }

  /**
   * Get course statistics
   */
  getCourseStatistics(courseName: CourseName): CourseStatistics | null {
    // Check cache first
    if (this.courseCache.has(courseName)) {
      return this.courseCache.get(courseName)!
    }

    const courseStats = this.data.course_analysis?.course_stats?.[courseName]
    if (!courseStats) return null

    const difficultyRanking = this.data.course_analysis?.difficulty_ranking || []
    const difficultyRank = difficultyRanking.findIndex((c: any) => c.course === courseName) + 1

    const stats: CourseStatistics = {
      averageScore: courseStats.average_score || 0,
      averageOverPar: courseStats.average_over_par || 0,
      bestScore: courseStats.best_score || 0,
      worstScore: courseStats.worst_score || 0,
      roundsPlayed: courseStats.rounds_played || 0,
      difficultyRank
    }

    // Cache the result
    this.courseCache.set(courseName, stats)
    return stats
  }

  /**
   * Get all courses' statistics sorted by difficulty
   */
  getAllCourseStatistics(): (CourseStatistics & { name: CourseName })[] {
    return this.getAllCourseNames()
      .map(name => {
        const stats = this.getCourseStatistics(name)
        return stats ? { ...stats, name } : null
      })
      .filter((stats): stats is (CourseStatistics & { name: CourseName }) => stats !== null)
      .sort((a, b) => a.difficultyRank - b.difficultyRank)
  }

  /**
   * Get player performances for a specific course
   */
  getCoursePlayerPerformances(courseName: CourseName): {
    player: PlayerName
    performance: PlayerCoursePerformance
  }[] {
    const players = this.playerService.getAllPlayerNames()
    const performances: { player: PlayerName, performance: PlayerCoursePerformance }[] = []

    players.forEach(playerName => {
      const playerStats = this.playerService.getPlayerStatistics(playerName)
      if (!playerStats) return

      const coursePerf = playerStats.coursePerformances.get(courseName)
      if (coursePerf) {
        performances.push({
          player: playerName,
          performance: coursePerf
        })
      }
    })

    return performances.sort((a, b) => a.performance.averageScore - b.performance.averageScore)
  }

  /**
   * Get course leaderboard (best performers)
   */
  getCourseLeaderboard(courseName: CourseName, limit?: number): {
    position: number
    player: PlayerName
    score: number
    toPar: number
    rating: string
  }[] {
    const performances = this.getCoursePlayerPerformances(courseName)
    const courseInfo = this.getCourseInfo(courseName)
    const par = courseInfo?.par || 72

    const leaderboard = performances.map((perf, index) => ({
      position: index + 1,
      player: perf.player,
      score: perf.performance.bestRound,
      toPar: perf.performance.bestRound - par,
      rating: perf.performance.performanceRating
    }))

    return limit ? leaderboard.slice(0, limit) : leaderboard
  }

  /**
   * Get course difficulty analysis
   */
  getCourseDifficultyAnalysis(): {
    mostDifficult: { course: CourseName, averageOverPar: number }
    easiest: { course: CourseName, averageOverPar: number }
    rankings: { course: CourseName, difficulty: number, label: string }[]
  } {
    const courses = this.getAllCourseStatistics()
    
    const rankings = courses.map(course => ({
      course: course.name,
      difficulty: course.difficultyRank,
      label: course.difficultyRank === 1 ? 'Most Difficult' :
             course.difficultyRank === 2 ? 'Moderate' :
             'Easiest'
    }))

    return {
      mostDifficult: {
        course: courses[0].name,
        averageOverPar: courses[0].averageOverPar
      },
      easiest: {
        course: courses[courses.length - 1].name,
        averageOverPar: courses[courses.length - 1].averageOverPar
      },
      rankings
    }
  }

  /**
   * Get course records (best and worst scores)
   */
  getCourseRecords(): {
    course: CourseName
    bestScore: { player: PlayerName, score: number }
    worstScore: { player: PlayerName, score: number }
    spread: number
  }[] {
    const records: {
      course: CourseName
      bestScore: { player: PlayerName, score: number }
      worstScore: { player: PlayerName, score: number }
      spread: number
    }[] = []

    this.getAllCourseNames().forEach(courseName => {
      const stats = this.getCourseStatistics(courseName)
      if (!stats) return

      const performances = this.getCoursePlayerPerformances(courseName)
      
      // Find who achieved the best and worst scores
      let bestPlayer = ''
      let worstPlayer = ''
      
      performances.forEach(perf => {
        if (perf.performance.bestRound === stats.bestScore) {
          bestPlayer = perf.player
        }
        // Note: We don't have worst round data per player per course in the current structure
      })

      records.push({
        course: courseName,
        bestScore: { player: bestPlayer, score: stats.bestScore },
        worstScore: { player: worstPlayer || 'Unknown', score: stats.worstScore },
        spread: stats.worstScore - stats.bestScore
      })
    })

    return records
  }

  /**
   * Get course performance chart data
   */
  getCourseChartData(dataType: 'difficulty' | 'average' | 'spread'): ChartDataPoint[] {
    const courses = this.getAllCourseStatistics()

    switch (dataType) {
      case 'difficulty':
        return courses.map(course => ({
          label: course.name,
          value: course.averageOverPar,
          category: `Rank #${course.difficultyRank}`,
          metadata: {
            averageScore: course.averageScore,
            roundsPlayed: course.roundsPlayed
          }
        }))

      case 'average':
        return courses.map(course => ({
          label: course.name,
          value: course.averageScore,
          category: 'Average Score',
          metadata: {
            overPar: course.averageOverPar,
            difficultyRank: course.difficultyRank
          }
        }))

      case 'spread':
        return courses.map(course => ({
          label: course.name,
          value: course.worstScore - course.bestScore,
          category: 'Score Range',
          metadata: {
            bestScore: course.bestScore,
            worstScore: course.worstScore
          }
        }))
    }
  }

  /**
   * Get hole-by-hole analysis (simulated since we don't have actual hole data)
   */
  getSimulatedHoleAnalysis(courseName: CourseName): {
    hole: number
    par: number
    averageScore: number
    difficulty: 'Easy' | 'Moderate' | 'Hard'
  }[] {
    const courseStats = this.getCourseStatistics(courseName)
    if (!courseStats) return []

    // Simulate hole data based on course difficulty
    const holes: {
      hole: number
      par: number
      averageScore: number
      difficulty: 'Easy' | 'Moderate' | 'Hard'
    }[] = []

    const baseDifficulty = courseStats.averageOverPar / 18
    
    for (let i = 1; i <= 18; i++) {
      // Mix of par 3s, 4s, and 5s
      const par = i % 6 === 0 ? 3 : i % 5 === 0 ? 5 : 4
      
      // Add some variance to difficulty
      const variance = (Math.sin(i * 0.7) * 0.3) + (Math.cos(i * 1.3) * 0.2)
      const holeOverPar = baseDifficulty + variance
      const averageScore = par + holeOverPar

      holes.push({
        hole: i,
        par,
        averageScore: Number(averageScore.toFixed(1)),
        difficulty: holeOverPar > baseDifficulty + 0.2 ? 'Hard' :
                   holeOverPar < baseDifficulty - 0.2 ? 'Easy' :
                   'Moderate'
      })
    }

    return holes
  }
}