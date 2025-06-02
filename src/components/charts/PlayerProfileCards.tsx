import React, { useState } from 'react'
import { data, getPlayerList } from '../../utils/data'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Award,
  BarChart3,
  MapPin,
  Calendar,
  Users
} from 'lucide-react'

interface PlayerProfileCardsProps {
  columns?: number
  showDetailedStats?: boolean
}

const PlayerProfileCards: React.FC<PlayerProfileCardsProps> = ({ 
  columns = 3,
  showDetailedStats = true 
}) => {
  const players = getPlayerList()
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)

  const getPlayerHighlights = (playerName: string) => {
    const playerStats = data.player_statistics[playerName]
    const leaderboardPosition = data.tournament_summary.leaderboard.findIndex(p => p.player === playerName) + 1
    const highlights = []

    // Tournament finish
    if (leaderboardPosition === 1) {
      highlights.push({ 
        type: 'champion', 
        icon: Trophy, 
        text: 'Tournament Champion!', 
        color: 'text-yellow-400',
        bg: 'bg-yellow-900'
      })
    } else if (leaderboardPosition <= 3) {
      highlights.push({ 
        type: 'podium', 
        icon: Award, 
        text: `${leaderboardPosition === 2 ? '2nd' : '3rd'} Place Finish`, 
        color: 'text-gray-300',
        bg: 'bg-gray-700'
      })
    }

    // Consistency highlights
    if (playerStats?.consistency.consistency_rating === 'Excellent') {
      highlights.push({ 
        type: 'consistent', 
        icon: Target, 
        text: 'Most Consistent Player', 
        color: 'text-blue-400',
        bg: 'bg-blue-900'
      })
    }

    // Performance improvement/decline
    const dailyScores = Object.values(playerStats?.daily_performance || {}).map(day => day.score)
    if (dailyScores.length >= 2) {
      const improvement = dailyScores[0] - dailyScores[dailyScores.length - 1]
      if (improvement > 5) {
        highlights.push({ 
          type: 'improvement', 
          icon: TrendingUp, 
          text: `Improved ${improvement} strokes`, 
          color: 'text-green-400',
          bg: 'bg-green-900'
        })
      } else if (improvement < -5) {
        highlights.push({ 
          type: 'decline', 
          icon: TrendingDown, 
          text: `Tough finish`, 
          color: 'text-red-400',
          bg: 'bg-red-900'
        })
      }
    }

    // Match play performance
    if (playerStats?.match_play_performance.win_percentage > 65) {
      highlights.push({ 
        type: 'match_play', 
        icon: Zap, 
        text: 'Match Play Dominator', 
        color: 'text-purple-400',
        bg: 'bg-purple-900'
      })
    }

    // Best course performance
    const bestCourse = Object.entries(playerStats?.course_performance || {})
      .sort((a, b) => a[1].average_score - b[1].average_score)[0]
    
    if (bestCourse && bestCourse[1].performance_rating !== 'Struggled') {
      highlights.push({ 
        type: 'course', 
        icon: MapPin, 
        text: `Mastered ${bestCourse[0]}`, 
        color: 'text-indigo-400',
        bg: 'bg-indigo-900'
      })
    }

    return highlights.slice(0, 3) // Show top 3 highlights
  }

  const getPlayerGrade = (playerName: string) => {
    const playerStats = data.player_statistics[playerName]
    const leaderboardPosition = data.tournament_summary.leaderboard.findIndex(p => p.player === playerName) + 1
    
    if (leaderboardPosition === 1) return { grade: 'A+', color: 'text-green-600' }
    if (leaderboardPosition <= 3) return { grade: 'A', color: 'text-green-500' }
    if (leaderboardPosition <= 5) return { grade: 'B+', color: 'text-blue-600' }
    if (leaderboardPosition <= 6) return { grade: 'B', color: 'text-blue-500' }
    return { grade: 'C+', color: 'text-orange-600' }
  }

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-100">Player Profiles</h2>
        <p className="text-sm text-gray-400 mt-2">
          Comprehensive stats and performance highlights for each player
        </p>
      </div>

      {/* Player Cards Grid */}
      <div className={`grid ${gridColsClass} gap-6`}>
        {players.map(playerName => {
          const playerStats = data.player_statistics[playerName]
          const leaderboardEntry = data.tournament_summary.leaderboard.find(p => p.player === playerName)
          const position = data.tournament_summary.leaderboard.findIndex(p => p.player === playerName) + 1
          const highlights = getPlayerHighlights(playerName)
          const grade = getPlayerGrade(playerName)

          return (
            <div 
              key={playerName}
              className={`bg-gray-800 rounded-xl border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden ${
                selectedPlayer === playerName ? 'ring-2 ring-golf-lightgreen' : ''
              }`}
              onClick={() => setSelectedPlayer(selectedPlayer === playerName ? null : playerName)}
            >
              {/* Player Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-100">{playerName}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-400">#{position}</span>
                      <span className={`text-lg font-bold ${grade.color}`}>{grade.grade}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-100">
                      {leaderboardEntry?.total_score}
                    </div>
                    <div className="text-sm text-gray-400">total strokes</div>
                  </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-gray-100">
                      {leaderboardEntry?.scoring_average.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-400">Average</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      {playerStats?.basic_stats.best_round}
                    </div>
                    <div className="text-xs text-gray-400">Best Round</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-600">
                      {playerStats?.consistency.score_standard_deviation.toFixed(1)}σ
                    </div>
                    <div className="text-xs text-gray-400">Consistency</div>
                  </div>
                </div>
              </div>

              {/* Performance Highlights */}
              <div className="px-6 pb-4">
                <div className="space-y-2">
                  {highlights.map((highlight, index) => {
                    const Icon = highlight.icon
                    return (
                      <div 
                        key={index}
                        className={`flex items-center space-x-2 p-2 rounded-lg ${highlight.bg}`}
                      >
                        <Icon className={`h-4 w-4 ${highlight.color}`} />
                        <span className={`text-sm font-medium ${highlight.color}`}>
                          {highlight.text}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Detailed Stats (expandable) */}
              {selectedPlayer === playerName && showDetailedStats && (
                <div className="border-t border-gray-700 bg-gray-850 p-6">
                  <div className="space-y-4">
                    {/* Performance Breakdown */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Performance Breakdown
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pars:</span>
                          <span className="font-medium">{playerStats?.detailed_performance.pars}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bogeys:</span>
                          <span className="font-medium">{playerStats?.detailed_performance.bogeys}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Par %:</span>
                          <span className="font-medium">{playerStats?.detailed_performance.par_or_better_percentage.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Match Play:</span>
                          <span className="font-medium">{playerStats?.match_play_performance.win_percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Daily Performance */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Daily Scores
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(playerStats?.daily_performance || {}).map(([day, performance]) => (
                          <div key={day} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              {day.replace('_', ' ').toUpperCase()}: {performance.course}
                            </span>
                            <span className="font-medium">
                              {performance.score} (+{performance.relative_to_par})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Course Performance */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Course Ratings
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(playerStats?.course_performance || {}).map(([course, performance]) => (
                          <div key={course} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{course}:</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{performance.average_score.toFixed(0)}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                performance.performance_rating === 'Excelled' ? 'bg-green-100 text-green-700' :
                                performance.performance_rating === 'Solid' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {performance.performance_rating}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Click hint */}
              <div className="px-6 pb-4">
                <div className="text-xs text-gray-500 text-center">
                  {selectedPlayer === playerName ? 'Click to collapse' : 'Click to expand details'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Comparison */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-750 rounded-lg p-6 border border-gray-700">
        <h3 className="font-semibold text-gray-100 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Quick Player Comparison
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-semibold text-gray-100">Best Average:</div>
            <div className="text-green-400">
              {data.tournament_summary.leaderboard[0].player} - {data.tournament_summary.leaderboard[0].scoring_average.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-100">Most Consistent:</div>
            <div className="text-blue-400">
              {players.reduce((best, player) => {
                const current = data.player_statistics[player]?.consistency.score_standard_deviation || Infinity
                const bestVal = data.player_statistics[best]?.consistency.score_standard_deviation || Infinity
                return current < bestVal ? player : best
              })}
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-100">Match Play King:</div>
            <div className="text-purple-400">
              {players.reduce((best, player) => {
                const current = data.player_statistics[player]?.match_play_performance.total_points || 0
                const bestVal = data.player_statistics[best]?.match_play_performance.total_points || 0
                return current > bestVal ? player : best
              })}
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-100">Lowest Round:</div>
            <div className="text-green-400">
              {players.reduce((best, player) => {
                const current = data.player_statistics[player]?.basic_stats.best_round || Infinity
                const bestVal = data.player_statistics[best]?.basic_stats.best_round || Infinity
                return current < bestVal ? player : best
              })} - {Math.min(...players.map(p => data.player_statistics[p]?.basic_stats.best_round || Infinity))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayerProfileCards