import { BaseService } from './BaseService'
import {
  CourseName,
  PlayerName,
  HoleInfo,
  HolePerformance,
  HoleScore,
  HoleType,
  HoleAnalytics,
  HoleDifficultyAnalysis,
  PlayerHolePerformance,
  StrategicInsight,
  RiskRewardAnalysis,
  HoleVisualizationData
} from '../models/tournament.types'

// Real hole-by-hole scores from myrtleScores.csv
interface RealHoleScore {
  player: PlayerName
  course: CourseName
  hole: number
  score: number
  par: number
}

// Course hole information from courses.md
interface CourseHoleInfo {
  hole: number
  yardage: number
  par: number
  handicap: number
}

export class HoleAnalysisService extends BaseService {
  private holeDataCache: Map<CourseName, HoleInfo[]> = new Map()
  private analyticsCache: Map<CourseName, HoleAnalytics> = new Map()
  private realScoresCache: Map<CourseName, RealHoleScore[]> = new Map()

  // Player color mapping - consistent across all components
  private readonly playerColors: Map<PlayerName, string> = new Map([
    ['Mike', '#10b981'],      // Green - winner
    ['Jimbo', '#3b82f6'],     // Blue  
    ['Dave', '#f59e0b'],      // Amber
    ['Ryan', '#ef4444'],      // Red
    ['Nixon', '#8b5cf6'],     // Purple
    ['AJ', '#06b6d4'],        // Cyan
    ['Todd', '#f97316'],      // Orange
    ['Doug', '#84cc16']       // Lime
  ])

  // Real course data from courses.md
  private readonly courseHoleData: Map<CourseName, CourseHoleInfo[]> = new Map([
    ['Barefoot Dye', [
      { hole: 1, yardage: 359, par: 4, handicap: 6 },
      { hole: 2, yardage: 256, par: 4, handicap: 14 },
      { hole: 3, yardage: 160, par: 3, handicap: 12 },
      { hole: 4, yardage: 321, par: 4, handicap: 18 },
      { hole: 5, yardage: 401, par: 5, handicap: 10 },
      { hole: 6, yardage: 155, par: 3, handicap: 8 },
      { hole: 7, yardage: 337, par: 4, handicap: 2 },
      { hole: 8, yardage: 400, par: 5, handicap: 16 },
      { hole: 9, yardage: 405, par: 4, handicap: 4 },
      { hole: 10, yardage: 287, par: 4, handicap: 13 },
      { hole: 11, yardage: 366, par: 4, handicap: 1 },
      { hole: 12, yardage: 452, par: 5, handicap: 15 },
      { hole: 13, yardage: 332, par: 4, handicap: 17 },
      { hole: 14, yardage: 367, par: 4, handicap: 3 },
      { hole: 15, yardage: 162, par: 3, handicap: 7 },
      { hole: 16, yardage: 494, par: 5, handicap: 11 },
      { hole: 17, yardage: 158, par: 3, handicap: 9 },
      { hole: 18, yardage: 368, par: 4, handicap: 5 }
    ]],
    ['Aberdeen Country Club', [
      { hole: 1, yardage: 491, par: 5, handicap: 7 },
      { hole: 2, yardage: 358, par: 4, handicap: 11 },
      { hole: 3, yardage: 138, par: 3, handicap: 15 },
      { hole: 4, yardage: 337, par: 4, handicap: 13 },
      { hole: 5, yardage: 514, par: 5, handicap: 1 },
      { hole: 6, yardage: 345, par: 4, handicap: 9 },
      { hole: 7, yardage: 144, par: 3, handicap: 17 },
      { hole: 8, yardage: 353, par: 4, handicap: 5 },
      { hole: 9, yardage: 389, par: 4, handicap: 3 },
      { hole: 10, yardage: 306, par: 4, handicap: 16 },
      { hole: 11, yardage: 494, par: 5, handicap: 6 },
      { hole: 12, yardage: 300, par: 4, handicap: 14 },
      { hole: 13, yardage: 129, par: 3, handicap: 18 },
      { hole: 14, yardage: 358, par: 4, handicap: 10 },
      { hole: 15, yardage: 365, par: 4, handicap: 12 },
      { hole: 16, yardage: 546, par: 5, handicap: 2 },
      { hole: 17, yardage: 160, par: 3, handicap: 8 },
      { hole: 18, yardage: 352, par: 4, handicap: 4 }
    ]],
    ['Arcadian Shores', [
      { hole: 1, yardage: 486, par: 5, handicap: 8 },
      { hole: 2, yardage: 148, par: 3, handicap: 4 },
      { hole: 3, yardage: 465, par: 5, handicap: 10 },
      { hole: 4, yardage: 370, par: 4, handicap: 12 },
      { hole: 5, yardage: 370, par: 4, handicap: 2 },
      { hole: 6, yardage: 373, par: 4, handicap: 6 },
      { hole: 7, yardage: 330, par: 4, handicap: 18 },
      { hole: 8, yardage: 151, par: 3, handicap: 16 },
      { hole: 9, yardage: 338, par: 4, handicap: 14 },
      { hole: 10, yardage: 444, par: 5, handicap: 9 },
      { hole: 11, yardage: 357, par: 4, handicap: 3 },
      { hole: 12, yardage: 355, par: 4, handicap: 13 },
      { hole: 13, yardage: 367, par: 4, handicap: 1 },
      { hole: 14, yardage: 271, par: 4, handicap: 11 },
      { hole: 15, yardage: 168, par: 3, handicap: 15 },
      { hole: 16, yardage: 511, par: 5, handicap: 7 },
      { hole: 17, yardage: 138, par: 3, handicap: 17 },
      { hole: 18, yardage: 384, par: 4, handicap: 5 }
    ]]
  ])

