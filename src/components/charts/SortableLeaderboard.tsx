import React, { useState, useMemo } from 'react'
import { useLeaderboard, useTournamentSummary } from '../../hooks'
import { ChevronUp, ChevronDown, Trophy, Target, TrendingUp, Zap } from 'lucide-react'
import { SortConfig, LeaderboardEntry } from '../../models/tournament.types'

interface SortableLeaderboardProps {
  title?: string
  height?: number
}

type SortField = keyof LeaderboardEntry
type SortDirection = 'asc' | 'desc'

const SortableLeaderboard: React.FC<SortableLeaderboardProps> = ({ 
  title = "Tournament Leaderboard",
  height = 600
}) => {
  const [sortField, setSortField] = useState<SortField>('position')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const { quickStats } = useTournamentSummary()

  // Create sort configuration and get sorted leaderboard
  const sortConfig: SortConfig<LeaderboardEntry> = useMemo(() => ({
    key: sortField,
    direction: sortDirection
  }), [sortField, sortDirection])
  
  const leaderboardData = useLeaderboard(sortConfig)

  // Data is already sorted by the service layer
  const sortedData = leaderboardData

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      // Default direction for each field
      setSortDirection(
        field === 'bestRound' || field === 'totalScore' || field === 'consistency' 
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-xl md:text-2xl font-bold text-gray-100">{title}</h2>
        <div className="text-xs md:text-sm text-gray-400">
          <span className="hidden sm:inline">Click columns to sort • </span>{leaderboardData.length} players
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight: height }}>
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-700 sticky top-0 z-10">
              <tr>
                <th 
                  className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-200 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('position')}
                >
                  <div className="flex items-center space-x-1">
                    <span className="text-xs md:text-sm">Pos</span>
                    {getSortIcon('position')}
                  </div>
                </th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-200">
                  <span className="text-xs md:text-sm">Player</span>
                </th>
                <th 
                  className="px-2 md:px-4 py-2 md:py-3 text-center font-semibold text-gray-200 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('totalScore')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-xs md:text-sm">Total</span>
                    {getSortIcon('totalScore')}
                  </div>
                </th>
                <th 
                  className="px-2 md:px-4 py-2 md:py-3 text-center font-semibold text-gray-200 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('average')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-xs md:text-sm">Avg</span>
                    {getSortIcon('average')}
                  </div>
                </th>
                <th 
                  className="px-2 md:px-4 py-2 md:py-3 text-center font-semibold text-gray-200 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('bestRound')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-xs md:text-sm">Best</span>
                    {getSortIcon('bestRound')}
                  </div>
                </th>
                <th 
                  className="px-2 md:px-4 py-2 md:py-3 text-center font-semibold text-gray-200 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('worstRound')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-xs md:text-sm">Worst</span>
                    {getSortIcon('worstRound')}
                  </div>
                </th>
                <th 
                  className="px-2 md:px-4 py-2 md:py-3 text-center font-semibold text-gray-200 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('consistency')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-xs md:text-sm">Cons.</span>
                    {getSortIcon('consistency')}
                  </div>
                </th>
                <th 
                  className="px-2 md:px-4 py-2 md:py-3 text-center font-semibold text-gray-200 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleSort('matchPlayPoints')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-xs md:text-sm">Match</span>
                    {getSortIcon('matchPlayPoints')}
                  </div>
                </th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-center font-semibold text-gray-200">
                  <span className="text-xs md:text-sm">Team</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((player, index) => (
                <tr 
                  key={player.player}
                  className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors ${getRowBgColor(player.position)}`}
                >
                  <td className="px-2 md:px-4 py-2 md:py-4">
                    <div className="flex items-center space-x-1 md:space-x-2">
                      {getPositionIcon(player.position, player.player)}
                      <span className="font-semibold text-gray-100 text-sm md:text-base">
                        #{player.position}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 md:px-4 py-2 md:py-4">
                    <div>
                      <div className="font-semibold text-gray-100 text-sm md:text-base">{player.player}</div>
                      <div className="text-xs text-gray-400 hidden md:block">
                        Consistency: {player.consistency.toFixed(1)}σ
                      </div>
                    </div>
                  </td>
                  <td className="px-2 md:px-4 py-2 md:py-4 text-center">
                    <div className="font-bold text-gray-100 text-sm md:text-base">{player.totalScore}</div>
                    <div className="text-xs text-gray-400 hidden md:block">
                      Total strokes
                    </div>
                  </td>
                  <td className="px-2 md:px-4 py-2 md:py-4 text-center">
                    <div className="font-semibold text-gray-100 text-sm md:text-base">
                      {player.average.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-400 hidden md:block">
                      Per round
                    </div>
                  </td>
                  <td className="px-2 md:px-4 py-2 md:py-4 text-center">
                    <div className="font-semibold text-green-400 text-sm md:text-base">
                      {player.bestRound}
                    </div>
                    <div className="text-xs text-gray-400 hidden md:block">lowest</div>
                  </td>
                  <td className="px-2 md:px-4 py-2 md:py-4 text-center">
                    <div className="font-semibold text-red-400 text-sm md:text-base">
                      {player.worstRound}
                    </div>
                    <div className="text-xs text-gray-400 hidden md:block">highest</div>
                  </td>
                  <td className="px-2 md:px-4 py-2 md:py-4 text-center">
                    <div className="font-semibold text-blue-400 text-sm md:text-base">
                      {player.consistency.toFixed(1)}σ
                    </div>
                    <div className="text-xs text-gray-400 hidden md:block">
                      std dev
                    </div>
                  </td>
                  <td className="px-2 md:px-4 py-2 md:py-4 text-center">
                    <div className="font-semibold text-purple-400 text-sm md:text-base">
                      {player.matchPlayPoints} pts
                    </div>
                    <div className="text-xs text-gray-400 hidden md:block">
                      {player.matchPlayPercentage.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-2 md:px-4 py-2 md:py-4 text-center">
                    <div className="font-semibold text-indigo-400 text-sm md:text-base">
                      {player.team.split(' ')[0]}
                    </div>
                    <div className="text-xs text-gray-400 hidden md:block">
                      team
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 p-3 md:p-4 bg-gray-800 rounded-lg border border-gray-700">
        {quickStats.map((stat) => (
          <div key={stat.stat} className="text-center">
            <div className={`text-base md:text-lg font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SortableLeaderboard