import React, { useState, useMemo } from 'react'
import { data } from '../../utils/data'
import { ChevronUp, ChevronDown, Trophy, Target, TrendingUp, Zap } from 'lucide-react'

interface SortableLeaderboardProps {
  title?: string
  height?: number
}

type SortField = 'position' | 'total_score' | 'average' | 'best_round' | 'worst_round' | 'consistency' | 'match_play' | 'best_course'
type SortDirection = 'asc' | 'desc'

const SortableLeaderboard: React.FC<SortableLeaderboardProps> = ({ 
  title = "Tournament Leaderboard",
  height = 600
}) => {
  const [sortField, setSortField] = useState<SortField>('position')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Prepare leaderboard data with all statistics
  const leaderboardData = useMemo(() => {
    return data.tournament_summary.leaderboard.map((entry, index) => {
      const playerStats = data.player_statistics[entry.player]
      
      return {
        position: index + 1,
        player: entry.player,
        total_score: entry.total_score,
        average: entry.scoring_average,
        best_round: playerStats?.basic_stats.best_round || 0,
        worst_round: playerStats?.basic_stats.worst_round || 0,
        consistency: playerStats?.consistency.score_standard_deviation || 0,
        consistency_rating: playerStats?.consistency.consistency_rating || 'N/A',
        match_play_points: playerStats?.match_play_performance.total_points || 0,
        match_play_percentage: playerStats?.match_play_performance.win_percentage || 0,
        relative_to_par: playerStats?.basic_stats.average_relative_to_par || 0,
        birdies: playerStats?.detailed_performance.birdies || 0,
        pars: playerStats?.detailed_performance.pars || 0,
        bogeys: playerStats?.detailed_performance.bogeys || 0,
        par_percentage: playerStats?.detailed_performance.par_or_better_percentage || 0,
        best_course: (() => {
          const courses = Object.entries(playerStats?.course_performance || {})
          if (courses.length === 0) return { name: 'N/A', score: 0 }
          const best = courses.reduce((best, [name, stats]) => {
            return stats.average_score < best[1].average_score ? [name, stats] : best
          })
          return { name: best[0], score: best[1].average_score }
        })()
      }
    })
  }, [])

  // Sort data based on current sort field and direction
  const sortedData = useMemo(() => {
    const sorted = [...leaderboardData].sort((a, b) => {
      let aVal, bVal
      
      switch (sortField) {
        case 'position':
          aVal = a.position
          bVal = b.position
          break
        case 'total_score':
          aVal = a.total_score
          bVal = b.total_score
          break
        case 'average':
          aVal = a.average
          bVal = b.average
          break
        case 'best_round':
          aVal = a.best_round
          bVal = b.best_round
          break
        case 'worst_round':
          aVal = a.worst_round
          bVal = b.worst_round
          break
        case 'consistency':
          aVal = a.consistency
          bVal = b.consistency
          break
        case 'match_play':
          aVal = a.match_play_points
          bVal = b.match_play_points
          break
        case 'best_course':
          aVal = a.best_course.score
          bVal = b.best_course.score
          break
        default:
          aVal = a.position
          bVal = b.position
      }

      if (sortDirection === 'asc') {
        return aVal - bVal
      } else {
        return bVal - aVal
      }
    })
    
    return sorted
  }, [leaderboardData, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      // Default direction for each field
      setSortDirection(
        field === 'best_round' || field === 'total_score' || field === 'consistency' 
          ? 'asc' 
          : 'desc'
      )
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />
  }

  const getPositionIcon = (position: number, player: string) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-400" />
    if (position === 2) return <Target className="h-5 w-5 text-gray-400" />
    if (position === 3) return <Zap className="h-5 w-5 text-orange-400" />
    return null
  }

  const getRowBgColor = (position: number) => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-900/20 to-yellow-800/20'
    if (position === 2) return 'bg-gradient-to-r from-gray-700/20 to-gray-600/20'
    if (position === 3) return 'bg-gradient-to-r from-orange-900/20 to-orange-800/20'
    return ''
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">{title}</h2>
        <div className="text-sm text-gray-400">
          Click columns to sort • {leaderboardData.length} players
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight: height }}>
          <table className="w-full">
            <thead className="bg-gray-700 sticky top-0 z-10">
              <tr>
                <th 
                  className="px-4 py-3 text-left font-semibold text-gray-200 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('position')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Pos</span>
                    {getSortIcon('position')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-200">
                  Player
                </th>
                <th 
                  className="px-4 py-3 text-center font-semibold text-gray-200 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('total_score')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Total</span>
                    {getSortIcon('total_score')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-center font-semibold text-gray-200 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('average')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Average</span>
                    {getSortIcon('average')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-center font-semibold text-gray-200 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('best_round')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Best</span>
                    {getSortIcon('best_round')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-center font-semibold text-gray-200 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('worst_round')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Worst</span>
                    {getSortIcon('worst_round')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-center font-semibold text-gray-200 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('consistency')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Consistency</span>
                    {getSortIcon('consistency')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-center font-semibold text-gray-200 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('match_play')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Match Play</span>
                    {getSortIcon('match_play')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-center font-semibold text-gray-200 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('best_course')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Best Course</span>
                    {getSortIcon('best_course')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((player, index) => (
                <tr 
                  key={player.player}
                  className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors ${getRowBgColor(player.position)}`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      {getPositionIcon(player.position, player.player)}
                      <span className="font-semibold text-gray-100">
                        #{player.position}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-semibold text-gray-100">{player.player}</div>
                      <div className="text-xs text-gray-400">
                        {player.consistency_rating} consistency
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="font-bold text-gray-100">{player.total_score}</div>
                    <div className="text-xs text-gray-400">
                      +{player.relative_to_par.toFixed(0)} total
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="font-semibold text-gray-100">
                      {player.average.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-400">
                      +{(player.relative_to_par / 3).toFixed(1)} per round
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="font-semibold text-green-400">
                      {player.best_round}
                    </div>
                    <div className="text-xs text-gray-400">lowest</div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="font-semibold text-red-400">
                      {player.worst_round}
                    </div>
                    <div className="text-xs text-gray-400">highest</div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="font-semibold text-blue-400">
                      {player.consistency.toFixed(1)}σ
                    </div>
                    <div className="text-xs text-gray-400">
                      {player.consistency_rating.toLowerCase()}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="font-semibold text-purple-400">
                      {player.match_play_points} pts
                    </div>
                    <div className="text-xs text-gray-400">
                      {player.match_play_percentage.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="font-semibold text-indigo-400">
                      {player.best_course.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {player.best_course.score.toFixed(0)} avg
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-100">
            {Math.min(...leaderboardData.map(p => p.best_round))}
          </div>
          <div className="text-sm text-gray-400">Tournament Low</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-100">
            {(leaderboardData.reduce((sum, p) => sum + p.average, 0) / leaderboardData.length).toFixed(1)}
          </div>
          <div className="text-sm text-gray-400">Field Average</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-100">
            {leaderboardData.find(p => p.position === 1)?.total_score}
          </div>
          <div className="text-sm text-gray-400">Winning Score</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-100">
            {(leaderboardData[leaderboardData.length - 1].total_score - leaderboardData[0].total_score)}
          </div>
          <div className="text-sm text-gray-400">Score Spread</div>
        </div>
      </div>
    </div>
  )
}

export default SortableLeaderboard