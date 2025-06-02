// Comprehensive TypeScript interfaces for BWGC Golf Tournament data models

// Base types
export type PlayerName = string
export type TeamName = string
export type CourseName = string
export type DayNumber = 1 | 2 | 3 | 4

// Course-related interfaces
export interface CourseInfo {
  name: CourseName
  par: number
  slope: number
  rating: number
  yardage: number
  format: string
  day: DayNumber
  holes?: HoleInfo[]
}

// Hole-by-hole analysis interfaces
export interface HoleInfo {
  number: number
  par: number
  yardage: number
  handicap: number // 1-18 difficulty ranking
  slopeContribution: number // portion of course slope rating
  holeType: HoleType
  riskRewardLevel: 'Conservative' | 'Moderate' | 'Aggressive'
  strategicElements: string[] // ['water', 'bunkers', 'dogleg-left', etc.]
  description?: string
}

export type HoleType = 
  | 'short-par-3'    // Under 150 yards
  | 'long-par-3'     // 150+ yards  
  | 'short-par-4'    // Under 350 yards (driveable)
  | 'medium-par-4'   // 350-420 yards
  | 'long-par-4'     // 420+ yards
  | 'short-par-5'    // Under 500 yards (reachable)
  | 'long-par-5'     // 500+ yards

export interface HolePerformance {
  holeNumber: number
  par: number
  playerScores: Map<PlayerName, HoleScore>
  averageScore: number
  birdieFrequency: number
  parFrequency: number
  bogeyFrequency: number
  doubleBogeyPlusFrequency: number
  difficultyRating: number // 1-18 actual difficulty vs handicap
  scoringIndex: number // how much harder/easier than handicap suggests
}

export interface HoleScore {
  strokes: number
  relativeToPar: number
  putts?: number
  fairwayHit?: boolean
  greenInRegulation?: boolean
  chipsAndPitches?: number
}

export interface CourseStatistics {
  averageScore: number
  averageOverPar: number
  bestScore: number
  worstScore: number
  roundsPlayed: number
  difficultyRank: number
}

export interface CoursePerformance {
  courseName: CourseName
  playerScores: Map<PlayerName, PlayerCoursePerformance>
}

export interface PlayerCoursePerformance {
  averageScore: number
  bestRound: number
  worstRound?: number
  performanceRating: 'Excelled' | 'Solid' | 'Struggled' | 'N/A'
  relativeTopar: number
}

// Player-related interfaces
export interface PlayerBasicStats {
  totalScore: number
  scoringAverage: number
  bestRound: number
  worstRound: number
  roundsPlayed: number
}

export interface PlayerConsistencyStats {
  standardDeviation: number
  consistencyRating: number
  scoreSpread: number
}

export interface PlayerScoringStats {
  birdies: number
  pars: number
  bogeys: number
  doubleBogeys: number
  tripleBogeys: number
  bigNumbers: number
  underParPercentage: number
  parOrBetterPercentage: number
}

export interface MatchPlayPerformance {
  totalPoints: number
  possiblePoints: number
  winPercentage: number
  matchUps: Map<PlayerName, number> // opponent -> points earned
}

export interface PlayerDailyPerformance {
  day: DayNumber
  course: CourseName
  score: number
  toPar: number
  format: string
}

export interface PlayerStatistics {
  name: PlayerName
  team: TeamName
  position: number
  basicStats: PlayerBasicStats
  consistencyStats: PlayerConsistencyStats
  scoringStats: PlayerScoringStats
  matchPlayPerformance: MatchPlayPerformance
  dailyPerformances: PlayerDailyPerformance[]
  coursePerformances: Map<CourseName, PlayerCoursePerformance>
}

// Team-related interfaces
export interface TeamStatistics {
  name: TeamName
  members: PlayerName[]
  totalScore: number
  averageScore: number
  matchPlayPoints: number
  matchPlayPercentage: number
  teamPoints: number // overall tournament points
  memberContributions: Map<PlayerName, TeamMemberContribution>
  bestRound: number
  worstRound: number
  consistencyRating: number
}

export interface TeamMemberContribution {
  playerName: PlayerName
  totalScore: number
  averageScore: number
  matchPlayPoints: number
  bestRound: number
  contribution: number // percentage of team total
}

// Tournament-related interfaces
export interface TournamentSummary {
  name: string
  dates: string
  location: string
  totalRounds: number
  totalPlayers: number
  teams: TeamName[]
  courses: CourseName[]
  formats: string[]
  champion: PlayerName
  teamChampion: TeamName
}

