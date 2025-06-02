import React, { useState } from 'react'
import { getMatchPlayMatrix, getPlayerList } from '../../utils/data'
import { Trophy, Target, Zap } from 'lucide-react'

interface MatchPlayMatrixProps {
  title?: string
}

const MatchPlayMatrix: React.FC<MatchPlayMatrixProps> = ({ 
  title = "Head-to-Head Match Play Results" 
}) => {
  const matrix = getMatchPlayMatrix()
  const players = getPlayerList()
  const [hoveredCell, setHoveredCell] = useState<{player1: string, player2: string} | null>(null)

  // Calculate totals for each player
  const playerTotals = React.useMemo(() => {
    const totals: Record<string, { points: number, matches: number, winRate: number }> = {}
    
    players.forEach(player => {
      let points = 0
      let matches = 0
      
      players.forEach(opponent => {
        if (player !== opponent) {
          const pointsEarned = matrix[player]?.[opponent] || 0
          points += pointsEarned
          matches += 1
        }
      })
      
      totals[player] = {
        points,
        matches,
        winRate: matches > 0 ? (points / matches) * 100 : 0
      }
    })
    
    return totals
  }, [matrix, players])

  // Sort players by total points
  const sortedPlayers = React.useMemo(() => {
    return [...players].sort((a, b) => playerTotals[b].points - playerTotals[a].points)
  }, [players, playerTotals])

  const getColorIntensity = (points: number, maxPoints: number = 1) => {
    if (maxPoints === 0) return 'bg-gray-50'
    const intensity = points / maxPoints
    if (intensity >= 0.8) return 'bg-green-500 text-white'
    if (intensity >= 0.6) return 'bg-green-400 text-white'
    if (intensity >= 0.4) return 'bg-green-300'
    if (intensity >= 0.2) return 'bg-green-200'
    if (intensity > 0) return 'bg-green-100'
    return 'bg-gray-50'
  }

  const formatPoints = (points: number) => {
    return points % 1 === 0 ? points.toString() : points.toFixed(1)
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center px-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-100">{title}</h2>
        <p className="text-xs md:text-sm text-gray-400 mt-2">
          <span className="hidden sm:inline">Hover over cells to see detailed matchup results</span>
          <span className="sm:hidden">Tap cells for details</span>
        </p>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 px-4 md:px-0">
        {sortedPlayers.slice(0, 3).map((player, index) => {
          const total = playerTotals[player]
          const icons = [Trophy, Target, Zap]
          const colors = ['text-yellow-600', 'text-gray-600', 'text-orange-600']
          const bgColors = ['bg-yellow-50', 'bg-gray-50', 'bg-orange-50']
          const positions = ['🥇', '🥈', '🥉']
          const Icon = icons[index]
          
          return (
            <div key={player} className={`p-3 md:p-4 rounded-lg border border-gray-600 ${bgColors[index]}/10 bg-gray-800`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{positions[index]}</span>
                  <Icon className={`h-5 w-5 ${colors[index]}`} />
                </div>
                <div className="text-sm text-gray-500">#{index + 1}</div>
              </div>
              <div className="font-semibold text-gray-100 text-sm md:text-base">{player}</div>
              <div className="text-base md:text-lg font-bold text-gray-100">
                {formatPoints(total.points)} points
              </div>
              <div className="text-xs md:text-sm text-gray-400">
                {total.winRate.toFixed(1)}% win rate
              </div>
            </div>
          )
        })}
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto px-4 md:px-0">
        <div className="min-w-max md:min-w-full">
          <table className="w-full border-collapse bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-2 md:p-3 text-left font-semibold text-gray-100 border-b border-gray-600 text-xs md:text-sm">
                  Player
                </th>
                {sortedPlayers.map(opponent => (
                  <th 
                    key={opponent} 
                    className="p-1 md:p-2 text-center font-medium text-gray-100 border-b border-gray-600 text-xs"
                  >
                    <span className="hidden sm:inline">{opponent}</span>
                    <span className="sm:hidden">{opponent.substring(0, 3)}</span>
                  </th>
                ))}
                <th className="p-2 md:p-3 text-center font-semibold text-gray-100 border-b border-gray-600 text-xs md:text-sm">
                  Total
                </th>
                <th className="p-2 md:p-3 text-center font-semibold text-gray-100 border-b border-gray-600 text-xs md:text-sm">
                  Win %
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, rowIndex) => (
                <tr 
                  key={player} 
                  className={rowIndex % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}
                >
                  <td className="p-2 md:p-3 font-medium text-gray-100 border-b border-gray-600 bg-gray-700 text-xs md:text-sm">
                    <span className="hidden sm:inline">{player}</span>
                    <span className="sm:hidden">{player.substring(0, 6)}</span>
                  </td>
                  {sortedPlayers.map(opponent => {
                    const points = player === opponent ? null : (matrix[player]?.[opponent] || 0)
                    const isHovered = hoveredCell?.player1 === player && hoveredCell?.player2 === opponent
                    
                    return (
                      <td 
                        key={opponent}
                        className={`p-1 md:p-2 text-center border-b border-gray-600 cursor-pointer transition-all text-xs md:text-sm ${
                          player === opponent 
                            ? 'bg-gray-600 text-gray-400' 
                            : getColorIntensity(points || 0, 1)
                        } ${isHovered ? 'ring-2 ring-blue-400' : ''}`}
                        onMouseEnter={() => player !== opponent && setHoveredCell({player1: player, player2: opponent})}
                        onMouseLeave={() => setHoveredCell(null)}
                        title={
                          player === opponent 
                            ? 'Same player' 
                            : `${player} vs ${opponent}: ${formatPoints(points || 0)} points`
                        }
                      >
                        {player === opponent ? '—' : formatPoints(points || 0)}
                      </td>
                    )
                  })}
                  <td className="p-2 md:p-3 text-center font-semibold text-gray-100 border-b border-gray-600 bg-blue-900/30 text-xs md:text-sm">
                    {formatPoints(playerTotals[player].points)}
                  </td>
                  <td className="p-2 md:p-3 text-center font-medium text-gray-100 border-b border-gray-600 text-xs md:text-sm">
                    {playerTotals[player].winRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hovered Cell Details */}
      {hoveredCell && (
        <div className="p-4 bg-blue-900/20 rounded-lg border-l-4 border-blue-400 mx-4 md:mx-0">
          <h4 className="font-semibold text-blue-300 mb-2 text-sm md:text-base">
            {hoveredCell.player1} vs {hoveredCell.player2}
          </h4>
          <div className="text-xs md:text-sm text-blue-200">
            <p><strong>{hoveredCell.player1}</strong> earned <strong>
              {formatPoints(matrix[hoveredCell.player1]?.[hoveredCell.player2] || 0)}
            </strong> points against <strong>{hoveredCell.player2}</strong></p>
            <p className="mt-1 hidden md:block">
              In a head-to-head match play format, this represents the number of holes won or halved
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 mx-4 md:mx-0">
        <h4 className="font-semibold text-gray-100 mb-3 text-sm md:text-base">How to Read This Matrix</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
          <div>
            <p className="text-gray-300 mb-2">
              <strong>Reading the Matrix:</strong> <span className="hidden md:inline">Find a player in the left column, then look across to see how many points they earned against each opponent.</span><span className="md:hidden">Player vs opponent points.</span>
            </p>
            <p className="text-gray-300">
              <strong>Point System:</strong> <span className="hidden sm:inline">1 point for winning a hole, 0.5 points for tying a hole, 0 points for losing a hole.</span><span className="sm:hidden">1=win, 0.5=tie, 0=loss</span>
            </p>
          </div>
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded"></div>
              <span className="text-gray-300">High (0.8-1.0)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-green-300 rounded"></div>
              <span className="text-gray-300">Medium (0.4-0.8)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-green-100 rounded"></div>
              <span className="text-gray-300">Low (0.1-0.4)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-600 border border-gray-500 rounded"></div>
              <span className="text-gray-300">None (0)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchPlayMatrix