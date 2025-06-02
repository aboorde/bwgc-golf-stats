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
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-2">
          Hover over cells to see detailed matchup results
        </p>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedPlayers.slice(0, 3).map((player, index) => {
          const total = playerTotals[player]
          const icons = [Trophy, Target, Zap]
          const colors = ['text-yellow-600', 'text-gray-600', 'text-orange-600']
          const bgColors = ['bg-yellow-50', 'bg-gray-50', 'bg-orange-50']
          const positions = ['🥇', '🥈', '🥉']
          const Icon = icons[index]
          
          return (
            <div key={player} className={`p-4 rounded-lg border ${bgColors[index]}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{positions[index]}</span>
                  <Icon className={`h-5 w-5 ${colors[index]}`} />
                </div>
                <div className="text-sm text-gray-500">#{index + 1}</div>
              </div>
              <div className="font-semibold text-gray-900">{player}</div>
              <div className="text-lg font-bold text-gray-800">
                {formatPoints(total.points)} points
              </div>
              <div className="text-sm text-gray-600">
                {total.winRate.toFixed(1)}% win rate
              </div>
            </div>
          )
        })}
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left font-semibold text-gray-700 border-b">
                  Player
                </th>
                {sortedPlayers.map(opponent => (
                  <th 
                    key={opponent} 
                    className="p-2 text-center font-medium text-gray-700 border-b text-xs"
                  >
                    {opponent}
                  </th>
                ))}
                <th className="p-3 text-center font-semibold text-gray-700 border-b">
                  Total
                </th>
                <th className="p-3 text-center font-semibold text-gray-700 border-b">
                  Win %
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, rowIndex) => (
                <tr 
                  key={player} 
                  className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'}
                >
                  <td className="p-3 font-medium text-gray-900 border-b bg-gray-50">
                    {player}
                  </td>
                  {sortedPlayers.map(opponent => {
                    const points = player === opponent ? null : (matrix[player]?.[opponent] || 0)
                    const isHovered = hoveredCell?.player1 === player && hoveredCell?.player2 === opponent
                    
                    return (
                      <td 
                        key={opponent}
                        className={`p-2 text-center border-b cursor-pointer transition-all ${
                          player === opponent 
                            ? 'bg-gray-200 text-gray-400' 
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
                  <td className="p-3 text-center font-semibold text-gray-900 border-b bg-blue-50">
                    {formatPoints(playerTotals[player].points)}
                  </td>
                  <td className="p-3 text-center font-medium text-gray-700 border-b">
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
        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <h4 className="font-semibold text-blue-900 mb-2">
            {hoveredCell.player1} vs {hoveredCell.player2}
          </h4>
          <div className="text-sm text-blue-700">
            <p><strong>{hoveredCell.player1}</strong> earned <strong>
              {formatPoints(matrix[hoveredCell.player1]?.[hoveredCell.player2] || 0)}
            </strong> points against <strong>{hoveredCell.player2}</strong></p>
            <p className="mt-1">
              In a head-to-head match play format, this represents the number of holes won or halved
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">How to Read This Matrix</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-700 mb-2">
              <strong>Reading the Matrix:</strong> Find a player in the left column, then look across to see how many points they earned against each opponent.
            </p>
            <p className="text-gray-700">
              <strong>Point System:</strong> 1 point for winning a hole, 0.5 points for tying a hole, 0 points for losing a hole.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-700">High point total (0.8-1.0)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-300 rounded"></div>
              <span className="text-gray-700">Medium point total (0.4-0.8)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span className="text-gray-700">Low point total (0.1-0.4)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-50 border rounded"></div>
              <span className="text-gray-700">No points earned (0)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchPlayMatrix