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