export interface TournamentStatistics {
  lowestRound: { player: PlayerName, score: number, course: CourseName }
  highestRound: { player: PlayerName, score: number, course: CourseName }
  mostConsistent: PlayerName
  mostImproved: PlayerName
  matchPlayChampion: PlayerName
  courseChampions: Map<CourseName, PlayerName>
}

export interface TournamentInsight {
  id: string
  category: InsightCategory
  title: string
  description: string
  value: string | number
  icon?: string
}

export type InsightCategory = 
  | 'consistency' 
  | 'achievement' 
  | 'matchPlay' 
  | 'course' 
  | 'team' 
  | 'improvement'
  | 'scoring'
  | 'competition'
  | 'record'
  | 'superlative'
  | 'adversity'

// Achievement-related interfaces
export interface Achievement {
  id: string
  playerName: PlayerName
  title: string
  description: string
  category: AchievementCategory
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export type AchievementCategory = 
  | 'scoring'
  | 'consistency'
  | 'improvement'
  | 'matchPlay'
  | 'course'
  | 'special'

// Presentation-related interfaces (for UI components)
export interface LeaderboardEntry {
  position: number
  player: PlayerName
  team: TeamName
  totalScore: number
  average: number
  bestRound: number
  worstRound: number
  consistency: number
  matchPlayPoints: number
  matchPlayPercentage: number
  trend?: 'up' | 'down' | 'steady'
}

export interface ChartDataPoint {
  label: string
  value: number
  category?: string
  metadata?: Record<string, any>
}

export interface PerformanceColor {
  text: string
  background: string
}

// Utility types
export interface SortConfig<T> {
  key: keyof T
  direction: 'asc' | 'desc'
}

export interface FilterConfig {
  teams?: TeamName[]
  courses?: CourseName[]
  days?: DayNumber[]
  minScore?: number
  maxScore?: number
}

// Raw data interface (from JSON)
export interface RawTournamentData {
  tournament_summary: any
  player_statistics: Record<PlayerName, any>
  performance_trends: Record<PlayerName, any>
  course_analysis: any
  tournament_insights: any
}

// Hole-by-hole analysis interfaces
export interface HoleAnalytics {
  course: CourseName
  holes: HolePerformance[]
  courseDifficulty: HoleDifficultyAnalysis
  playerPerformance: PlayerHolePerformance[]
  strategicInsights: StrategicInsight[]
  riskRewardAnalysis: RiskRewardAnalysis
}

export interface HoleDifficultyAnalysis {
  hardestHoles: { hole: number, avgOverPar: number, handicap: number }[]
  easiestHoles: { hole: number, avgOverPar: number, handicap: number }[]
  handicapAccuracy: { hole: number, expectedDifficulty: number, actualDifficulty: number }[]
  birdieOpportunities: { hole: number, birdieRate: number, par: number }[]
  troubleSpots: { hole: number, bogeyPlusRate: number, par: number }[]
}

export interface PlayerHolePerformance {
  playerName: PlayerName
  holeScores: Map<number, HoleScore>
  strengths: HoleType[]
  weaknesses: HoleType[]
  consistencyByHoleType: Map<HoleType, number>
  riskManagement: 'Conservative' | 'Balanced' | 'Aggressive'
  optimalStrategy: Map<number, string> // hole -> strategy recommendation
}

export interface StrategicInsight {
  holeNumber: number
  par: number
  insight: string
  category: 'risk-reward' | 'course-management' | 'scoring-opportunity' | 'damage-control'
  recommendedStrategy: string
  alternativeStrategies?: string[]
}

export interface RiskRewardAnalysis {
  aggressiveHoles: {
    hole: number
    riskLevel: number
    avgReward: number
    avgPenalty: number
    recommendedStrategy: string
  }[]
  conservativeHoles: {
    hole: number
    parProtectionRate: number
    bogeyAvoidanceStrategy: string
  }[]
  scoringOpportunities: {
    hole: number
    birdieRate: number
    eagleRate: number
    optimalApproach: string
  }[]
}

export interface HoleVisualizationData {
  holeNumber: number
  par: number
  yardage: number
  handicap: number
  playerScores: { player: PlayerName, score: number, color: string }[]
  averageScore: number
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Very Hard'
  birdieRate: number
  bogeyRate: number
}