  // Real hole scores from myrtleScores.csv
  private readonly realHoleScores: RealHoleScore[] = [
    // Day 2 - Barefoot Dye
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 1, score: 5, par: 4 },
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 2, score: 6, par: 4 },
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 3, score: 4, par: 3 },
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 4, score: 5, par: 4 },
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 5, score: 7, par: 5 },
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 6, score: 5, par: 3 },
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 7, score: 5, par: 4 },
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 8, score: 6, par: 5 },
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 9, score: 9, par: 4 },
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 10, score: 6, par: 4 },
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 11, score: 5, par: 4 },
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 12, score: 5, par: 5 },
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 13, score: 5, par: 4 },
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 14, score: 6, par: 4 },
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 15, score: 4, par: 3 },
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 16, score: 7, par: 5 },
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 17, score: 4, par: 3 },
    { player: 'Jimbo', course: 'Barefoot Dye', hole: 18, score: 6, par: 4 },
    
    { player: 'Mike', course: 'Barefoot Dye', hole: 1, score: 5, par: 4 },
    { player: 'Mike', course: 'Barefoot Dye', hole: 2, score: 4, par: 4 },
    { player: 'Mike', course: 'Barefoot Dye', hole: 3, score: 3, par: 3 },
    { player: 'Mike', course: 'Barefoot Dye', hole: 4, score: 5, par: 4 },
    { player: 'Mike', course: 'Barefoot Dye', hole: 5, score: 5, par: 5 },
    { player: 'Mike', course: 'Barefoot Dye', hole: 6, score: 4, par: 3 },
    { player: 'Mike', course: 'Barefoot Dye', hole: 7, score: 6, par: 4 },
    { player: 'Mike', course: 'Barefoot Dye', hole: 8, score: 5, par: 5 },
    { player: 'Mike', course: 'Barefoot Dye', hole: 9, score: 5, par: 4 },
    { player: 'Mike', course: 'Barefoot Dye', hole: 10, score: 5, par: 4 },
    { player: 'Mike', course: 'Barefoot Dye', hole: 11, score: 8, par: 4 },
    { player: 'Mike', course: 'Barefoot Dye', hole: 12, score: 7, par: 5 },
    { player: 'Mike', course: 'Barefoot Dye', hole: 13, score: 6, par: 4 },
    { player: 'Mike', course: 'Barefoot Dye', hole: 14, score: 5, par: 4 },
    { player: 'Mike', course: 'Barefoot Dye', hole: 15, score: 4, par: 3 },
    { player: 'Mike', course: 'Barefoot Dye', hole: 16, score: 5, par: 5 },
    { player: 'Mike', course: 'Barefoot Dye', hole: 17, score: 4, par: 3 },
    { player: 'Mike', course: 'Barefoot Dye', hole: 18, score: 11, par: 4 },
    
    { player: 'Dave', course: 'Barefoot Dye', hole: 1, score: 9, par: 4 },
    { player: 'Dave', course: 'Barefoot Dye', hole: 2, score: 7, par: 4 },
    { player: 'Dave', course: 'Barefoot Dye', hole: 3, score: 3, par: 3 },
    { player: 'Dave', course: 'Barefoot Dye', hole: 4, score: 5, par: 4 },
    { player: 'Dave', course: 'Barefoot Dye', hole: 5, score: 10, par: 5 },
    { player: 'Dave', course: 'Barefoot Dye', hole: 6, score: 4, par: 3 },
    { player: 'Dave', course: 'Barefoot Dye', hole: 7, score: 8, par: 4 },
    { player: 'Dave', course: 'Barefoot Dye', hole: 8, score: 5, par: 5 },
    { player: 'Dave', course: 'Barefoot Dye', hole: 9, score: 5, par: 4 },
    { player: 'Dave', course: 'Barefoot Dye', hole: 10, score: 4, par: 4 },
    { player: 'Dave', course: 'Barefoot Dye', hole: 11, score: 8, par: 4 },
    { player: 'Dave', course: 'Barefoot Dye', hole: 12, score: 7, par: 5 },
    { player: 'Dave', course: 'Barefoot Dye', hole: 13, score: 5, par: 4 },
    { player: 'Dave', course: 'Barefoot Dye', hole: 14, score: 7, par: 4 },
    { player: 'Dave', course: 'Barefoot Dye', hole: 15, score: 5, par: 3 },
    { player: 'Dave', course: 'Barefoot Dye', hole: 16, score: 8, par: 5 },
    { player: 'Dave', course: 'Barefoot Dye', hole: 17, score: 4, par: 3 },
    { player: 'Dave', course: 'Barefoot Dye', hole: 18, score: 6, par: 4 },
    
    { player: 'Ryan', course: 'Barefoot Dye', hole: 1, score: 8, par: 4 },
    { player: 'Ryan', course: 'Barefoot Dye', hole: 2, score: 7, par: 4 },
    { player: 'Ryan', course: 'Barefoot Dye', hole: 3, score: 3, par: 3 },
    { player: 'Ryan', course: 'Barefoot Dye', hole: 4, score: 6, par: 4 },
    { player: 'Ryan', course: 'Barefoot Dye', hole: 5, score: 5, par: 5 },
    { player: 'Ryan', course: 'Barefoot Dye', hole: 6, score: 3, par: 3 },
    { player: 'Ryan', course: 'Barefoot Dye', hole: 7, score: 7, par: 4 },
    { player: 'Ryan', course: 'Barefoot Dye', hole: 8, score: 7, par: 5 },
    { player: 'Ryan', course: 'Barefoot Dye', hole: 9, score: 8, par: 4 },
    { player: 'Ryan', course: 'Barefoot Dye', hole: 10, score: 5, par: 4 },
    { player: 'Ryan', course: 'Barefoot Dye', hole: 11, score: 9, par: 4 },
    { player: 'Ryan', course: 'Barefoot Dye', hole: 12, score: 7, par: 5 },
    { player: 'Ryan', course: 'Barefoot Dye', hole: 13, score: 4, par: 4 },
    { player: 'Ryan', course: 'Barefoot Dye', hole: 14, score: 7, par: 4 },
    { player: 'Ryan', course: 'Barefoot Dye', hole: 15, score: 5, par: 3 },
    { player: 'Ryan', course: 'Barefoot Dye', hole: 16, score: 8, par: 5 },
    { player: 'Ryan', course: 'Barefoot Dye', hole: 17, score: 7, par: 3 },
    { player: 'Ryan', course: 'Barefoot Dye', hole: 18, score: 8, par: 4 },
    
    { player: 'AJ', course: 'Barefoot Dye', hole: 1, score: 7, par: 4 },
    { player: 'AJ', course: 'Barefoot Dye', hole: 2, score: 6, par: 4 },
    { player: 'AJ', course: 'Barefoot Dye', hole: 3, score: 7, par: 3 },
    { player: 'AJ', course: 'Barefoot Dye', hole: 4, score: 7, par: 4 },
    { player: 'AJ', course: 'Barefoot Dye', hole: 5, score: 9, par: 5 },
    { player: 'AJ', course: 'Barefoot Dye', hole: 6, score: 10, par: 3 },
    { player: 'AJ', course: 'Barefoot Dye', hole: 7, score: 8, par: 4 },
    { player: 'AJ', course: 'Barefoot Dye', hole: 8, score: 9, par: 5 },
    { player: 'AJ', course: 'Barefoot Dye', hole: 9, score: 9, par: 4 },
    { player: 'AJ', course: 'Barefoot Dye', hole: 10, score: 7, par: 4 },
    { player: 'AJ', course: 'Barefoot Dye', hole: 11, score: 7, par: 4 },
    { player: 'AJ', course: 'Barefoot Dye', hole: 12, score: 9, par: 5 },
    { player: 'AJ', course: 'Barefoot Dye', hole: 13, score: 7, par: 4 },
    { player: 'AJ', course: 'Barefoot Dye', hole: 14, score: 6, par: 4 },
    { player: 'AJ', course: 'Barefoot Dye', hole: 15, score: 4, par: 3 },
    { player: 'AJ', course: 'Barefoot Dye', hole: 16, score: 10, par: 5 },
    { player: 'AJ', course: 'Barefoot Dye', hole: 17, score: 6, par: 3 },
    { player: 'AJ', course: 'Barefoot Dye', hole: 18, score: 8, par: 4 },
    
    { player: 'Nixon', course: 'Barefoot Dye', hole: 1, score: 8, par: 4 },
    { player: 'Nixon', course: 'Barefoot Dye', hole: 2, score: 6, par: 4 },
    { player: 'Nixon', course: 'Barefoot Dye', hole: 3, score: 5, par: 3 },
    { player: 'Nixon', course: 'Barefoot Dye', hole: 4, score: 6, par: 4 },
    { player: 'Nixon', course: 'Barefoot Dye', hole: 5, score: 8, par: 5 },
    { player: 'Nixon', course: 'Barefoot Dye', hole: 6, score: 3, par: 3 },
    { player: 'Nixon', course: 'Barefoot Dye', hole: 7, score: 7, par: 4 },
    { player: 'Nixon', course: 'Barefoot Dye', hole: 8, score: 6, par: 5 },
    { player: 'Nixon', course: 'Barefoot Dye', hole: 9, score: 6, par: 4 },
    { player: 'Nixon', course: 'Barefoot Dye', hole: 10, score: 7, par: 4 },
    { player: 'Nixon', course: 'Barefoot Dye', hole: 11, score: 8, par: 4 },
    { player: 'Nixon', course: 'Barefoot Dye', hole: 12, score: 8, par: 5 },
    { player: 'Nixon', course: 'Barefoot Dye', hole: 13, score: 6, par: 4 },
    { player: 'Nixon', course: 'Barefoot Dye', hole: 14, score: 7, par: 4 },
    { player: 'Nixon', course: 'Barefoot Dye', hole: 15, score: 5, par: 3 },
    { player: 'Nixon', course: 'Barefoot Dye', hole: 16, score: 7, par: 5 },
    { player: 'Nixon', course: 'Barefoot Dye', hole: 17, score: 4, par: 3 },
    { player: 'Nixon', course: 'Barefoot Dye', hole: 18, score: 5, par: 4 },
    
    { player: 'Todd', course: 'Barefoot Dye', hole: 1, score: 6, par: 4 },
    { player: 'Todd', course: 'Barefoot Dye', hole: 2, score: 7, par: 4 },
    { player: 'Todd', course: 'Barefoot Dye', hole: 3, score: 6, par: 3 },
    { player: 'Todd', course: 'Barefoot Dye', hole: 4, score: 6, par: 4 },
    { player: 'Todd', course: 'Barefoot Dye', hole: 5, score: 8, par: 5 },
    { player: 'Todd', course: 'Barefoot Dye', hole: 6, score: 6, par: 3 },
    { player: 'Todd', course: 'Barefoot Dye', hole: 7, score: 7, par: 4 },
    { player: 'Todd', course: 'Barefoot Dye', hole: 8, score: 7, par: 5 },
    { player: 'Todd', course: 'Barefoot Dye', hole: 9, score: 6, par: 4 },
    { player: 'Todd', course: 'Barefoot Dye', hole: 10, score: 6, par: 4 },
    { player: 'Todd', course: 'Barefoot Dye', hole: 11, score: 9, par: 4 },
    { player: 'Todd', course: 'Barefoot Dye', hole: 12, score: 7, par: 5 },
    { player: 'Todd', course: 'Barefoot Dye', hole: 13, score: 7, par: 4 },
    { player: 'Todd', course: 'Barefoot Dye', hole: 14, score: 9, par: 4 },
    { player: 'Todd', course: 'Barefoot Dye', hole: 15, score: 6, par: 3 },
    { player: 'Todd', course: 'Barefoot Dye', hole: 16, score: 9, par: 5 },
    { player: 'Todd', course: 'Barefoot Dye', hole: 17, score: 6, par: 3 },
    { player: 'Todd', course: 'Barefoot Dye', hole: 18, score: 8, par: 4 },
    
    { player: 'Doug', course: 'Barefoot Dye', hole: 1, score: 6, par: 4 },
    { player: 'Doug', course: 'Barefoot Dye', hole: 2, score: 8, par: 4 },
    { player: 'Doug', course: 'Barefoot Dye', hole: 3, score: 6, par: 3 },
    { player: 'Doug', course: 'Barefoot Dye', hole: 4, score: 7, par: 4 },
    { player: 'Doug', course: 'Barefoot Dye', hole: 5, score: 9, par: 5 },
    { player: 'Doug', course: 'Barefoot Dye', hole: 6, score: 5, par: 3 },
    { player: 'Doug', course: 'Barefoot Dye', hole: 7, score: 10, par: 4 },
    { player: 'Doug', course: 'Barefoot Dye', hole: 8, score: 7, par: 5 },
    { player: 'Doug', course: 'Barefoot Dye', hole: 9, score: 8, par: 4 },
    { player: 'Doug', course: 'Barefoot Dye', hole: 10, score: 7, par: 4 },
    { player: 'Doug', course: 'Barefoot Dye', hole: 11, score: 5, par: 4 },
    { player: 'Doug', course: 'Barefoot Dye', hole: 12, score: 8, par: 5 },
    { player: 'Doug', course: 'Barefoot Dye', hole: 13, score: 7, par: 4 },
    { player: 'Doug', course: 'Barefoot Dye', hole: 14, score: 7, par: 4 },
    { player: 'Doug', course: 'Barefoot Dye', hole: 15, score: 6, par: 3 },
    { player: 'Doug', course: 'Barefoot Dye', hole: 16, score: 8, par: 5 },
    { player: 'Doug', course: 'Barefoot Dye', hole: 17, score: 7, par: 3 },
    { player: 'Doug', course: 'Barefoot Dye', hole: 18, score: 7, par: 4 },
    
    // Day 3 - Aberdeen Country Club
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 1, score: 6, par: 5 },
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 2, score: 5, par: 4 },
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 3, score: 4, par: 3 },
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 4, score: 5, par: 4 },
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 5, score: 6, par: 5 },
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 6, score: 4, par: 4 },
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 7, score: 5, par: 3 },
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 8, score: 7, par: 4 },
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 9, score: 6, par: 4 },
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 10, score: 5, par: 4 },
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 11, score: 6, par: 5 },
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 12, score: 5, par: 4 },
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 13, score: 3, par: 3 },
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 14, score: 6, par: 4 },
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 15, score: 5, par: 4 },
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 16, score: 6, par: 5 },
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 17, score: 4, par: 3 },
    { player: 'Jimbo', course: 'Aberdeen Country Club', hole: 18, score: 5, par: 4 },
    
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 1, score: 7, par: 5 },
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 2, score: 4, par: 4 },
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 3, score: 4, par: 3 },
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 4, score: 6, par: 4 },
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 5, score: 7, par: 5 },
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 6, score: 5, par: 4 },
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 7, score: 5, par: 3 },
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 8, score: 5, par: 4 },
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 9, score: 5, par: 4 },
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 10, score: 6, par: 4 },
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 11, score: 7, par: 5 },
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 12, score: 5, par: 4 },
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 13, score: 3, par: 3 },
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 14, score: 6, par: 4 },
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 15, score: 6, par: 4 },
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 16, score: 7, par: 5 },
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 17, score: 3, par: 3 },
    { player: 'Dave', course: 'Aberdeen Country Club', hole: 18, score: 7, par: 4 },
    
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 1, score: 6, par: 5 },
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 2, score: 5, par: 4 },
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 3, score: 3, par: 3 },
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 4, score: 5, par: 4 },
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 5, score: 7, par: 5 },
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 6, score: 6, par: 4 },
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 7, score: 3, par: 3 },
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 8, score: 6, par: 4 },
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 9, score: 6, par: 4 },
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 10, score: 6, par: 4 },
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 11, score: 7, par: 5 },
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 12, score: 4, par: 4 },
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 13, score: 4, par: 3 },
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 14, score: 4, par: 4 },
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 15, score: 4, par: 4 },
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 16, score: 5, par: 5 },
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 17, score: 3, par: 3 },
    { player: 'Mike', course: 'Aberdeen Country Club', hole: 18, score: 4, par: 4 },
    
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 1, score: 7, par: 5 },
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 2, score: 4, par: 4 },
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 3, score: 5, par: 3 },
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 4, score: 5, par: 4 },
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 5, score: 6, par: 5 },
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 6, score: 7, par: 4 },
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 7, score: 7, par: 3 },
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 8, score: 5, par: 4 },
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 9, score: 7, par: 4 },
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 10, score: 4, par: 4 },
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 11, score: 7, par: 5 },
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 12, score: 6, par: 4 },
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 13, score: 3, par: 3 },
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 14, score: 6, par: 4 },
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 15, score: 5, par: 4 },
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 16, score: 5, par: 5 },
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 17, score: 6, par: 3 },
    { player: 'Ryan', course: 'Aberdeen Country Club', hole: 18, score: 4, par: 4 },
    
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 1, score: 6, par: 5 },
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 2, score: 6, par: 4 },
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 3, score: 4, par: 3 },
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 4, score: 7, par: 4 },
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 5, score: 10, par: 5 },
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 6, score: 7, par: 4 },
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 7, score: 4, par: 3 },
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 8, score: 7, par: 4 },
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 9, score: 6, par: 4 },
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 10, score: 8, par: 4 },
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 11, score: 6, par: 5 },
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 12, score: 6, par: 4 },
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 13, score: 5, par: 3 },
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 14, score: 5, par: 4 },
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 15, score: 9, par: 4 },
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 16, score: 10, par: 5 },
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 17, score: 4, par: 3 },
    { player: 'AJ', course: 'Aberdeen Country Club', hole: 18, score: 7, par: 4 },
    
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 1, score: 7, par: 5 },
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 2, score: 7, par: 4 },
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 3, score: 6, par: 3 },
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 4, score: 5, par: 4 },
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 5, score: 8, par: 5 },
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 6, score: 10, par: 4 },
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 7, score: 9, par: 3 },
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 8, score: 5, par: 4 },
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 9, score: 7, par: 4 },
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 10, score: 6, par: 4 },
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 11, score: 12, par: 5 },
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 12, score: 5, par: 4 },
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 13, score: 4, par: 3 },
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 14, score: 6, par: 4 },
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 15, score: 7, par: 4 },
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 16, score: 10, par: 5 },
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 17, score: 5, par: 3 },
    { player: 'Todd', course: 'Aberdeen Country Club', hole: 18, score: 5, par: 4 },
    
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 1, score: 8, par: 5 },
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 2, score: 6, par: 4 },
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 3, score: 4, par: 3 },
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 4, score: 6, par: 4 },
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 5, score: 6, par: 5 },
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 6, score: 8, par: 4 },
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 7, score: 5, par: 3 },
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 8, score: 6, par: 4 },
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 9, score: 5, par: 4 },
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 10, score: 5, par: 4 },
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 11, score: 10, par: 5 },
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 12, score: 5, par: 4 },
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 13, score: 6, par: 3 },
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 14, score: 5, par: 4 },
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 15, score: 6, par: 4 },
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 16, score: 9, par: 5 },
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 17, score: 5, par: 3 },
    { player: 'Nixon', course: 'Aberdeen Country Club', hole: 18, score: 9, par: 4 },
    
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 1, score: 9, par: 5 },
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 2, score: 8, par: 4 },
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 3, score: 5, par: 3 },
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 4, score: 8, par: 4 },
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 5, score: 5, par: 5 },
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 6, score: 8, par: 4 },
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 7, score: 6, par: 3 },
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 8, score: 7, par: 4 },
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 9, score: 6, par: 4 },
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 10, score: 10, par: 4 },
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 11, score: 8, par: 5 },
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 12, score: 11, par: 4 },
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 13, score: 5, par: 3 },
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 14, score: 8, par: 4 },
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 15, score: 8, par: 4 },
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 16, score: 9, par: 5 },
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 17, score: 5, par: 3 },
    { player: 'Doug', course: 'Aberdeen Country Club', hole: 18, score: 7, par: 4 },
    
    // Day 4 - Arcadian Shores
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 1, score: 5, par: 5 },
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 2, score: 6, par: 3 },
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 3, score: 6, par: 5 },
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 4, score: 5, par: 4 },
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 5, score: 5, par: 4 },
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 6, score: 5, par: 4 },
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 7, score: 7, par: 4 },
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 8, score: 4, par: 3 },
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 9, score: 4, par: 4 },
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 10, score: 5, par: 5 },
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 11, score: 6, par: 4 },
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 12, score: 5, par: 4 },
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 13, score: 4, par: 4 },
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 14, score: 4, par: 4 },
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 15, score: 4, par: 3 },
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 16, score: 6, par: 5 },
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 17, score: 4, par: 3 },
    { player: 'Jimbo', course: 'Arcadian Shores', hole: 18, score: 7, par: 4 },
    
    { player: 'Mike', course: 'Arcadian Shores', hole: 1, score: 6, par: 5 },
    { player: 'Mike', course: 'Arcadian Shores', hole: 2, score: 6, par: 3 },
    { player: 'Mike', course: 'Arcadian Shores', hole: 3, score: 5, par: 5 },
    { player: 'Mike', course: 'Arcadian Shores', hole: 4, score: 4, par: 4 },
    { player: 'Mike', course: 'Arcadian Shores', hole: 5, score: 4, par: 4 },
    { player: 'Mike', course: 'Arcadian Shores', hole: 6, score: 5, par: 4 },
    { player: 'Mike', course: 'Arcadian Shores', hole: 7, score: 5, par: 4 },
    { player: 'Mike', course: 'Arcadian Shores', hole: 8, score: 3, par: 3 },
    { player: 'Mike', course: 'Arcadian Shores', hole: 9, score: 5, par: 4 },
    { player: 'Mike', course: 'Arcadian Shores', hole: 10, score: 5, par: 5 },
    { player: 'Mike', course: 'Arcadian Shores', hole: 11, score: 4, par: 4 },
    { player: 'Mike', course: 'Arcadian Shores', hole: 12, score: 5, par: 4 },
    { player: 'Mike', course: 'Arcadian Shores', hole: 13, score: 4, par: 4 },
    { player: 'Mike', course: 'Arcadian Shores', hole: 14, score: 5, par: 4 },
    { player: 'Mike', course: 'Arcadian Shores', hole: 15, score: 4, par: 3 },
    { player: 'Mike', course: 'Arcadian Shores', hole: 16, score: 6, par: 5 },
    { player: 'Mike', course: 'Arcadian Shores', hole: 17, score: 3, par: 3 },
    { player: 'Mike', course: 'Arcadian Shores', hole: 18, score: 5, par: 4 },
    
    { player: 'Dave', course: 'Arcadian Shores', hole: 1, score: 6, par: 5 },
    { player: 'Dave', course: 'Arcadian Shores', hole: 2, score: 3, par: 3 },
    { player: 'Dave', course: 'Arcadian Shores', hole: 3, score: 5, par: 5 },
    { player: 'Dave', course: 'Arcadian Shores', hole: 4, score: 7, par: 4 },
    { player: 'Dave', course: 'Arcadian Shores', hole: 5, score: 5, par: 4 },
    { player: 'Dave', course: 'Arcadian Shores', hole: 6, score: 6, par: 4 },
    { player: 'Dave', course: 'Arcadian Shores', hole: 7, score: 4, par: 4 },
    { player: 'Dave', course: 'Arcadian Shores', hole: 8, score: 3, par: 3 },
    { player: 'Dave', course: 'Arcadian Shores', hole: 9, score: 5, par: 4 },
    { player: 'Dave', course: 'Arcadian Shores', hole: 10, score: 8, par: 5 },
    { player: 'Dave', course: 'Arcadian Shores', hole: 11, score: 4, par: 4 },
    { player: 'Dave', course: 'Arcadian Shores', hole: 12, score: 5, par: 4 },
    { player: 'Dave', course: 'Arcadian Shores', hole: 13, score: 5, par: 4 },
    { player: 'Dave', course: 'Arcadian Shores', hole: 14, score: 4, par: 4 },
    { player: 'Dave', course: 'Arcadian Shores', hole: 15, score: 4, par: 3 },
    { player: 'Dave', course: 'Arcadian Shores', hole: 16, score: 7, par: 5 },
    { player: 'Dave', course: 'Arcadian Shores', hole: 17, score: 4, par: 3 },
    { player: 'Dave', course: 'Arcadian Shores', hole: 18, score: 5, par: 4 },
    
    { player: 'Nixon', course: 'Arcadian Shores', hole: 1, score: 6, par: 5 },
    { player: 'Nixon', course: 'Arcadian Shores', hole: 2, score: 6, par: 3 },
    { player: 'Nixon', course: 'Arcadian Shores', hole: 3, score: 9, par: 5 },
    { player: 'Nixon', course: 'Arcadian Shores', hole: 4, score: 5, par: 4 },
    { player: 'Nixon', course: 'Arcadian Shores', hole: 5, score: 6, par: 4 },
    { player: 'Nixon', course: 'Arcadian Shores', hole: 6, score: 6, par: 4 },
    { player: 'Nixon', course: 'Arcadian Shores', hole: 7, score: 6, par: 4 },
    { player: 'Nixon', course: 'Arcadian Shores', hole: 8, score: 5, par: 3 },
    { player: 'Nixon', course: 'Arcadian Shores', hole: 9, score: 8, par: 4 },
    { player: 'Nixon', course: 'Arcadian Shores', hole: 10, score: 9, par: 5 },
    { player: 'Nixon', course: 'Arcadian Shores', hole: 11, score: 5, par: 4 },
    { player: 'Nixon', course: 'Arcadian Shores', hole: 12, score: 6, par: 4 },
    { player: 'Nixon', course: 'Arcadian Shores', hole: 13, score: 6, par: 4 },
    { player: 'Nixon', course: 'Arcadian Shores', hole: 14, score: 4, par: 4 },
    { player: 'Nixon', course: 'Arcadian Shores', hole: 15, score: 4, par: 3 },
    { player: 'Nixon', course: 'Arcadian Shores', hole: 16, score: 7, par: 5 },
    { player: 'Nixon', course: 'Arcadian Shores', hole: 17, score: 3, par: 3 },
    { player: 'Nixon', course: 'Arcadian Shores', hole: 18, score: 6, par: 4 },
    
    { player: 'AJ', course: 'Arcadian Shores', hole: 1, score: 8, par: 5 },
    { player: 'AJ', course: 'Arcadian Shores', hole: 2, score: 5, par: 3 },
    { player: 'AJ', course: 'Arcadian Shores', hole: 3, score: 8, par: 5 },
    { player: 'AJ', course: 'Arcadian Shores', hole: 4, score: 7, par: 4 },
    { player: 'AJ', course: 'Arcadian Shores', hole: 5, score: 8, par: 4 },
    { player: 'AJ', course: 'Arcadian Shores', hole: 6, score: 6, par: 4 },
    { player: 'AJ', course: 'Arcadian Shores', hole: 7, score: 7, par: 4 },
    { player: 'AJ', course: 'Arcadian Shores', hole: 8, score: 3, par: 3 },
    { player: 'AJ', course: 'Arcadian Shores', hole: 9, score: 5, par: 4 },
    { player: 'AJ', course: 'Arcadian Shores', hole: 10, score: 7, par: 5 },
    { player: 'AJ', course: 'Arcadian Shores', hole: 11, score: 7, par: 4 },
    { player: 'AJ', course: 'Arcadian Shores', hole: 12, score: 7, par: 4 },
    { player: 'AJ', course: 'Arcadian Shores', hole: 13, score: 6, par: 4 },
    { player: 'AJ', course: 'Arcadian Shores', hole: 14, score: 5, par: 4 },
    { player: 'AJ', course: 'Arcadian Shores', hole: 15, score: 5, par: 3 },
    { player: 'AJ', course: 'Arcadian Shores', hole: 16, score: 7, par: 5 },
    { player: 'AJ', course: 'Arcadian Shores', hole: 17, score: 7, par: 3 },
    { player: 'AJ', course: 'Arcadian Shores', hole: 18, score: 6, par: 4 },
    
    { player: 'Ryan', course: 'Arcadian Shores', hole: 1, score: 4, par: 5 },
    { player: 'Ryan', course: 'Arcadian Shores', hole: 2, score: 5, par: 3 },
    { player: 'Ryan', course: 'Arcadian Shores', hole: 3, score: 6, par: 5 },
    { player: 'Ryan', course: 'Arcadian Shores', hole: 4, score: 5, par: 4 },
    { player: 'Ryan', course: 'Arcadian Shores', hole: 5, score: 6, par: 4 },
    { player: 'Ryan', course: 'Arcadian Shores', hole: 6, score: 6, par: 4 },
    { player: 'Ryan', course: 'Arcadian Shores', hole: 7, score: 6, par: 4 },
    { player: 'Ryan', course: 'Arcadian Shores', hole: 8, score: 4, par: 3 },
    { player: 'Ryan', course: 'Arcadian Shores', hole: 9, score: 5, par: 4 },
    { player: 'Ryan', course: 'Arcadian Shores', hole: 10, score: 7, par: 5 },
    { player: 'Ryan', course: 'Arcadian Shores', hole: 11, score: 6, par: 4 },
    { player: 'Ryan', course: 'Arcadian Shores', hole: 12, score: 7, par: 4 },
    { player: 'Ryan', course: 'Arcadian Shores', hole: 13, score: 6, par: 4 },
    { player: 'Ryan', course: 'Arcadian Shores', hole: 14, score: 5, par: 4 },
    { player: 'Ryan', course: 'Arcadian Shores', hole: 15, score: 5, par: 3 },
    { player: 'Ryan', course: 'Arcadian Shores', hole: 16, score: 7, par: 5 },
    { player: 'Ryan', course: 'Arcadian Shores', hole: 17, score: 4, par: 3 },
    { player: 'Ryan', course: 'Arcadian Shores', hole: 18, score: 5, par: 4 },
    
    { player: 'Todd', course: 'Arcadian Shores', hole: 1, score: 8, par: 5 },
    { player: 'Todd', course: 'Arcadian Shores', hole: 2, score: 5, par: 3 },
    { player: 'Todd', course: 'Arcadian Shores', hole: 3, score: 7, par: 5 },
    { player: 'Todd', course: 'Arcadian Shores', hole: 4, score: 7, par: 4 },
    { player: 'Todd', course: 'Arcadian Shores', hole: 5, score: 6, par: 4 },
    { player: 'Todd', course: 'Arcadian Shores', hole: 6, score: 4, par: 4 },
    { player: 'Todd', course: 'Arcadian Shores', hole: 7, score: 6, par: 4 },
    { player: 'Todd', course: 'Arcadian Shores', hole: 8, score: 5, par: 3 },
    { player: 'Todd', course: 'Arcadian Shores', hole: 9, score: 7, par: 4 },
    { player: 'Todd', course: 'Arcadian Shores', hole: 10, score: 8, par: 5 },
    { player: 'Todd', course: 'Arcadian Shores', hole: 11, score: 6, par: 4 },
    { player: 'Todd', course: 'Arcadian Shores', hole: 12, score: 10, par: 4 },
    { player: 'Todd', course: 'Arcadian Shores', hole: 13, score: 9, par: 4 },
    { player: 'Todd', course: 'Arcadian Shores', hole: 14, score: 6, par: 4 },
    { player: 'Todd', course: 'Arcadian Shores', hole: 15, score: 6, par: 3 },
    { player: 'Todd', course: 'Arcadian Shores', hole: 16, score: 9, par: 5 },
    { player: 'Todd', course: 'Arcadian Shores', hole: 17, score: 4, par: 3 },
    { player: 'Todd', course: 'Arcadian Shores', hole: 18, score: 8, par: 4 },
    
    { player: 'Doug', course: 'Arcadian Shores', hole: 1, score: 8, par: 5 },
    { player: 'Doug', course: 'Arcadian Shores', hole: 2, score: 5, par: 3 },
    { player: 'Doug', course: 'Arcadian Shores', hole: 3, score: 8, par: 5 },
    { player: 'Doug', course: 'Arcadian Shores', hole: 4, score: 6, par: 4 },
    { player: 'Doug', course: 'Arcadian Shores', hole: 5, score: 7, par: 4 },
    { player: 'Doug', course: 'Arcadian Shores', hole: 6, score: 8, par: 4 },
    { player: 'Doug', course: 'Arcadian Shores', hole: 7, score: 7, par: 4 },
    { player: 'Doug', course: 'Arcadian Shores', hole: 8, score: 5, par: 3 },
    { player: 'Doug', course: 'Arcadian Shores', hole: 9, score: 6, par: 4 },
    { player: 'Doug', course: 'Arcadian Shores', hole: 10, score: 8, par: 5 },
    { player: 'Doug', course: 'Arcadian Shores', hole: 11, score: 5, par: 4 },
    { player: 'Doug', course: 'Arcadian Shores', hole: 12, score: 8, par: 4 },
    { player: 'Doug', course: 'Arcadian Shores', hole: 13, score: 7, par: 4 },
    { player: 'Doug', course: 'Arcadian Shores', hole: 14, score: 5, par: 4 },
    { player: 'Doug', course: 'Arcadian Shores', hole: 15, score: 7, par: 3 },
    { player: 'Doug', course: 'Arcadian Shores', hole: 16, score: 9, par: 5 },
    { player: 'Doug', course: 'Arcadian Shores', hole: 17, score: 8, par: 3 },
    { player: 'Doug', course: 'Arcadian Shores', hole: 18, score: 8, par: 4 }
  ]

  constructor() {
    super()
    this.loadRealScores()
  }

  /**
   * Load real scores into cache by course
   */
  private loadRealScores(): void {
    this.realHoleScores.forEach(score => {
      if (!this.realScoresCache.has(score.course)) {
        this.realScoresCache.set(score.course, [])
      }
      this.realScoresCache.get(score.course)!.push(score)
    })
  }

  /**
   * Get comprehensive hole analytics for a course using real tournament data
   */
  getHoleAnalytics(courseName: CourseName): HoleAnalytics | null {
    // Check cache first
    if (this.analyticsCache.has(courseName)) {
      return this.analyticsCache.get(courseName)!
    }

    const holes = this.getCourseHoles(courseName)
    if (!holes) return null

    // Calculate all analytics using real data
    const holePerformances = this.calculateRealHolePerformances(courseName, holes)
    const courseDifficulty = this.analyzeCourseHifficulty(holePerformances, holes)
    const strategicInsights = this.generateStrategicInsights(holePerformances, holes)
    const riskRewardAnalysis = this.analyzeRiskReward(holePerformances, holes)
    const playerPerformance = this.analyzePlayerPerformanceInternal(holePerformances, holes)

    const analytics: HoleAnalytics = {
      course: courseName,
      holes: holePerformances,
      courseDifficulty,
      playerPerformance,
      strategicInsights,
      riskRewardAnalysis
    }

    // Cache the result
    this.analyticsCache.set(courseName, analytics)
    return analytics
  }

  /**
   * Get hole layout for a specific course
   */
  getCourseHoles(courseName: CourseName): HoleInfo[] | null {
    if (this.holeDataCache.has(courseName)) {
      return this.holeDataCache.get(courseName)!
    }

    const courseData = this.courseHoleData.get(courseName)
    if (!courseData) return null

    const holes: HoleInfo[] = courseData.map(data => ({
      number: data.hole,
      par: data.par,
      yardage: data.yardage,
      handicap: data.handicap,
      slopeContribution: 0, // Not used with real data
      holeType: this.getHoleType(data.par, data.yardage),
      riskRewardLevel: this.getRiskRewardLevel(data.handicap, data.par),
      strategicElements: [],
      description: `Hole ${data.hole} - Par ${data.par}, ${data.yardage} yards`
    }))

    this.holeDataCache.set(courseName, holes)
    return holes
  }

  /**
   * Get visualization data for hole-by-hole charts using real data
   */
  getHoleVisualizationData(courseName: CourseName): HoleVisualizationData[] {
    const analytics = this.getHoleAnalytics(courseName)
    if (!analytics) return []

    return analytics.holes.map(hole => {
      const playerScores = Array.from(hole.playerScores.entries()).map(([player, score]) => ({
        player,
        score: score.strokes,
        color: this.getPlayerColor(player)
      }))

      return {
        holeNumber: hole.holeNumber,
        par: hole.par,
        yardage: this.getHoleYardage(courseName, hole.holeNumber),
        handicap: this.getHoleHandicap(courseName, hole.holeNumber),
        playerScores,
        averageScore: hole.averageScore,
        difficulty: this.getDifficultyLabel(hole.averageScore - hole.par),
        birdieRate: hole.birdieFrequency,
        bogeyRate: hole.bogeyFrequency
      }
    })
  }

  /**
   * Calculate hole performances using real tournament data
   */
  private calculateRealHolePerformances(courseName: CourseName, holes: HoleInfo[]): HolePerformance[] {
    const courseScores = this.realScoresCache.get(courseName) || []
    const performances: HolePerformance[] = []

    holes.forEach(hole => {
      const holeScores = courseScores.filter(s => s.hole === hole.number)
      const playerScores = new Map<PlayerName, HoleScore>()
      
      let totalStrokes = 0
      let birdies = 0
      let pars = 0
      let bogeys = 0
      let doubleBogeyPlus = 0

      holeScores.forEach(scoreData => {
        const score: HoleScore = {
          strokes: scoreData.score,
          relativeToPar: scoreData.score - scoreData.par
        }
        
        playerScores.set(scoreData.player, score)
        totalStrokes += scoreData.score
        
        // Count scoring categories
        if (score.relativeToPar <= -1) birdies++
        else if (score.relativeToPar === 0) pars++
        else if (score.relativeToPar === 1) bogeys++
        else doubleBogeyPlus++
      })

      const playerCount = holeScores.length
      const averageScore = playerCount > 0 ? totalStrokes / playerCount : hole.par

      performances.push({
        holeNumber: hole.number,
        par: hole.par,
        playerScores,
        averageScore,
        birdieFrequency: playerCount > 0 ? (birdies / playerCount) * 100 : 0,
        parFrequency: playerCount > 0 ? (pars / playerCount) * 100 : 0,
        bogeyFrequency: playerCount > 0 ? (bogeys / playerCount) * 100 : 0,
        doubleBogeyPlusFrequency: playerCount > 0 ? (doubleBogeyPlus / playerCount) * 100 : 0,
        difficultyRating: this.calculateActualDifficulty(averageScore, hole.par, hole.handicap),
        scoringIndex: this.calculateScoringIndex(averageScore, hole.par, hole.handicap)
      })
    })

    return performances
  }

  /**
   * Get consistent player color
   */
  private getPlayerColor(playerName: PlayerName): string {
    return this.playerColors.get(playerName) || '#6b7280'
  }

  /**
   * Analyze course difficulty patterns
   */
  private analyzeCourseHifficulty(holes: HolePerformance[], holeInfos: HoleInfo[]): HoleDifficultyAnalysis {
    const holesWithHandicap = holes.map(hole => {
      const info = holeInfos.find(h => h.number === hole.holeNumber)!
      return {
        ...hole,
        handicap: info.handicap,
        avgOverPar: hole.averageScore - hole.par
      }
    })

    const sortedByDifficulty = [...holesWithHandicap].sort((a, b) => b.avgOverPar - a.avgOverPar)

    return {
      hardestHoles: sortedByDifficulty.slice(0, 5).map(h => ({
        hole: h.holeNumber,
        avgOverPar: h.avgOverPar,
        handicap: h.handicap
      })),
      easiestHoles: sortedByDifficulty.slice(-5).reverse().map(h => ({
        hole: h.holeNumber,
        avgOverPar: h.avgOverPar,
        handicap: h.handicap
      })),
      handicapAccuracy: holesWithHandicap.map(h => ({
        hole: h.holeNumber,
        expectedDifficulty: h.handicap,
        actualDifficulty: sortedByDifficulty.findIndex(s => s.holeNumber === h.holeNumber) + 1
      })),
      birdieOpportunities: sortedByDifficulty.filter(h => h.birdieFrequency > 10).map(h => ({
        hole: h.holeNumber,
        birdieRate: h.birdieFrequency,
        par: h.par
      })),
      troubleSpots: sortedByDifficulty.filter(h => h.doubleBogeyPlusFrequency > 20).map(h => ({
        hole: h.holeNumber,
        bogeyPlusRate: h.doubleBogeyPlusFrequency,
        par: h.par
      }))
    }
  }

  /**
   * Analyze individual player performance
   */
  private analyzePlayerPerformanceInternal(holePerformances: HolePerformance[], holes: HoleInfo[]): PlayerHolePerformance[] {
    const players: PlayerName[] = ['Mike', 'Jimbo', 'Dave', 'Ryan', 'Nixon', 'AJ', 'Todd', 'Doug']

    return players.map(playerName => {
      const holeScores = new Map<number, HoleScore>()
      const performanceByType = new Map<HoleType, number[]>()

      holePerformances.forEach(holePerf => {
        const holeInfo = holes.find(h => h.number === holePerf.holeNumber)!
        const playerScore = holePerf.playerScores.get(playerName)
        
        if (playerScore) {
          holeScores.set(holePerf.holeNumber, playerScore)
          
          if (!performanceByType.has(holeInfo.holeType)) {
            performanceByType.set(holeInfo.holeType, [])
          }
          performanceByType.get(holeInfo.holeType)!.push(playerScore.relativeToPar)
        }
      })

      const consistencyByType = new Map<HoleType, number>()
      const avgPerformanceByType = new Map<HoleType, number>()

      performanceByType.forEach((scores, holeType) => {
        if (scores.length > 0) {
          const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length
          const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length
          const standardDeviation = Math.sqrt(variance)
          
          avgPerformanceByType.set(holeType, avg)
          // Consistency rating: lower standard deviation = more consistent (higher rating)
          // Scale from 1-10 where 10 is most consistent (std dev near 0)
          const consistencyRating = Math.max(1, 10 - (standardDeviation * 2))
          consistencyByType.set(holeType, Math.round(consistencyRating * 10) / 10)
        }
      })

      const sortedPerformance = Array.from(avgPerformanceByType.entries()).sort((a, b) => a[1] - b[1])
      const strengths = sortedPerformance.slice(0, 2).map(([type]) => type)
      const weaknesses = sortedPerformance.slice(-2).map(([type]) => type)

      return {
        playerName,
        holeScores,
        strengths,
        weaknesses,
        consistencyByHoleType: consistencyByType,
        riskManagement: 'Balanced',
        optimalStrategy: new Map()
      }
    })
  }

  /**
   * Generate strategic insights for each hole
   */
  private generateStrategicInsights(holes: HolePerformance[], holeInfos: HoleInfo[]): StrategicInsight[] {
    return holes.map(hole => {
      const holeInfo = holeInfos.find(h => h.number === hole.holeNumber)!
      const avgOverPar = hole.averageScore - hole.par

      let insight: string
      let category: 'risk-reward' | 'course-management' | 'scoring-opportunity' | 'damage-control'
      let strategy: string

      if (hole.birdieFrequency > 15) {
        category = 'scoring-opportunity'
        insight = `Birdie rate (${hole.birdieFrequency.toFixed(1)}%) makes this a scoring hole`
        strategy = 'Attack when in good position'
      } else if (hole.doubleBogeyPlusFrequency > 40) {
        category = 'damage-control'
        insight = `High big number rate (${hole.doubleBogeyPlusFrequency.toFixed(1)}%) requires careful play`
        strategy = 'Play conservatively to avoid trouble'
      } else if (avgOverPar > 1.5) {
        category = 'damage-control'
        insight = `Averaging ${avgOverPar.toFixed(1)} over par - one of the toughest holes`
        strategy = 'Focus on making bogey or better'
      } else {
        category = 'course-management'
        insight = `Solid par opportunity with good management`
        strategy = 'Play smart and avoid trouble'
      }

      return {
        holeNumber: hole.holeNumber,
        par: hole.par,
        insight,
        category,
        recommendedStrategy: strategy,
        alternativeStrategies: []
      }
    })
  }

  /**
   * Analyze risk/reward characteristics
   */
  private analyzeRiskReward(holes: HolePerformance[], holeInfos: HoleInfo[]): RiskRewardAnalysis {
    const aggressiveHoles = holes
      .filter(hole => hole.birdieFrequency > 10 && hole.doubleBogeyPlusFrequency > 30)
      .map(hole => ({
        hole: hole.holeNumber,
        riskLevel: hole.doubleBogeyPlusFrequency / 10,
        avgReward: hole.birdieFrequency,
        avgPenalty: hole.doubleBogeyPlusFrequency,
        recommendedStrategy: 'Assess conditions before deciding'
      }))

    const conservativeHoles = holes
      .filter(hole => hole.parFrequency > 40)
      .map(hole => ({
        hole: hole.holeNumber,
        parProtectionRate: hole.parFrequency,
        bogeyAvoidanceStrategy: `${hole.parFrequency.toFixed(0)}% par rate - focus on solid contact`
      }))

    const scoringOpportunities = holes
      .filter(hole => hole.birdieFrequency > 10)
      .map(hole => ({
        hole: hole.holeNumber,
        birdieRate: hole.birdieFrequency,
        eagleRate: 0,
        optimalApproach: 'Good birdie chance with smart play'
      }))

    return {
      aggressiveHoles,
      conservativeHoles,
      scoringOpportunities
    }
  }

  // Helper methods
  private getHoleType(par: number, yardage: number): HoleType {
    if (par === 3) {
      return yardage < 160 ? 'short-par-3' : 'long-par-3'
    } else if (par === 4) {
      if (yardage < 350) return 'short-par-4'
      else if (yardage < 400) return 'medium-par-4'
      else return 'long-par-4'
    } else {
      return yardage < 500 ? 'short-par-5' : 'long-par-5'
    }
  }

  private getRiskRewardLevel(handicap: number, par: number): 'Conservative' | 'Moderate' | 'Aggressive' {
    if (handicap <= 6 && par >= 4) return 'Aggressive'
    else if (handicap >= 14) return 'Conservative'
    return 'Moderate'
  }

  private getDifficultyLabel(overPar: number): 'Easy' | 'Moderate' | 'Hard' | 'Very Hard' {
    if (overPar <= 0.3) return 'Easy'
    if (overPar <= 0.8) return 'Moderate'
    if (overPar <= 1.5) return 'Hard'
    return 'Very Hard'
  }

  private getHoleYardage(courseName: CourseName, holeNumber: number): number {
    const courseData = this.courseHoleData.get(courseName)
    const hole = courseData?.find(h => h.hole === holeNumber)
    return hole?.yardage || 400
  }

  private getHoleHandicap(courseName: CourseName, holeNumber: number): number {
    const courseData = this.courseHoleData.get(courseName)
    const hole = courseData?.find(h => h.hole === holeNumber)
    return hole?.handicap || 10
  }

  private calculateActualDifficulty(avgScore: number, par: number, handicap: number): number {
    const overPar = avgScore - par
    return Math.max(1, Math.min(18, Math.round(handicap + (overPar - 1) * 5)))
  }

  private calculateScoringIndex(avgScore: number, par: number, handicap: number): number {
    const expectedOverPar = handicap / 18 * 1.2
    const actualOverPar = avgScore - par
    return actualOverPar - expectedOverPar
  }
}