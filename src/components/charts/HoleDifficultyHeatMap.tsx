import React, { useState, useMemo } from 'react'
import { Thermometer, TrendingUp, Award, AlertTriangle, Target, Users } from 'lucide-react'
import { HoleVisualizationData, PlayerName } from '../../models/tournament.types'

interface HoleDifficultyHeatMapProps {
  courseData: HoleVisualizationData[]
  playerNames: PlayerName[]
  courseName: string
}

type ViewMode = 'performance' | 'difficulty' | 'scoring'

const HoleDifficultyHeatMap: React.FC<HoleDifficultyHeatMapProps> = ({
  courseData,
  playerNames,
  courseName
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('performance')
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerName | null>(null)
  const [selectedHole, setSelectedHole] = useState<number | null>(null)

  // Create heat map data
  const heatMapData = useMemo(() => {
    const data: Array<{
      player: PlayerName
      hole: number
      value: number
      score: number
      par: number
      color: string
      intensity: number
    }> = []

    playerNames.forEach(player => {
      courseData.forEach(hole => {
        const playerScore = hole.playerScores.find(p => p.player === player)
        if (!playerScore) return

        let value: number
        let color: string
        let intensity: number

        switch (viewMode) {
          case 'performance':
            // Score relative to par
            value = playerScore.score - hole.par
            intensity = Math.abs(value) / 3 // Normalize to 0-1
            if (value <= -2) color = '#059669'      // Eagle+ (dark green)
            else if (value === -1) color = '#10b981' // Birdie (green)
            else if (value === 0) color = '#3b82f6'  // Par (blue)
            else if (value === 1) color = '#f59e0b'  // Bogey (yellow)
            else if (value === 2) color = '#f97316'  // Double (orange)
            else color = '#ef4444'                   // Triple+ (red)
            break

          case 'difficulty':
            // How much harder than average
            value = playerScore.score - hole.averageScore
            intensity = Math.abs(value) / 2
            if (value <= -1) color = '#10b981'       // Better than average
            else if (value <= 0.5) color = '#3b82f6' // Near average
            else if (value <= 1.5) color = '#f59e0b' // Above average
            else color = '#ef4444'                   // Much worse
            break

          case 'scoring':
            // Birdie opportunity vs execution
            value = hole.birdieRate - (playerScore.score < hole.par ? 100 : 0)
            intensity = hole.birdieRate / 50 // Based on birdie opportunity
            if (playerScore.score <= hole.par - 1) color = '#10b981' // Made birdie
            else if (hole.birdieRate > 20) color = '#f59e0b'         // Missed opportunity
            else color = '#6b7280'                                   // No real opportunity
            break
        }

        data.push({
          player,
          hole: hole.holeNumber,
          value,
          score: playerScore.score,
          par: hole.par,
          color,
          intensity: Math.min(1, intensity)
        })
      })
    })

    return data
  }, [courseData, playerNames, viewMode])

  // Calculate player and hole statistics
  const playerStats = useMemo(() => {
    return playerNames.map(player => {
      const playerData = heatMapData.filter(d => d.player === player)
      const totalScore = playerData.reduce((sum, d) => sum + d.score, 0)
      const totalPar = playerData.reduce((sum, d) => sum + d.par, 0)
      const birdies = playerData.filter(d => d.score < d.par).length
      const pars = playerData.filter(d => d.score === d.par).length
      const bogeys = playerData.filter(d => d.score === d.par + 1).length
      const worse = playerData.filter(d => d.score > d.par + 1).length
      
      // Calculate consistency as standard deviation of scores
      const avgScore = totalScore / playerData.length
      const variance = playerData.reduce((sum, d) => sum + Math.pow(d.score - avgScore, 2), 0) / playerData.length
      const consistency = Math.sqrt(variance)

      return {
        player,
        totalScore,
        average: totalScore / playerData.length,
        toPar: totalScore - totalPar,
        birdies,
        pars,
        bogeys,
        worse,
        consistency
      }
    }).sort((a, b) => a.totalScore - b.totalScore)
  }, [heatMapData, playerNames])

  const holeStats = useMemo(() => {
    return courseData.map(hole => {
      const holeData = heatMapData.filter(d => d.hole === hole.holeNumber)
      const scores = holeData.map(d => d.score)
      const difficulty = scores.reduce((sum, score) => sum + score, 0) / scores.length - hole.par

      return {
        hole: hole.holeNumber,
        par: hole.par,
        average: hole.averageScore,
        difficulty,
        handicap: hole.handicap,
        hardest: difficulty > 1.2,
        easiest: difficulty < 0.3,
        birdieRate: hole.birdieRate
      }
    }).sort((a, b) => b.difficulty - a.difficulty)
  }, [courseData, heatMapData])

  const getCellOpacity = (intensity: number): number => {
    return 0.3 + (intensity * 0.7) // Range from 0.3 to 1.0
  }

  const getViewModeLabel = () => {
    switch (viewMode) {
      case 'performance': return 'Score vs Par'
      case 'difficulty': return 'vs Course Average'
      case 'scoring': return 'Scoring Opportunities'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-100 flex items-center">
            <Thermometer className="h-6 w-6 mr-2 text-red-400" />
            Hole Difficulty Heat Map
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Visual performance patterns across {courseName}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('performance')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'performance'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setViewMode('difficulty')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'difficulty'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Difficulty
          </button>
          <button
            onClick={() => setViewMode('scoring')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'scoring'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Scoring
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h4 className="font-medium text-gray-100 mb-3">{getViewModeLabel()}</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          {viewMode === 'performance' && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-700 rounded"></div>
                <span className="text-gray-300">Eagle (-2+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-300">Birdie (-1)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-gray-300">Par (E)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-300">Bogey (+1)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-gray-300">Double (+2)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-300">Triple+ (+3)</span>
              </div>
            </>
          )}
          
          {viewMode === 'difficulty' && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-300">Better than average</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-gray-300">Near average</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-300">Above average</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-300">Much worse</span>
              </div>
            </>
          )}
          
          {viewMode === 'scoring' && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-300">Made birdie</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-300">Missed opportunity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span className="text-gray-300">Limited opportunity</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Heat Map Grid */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header */}
            <div className="flex bg-gray-900">
              <div className="w-32 p-3 border-r border-gray-700 font-medium text-gray-100">
                Player
              </div>
              {courseData.map((hole) => (
                <div 
                  key={hole.holeNumber}
                  className={`w-12 p-2 text-center text-xs border-r border-gray-700 cursor-pointer transition-colors ${
                    selectedHole === hole.holeNumber 
                      ? 'bg-blue-900/50 text-blue-300' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedHole(selectedHole === hole.holeNumber ? null : hole.holeNumber)}
                >
                  <div className="font-medium">{hole.holeNumber}</div>
                  <div className="text-gray-500">P{hole.par}</div>
                  <div className="text-gray-500">#{hole.handicap}</div>
                </div>
              ))}
              <div className="w-16 p-3 text-center text-xs text-gray-300 font-medium">
                Total
              </div>
            </div>

            {/* Player Rows */}
            {playerStats.map((playerStat, playerIndex) => (
              <div 
                key={playerStat.player}
                className={`flex ${playerIndex % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`}
              >
                <div 
                  className={`w-32 p-3 border-r border-gray-700 cursor-pointer transition-colors ${
                    selectedPlayer === playerStat.player 
                      ? 'bg-blue-900/50 text-blue-300' 
                      : 'text-gray-100 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedPlayer(selectedPlayer === playerStat.player ? null : playerStat.player)}
                >
                  <div className="font-medium">{playerStat.player}</div>
                  <div className="text-xs text-gray-400">#{playerIndex + 1}</div>
                </div>
                
                {courseData.map((hole) => {
                  const cellData = heatMapData.find(d => d.player === playerStat.player && d.hole === hole.holeNumber)
                  if (!cellData) return <div key={hole.holeNumber} className="w-12 h-16 border-r border-gray-700"></div>
                  
                  return (
                    <div
                      key={hole.holeNumber}
                      className={`w-12 h-16 border-r border-gray-700 flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${
                        (selectedPlayer === playerStat.player || selectedHole === hole.holeNumber)
                          ? 'ring-2 ring-blue-400 ring-inset'
                          : 'hover:ring-1 hover:ring-gray-400 hover:ring-inset'
                      }`}
                      style={{
                        backgroundColor: cellData.color,
                        opacity: getCellOpacity(cellData.intensity)
                      }}
                      title={`${playerStat.player} - Hole ${hole.holeNumber}: ${cellData.score} (${cellData.value > 0 ? '+' : ''}${cellData.value})`}
                    >
                      {cellData.score}
                    </div>
                  )
                })}
                
                <div className="w-16 p-3 text-center border-r border-gray-700">
                  <div className="text-sm font-bold text-gray-100">{playerStat.totalScore}</div>
                  <div className={`text-xs ${playerStat.toPar >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {playerStat.toPar > 0 ? '+' : ''}{playerStat.toPar}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hole Difficulty Ranking */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h4 className="font-semibold text-gray-100 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
            Hole Difficulty Ranking
          </h4>
          <div className="space-y-2">
            {holeStats.slice(0, 9).map((hole, index) => (
              <div key={hole.hole} className="flex items-center justify-between p-2 rounded bg-gray-700/50">
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-bold ${
                    index < 3 ? 'text-red-400' : index < 6 ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    #{index + 1}
                  </span>
                  <span className="text-gray-100">
                    Hole {hole.hole} (Par {hole.par})
                  </span>
                  {hole.hardest && <AlertTriangle className="h-4 w-4 text-red-400" />}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-100">
                    {hole.average.toFixed(1)} avg
                  </div>
                  <div className="text-xs text-red-400">
                    +{hole.difficulty.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player Performance Summary */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h4 className="font-semibold text-gray-100 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-400" />
            Player Performance Summary
          </h4>
          <div className="space-y-2">
            {playerStats.map((player, index) => (
              <div key={player.player} className="flex items-center justify-between p-2 rounded bg-gray-700/50">
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-bold ${
                    index === 0 ? 'text-yellow-400' : index < 3 ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    #{index + 1}
                  </span>
                  <span className="text-gray-100">{player.player}</span>
                  {index === 0 && <Award className="h-4 w-4 text-yellow-400" />}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-100">
                    {player.totalScore} total
                  </div>
                  <div className={`text-xs ${player.toPar >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {player.toPar > 0 ? '+' : ''}{player.toPar}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Details */}
      {(selectedPlayer || selectedHole) && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-lg border border-gray-600">
          <h4 className="font-semibold text-gray-100 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-400" />
            {selectedPlayer && selectedHole 
              ? `${selectedPlayer} - Hole ${selectedHole}` 
              : selectedPlayer 
              ? `${selectedPlayer} Performance` 
              : `Hole ${selectedHole} Analysis`}
          </h4>
          
          {selectedPlayer && !selectedHole && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const player = playerStats.find(p => p.player === selectedPlayer)!
                return (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-100">{player.birdies}</div>
                      <div className="text-sm text-green-400">Birdies</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-100">{player.pars}</div>
                      <div className="text-sm text-blue-400">Pars</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-100">{player.bogeys}</div>
                      <div className="text-sm text-yellow-400">Bogeys</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-100">{player.worse}</div>
                      <div className="text-sm text-red-400">Double+</div>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
          
          {selectedHole && !selectedPlayer && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const hole = courseData.find(h => h.holeNumber === selectedHole)!
                const holeDetail = holeStats.find(h => h.hole === selectedHole)!
                return (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-100">Par {hole.par}</div>
                      <div className="text-sm text-gray-400">{hole.yardage} yards</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-100">{hole.averageScore.toFixed(1)}</div>
                      <div className="text-sm text-gray-400">Average Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{hole.birdieRate.toFixed(1)}%</div>
                      <div className="text-sm text-gray-400">Birdie Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-100">#{hole.handicap}</div>
                      <div className="text-sm text-gray-400">Handicap</div>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
          
          {selectedPlayer && selectedHole && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const cellData = heatMapData.find(d => d.player === selectedPlayer && d.hole === selectedHole)!
                const hole = courseData.find(h => h.holeNumber === selectedHole)!
                return (
                  <>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        cellData.score <= cellData.par ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {cellData.score}
                      </div>
                      <div className="text-sm text-gray-400">Score</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        cellData.value <= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {cellData.value > 0 ? '+' : ''}{cellData.value}
                      </div>
                      <div className="text-sm text-gray-400">To Par</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-100">{hole.averageScore.toFixed(1)}</div>
                      <div className="text-sm text-gray-400">Field Avg</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        cellData.score < hole.averageScore ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {cellData.score < hole.averageScore ? 'Better' : 'Worse'}
                      </div>
                      <div className="text-sm text-gray-400">vs Field</div>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HoleDifficultyHeatMap