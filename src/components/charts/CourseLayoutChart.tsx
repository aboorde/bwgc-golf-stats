import React, { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { MapPin, Target, TrendingUp, AlertTriangle, Award, Zap } from 'lucide-react'
import { HoleVisualizationData, HoleInfo } from '../../models/tournament.types'

interface CourseLayoutChartProps {
  courseData: HoleVisualizationData[]
  holeDetails: HoleInfo[]
  selectedPlayer?: string
  onHoleSelect?: (holeNumber: number) => void
  height?: number
}

const CourseLayoutChart: React.FC<CourseLayoutChartProps> = ({
  courseData,
  holeDetails,
  selectedPlayer,
  onHoleSelect,
  height = 600
}) => {
  const [selectedHole, setSelectedHole] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'scores' | 'difficulty' | 'strategy'>('scores')

  // Process data for visualization
  const chartData = useMemo(() => {
    return courseData.map(hole => {
      const details = holeDetails.find(d => d.number === hole.holeNumber)!
      const playerScore = selectedPlayer 
        ? hole.playerScores.find(p => p.player === selectedPlayer)?.score 
        : null

      return {
        hole: hole.holeNumber,
        par: hole.par,
        yardage: hole.yardage,
        handicap: hole.handicap,
        avgScore: hole.averageScore,
        playerScore,
        difficulty: hole.difficulty,
        birdieRate: hole.birdieRate,
        bogeyRate: hole.bogeyRate,
        overPar: hole.averageScore - hole.par,
        riskLevel: details.riskRewardLevel,
        holeType: details.holeType,
        strategicElements: details.strategicElements
      }
    })
  }, [courseData, holeDetails, selectedPlayer])

  // Get color based on view mode
  const getHoleColor = (hole: any, index: number) => {
    switch (viewMode) {
      case 'scores':
        if (selectedPlayer && hole.playerScore) {
          const toPar = hole.playerScore - hole.par
          if (toPar <= -1) return '#10b981' // Birdie+
          if (toPar === 0) return '#3b82f6'  // Par
          if (toPar === 1) return '#f59e0b'  // Bogey
          return '#ef4444' // Double+
        }
        return hole.avgScore <= hole.par + 0.5 ? '#10b981' : 
               hole.avgScore <= hole.par + 1.2 ? '#3b82f6' : '#ef4444'
      
      case 'difficulty':
        if (hole.handicap <= 6) return '#ef4444'      // Hard
        if (hole.handicap <= 12) return '#f59e0b'     // Medium
        return '#10b981'                               // Easy
      
      case 'strategy':
        if (hole.riskLevel === 'Aggressive') return '#8b5cf6'
        if (hole.riskLevel === 'Conservative') return '#06b6d4'
        return '#84cc16'
    }
  }

  const handleHoleClick = (holeNumber: number) => {
    setSelectedHole(holeNumber === selectedHole ? null : holeNumber)
    onHoleSelect?.(holeNumber)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const details = holeDetails.find(d => d.number === data.hole)!
      
      return (
        <div className="bg-gray-800 p-4 border border-gray-600 rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-gray-100 mb-2">
            Hole {data.hole} - Par {data.par}
          </p>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Yardage:</span>
              <span className="text-gray-100">{data.yardage} yards</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Handicap:</span>
              <span className="text-gray-100">#{data.handicap}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Score:</span>
              <span className="text-gray-100">{data.avgScore.toFixed(1)}</span>
            </div>
            {selectedPlayer && data.playerScore && (
              <div className="flex justify-between">
                <span className="text-gray-400">{selectedPlayer}:</span>
                <span className={`font-bold ${
                  data.playerScore <= data.par ? 'text-green-400' : 'text-red-400'
                }`}>
                  {data.playerScore} ({data.playerScore > data.par ? '+' : ''}{data.playerScore - data.par})
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Birdie Rate:</span>
              <span className="text-green-400">{data.birdieRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Bogey Rate:</span>
              <span className="text-red-400">{data.bogeyRate.toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-600">
            <p className="text-xs text-gray-400 mb-1">Type: {details.holeType.replace('-', ' ')}</p>
            <p className="text-xs text-gray-400">{details.description}</p>
          </div>
        </div>
      )
    }
    return null
  }

  const getHoleIcon = (hole: any) => {
    if (hole.birdieRate > 20) return <Award className="h-4 w-4 text-green-400" />
    if (hole.bogeyRate > 40) return <AlertTriangle className="h-4 w-4 text-red-400" />
    if (hole.riskLevel === 'Aggressive') return <Zap className="h-4 w-4 text-purple-400" />
    return <Target className="h-4 w-4 text-blue-400" />
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-100">Course Layout Analysis</h3>
          <p className="text-sm text-gray-400">
            Interactive 18-hole breakdown with performance insights
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('scores')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'scores'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Scores
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
            onClick={() => setViewMode('strategy')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'strategy'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Strategy
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {viewMode === 'scores' && (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-300">
                {selectedPlayer ? 'Birdie+' : 'Easy Scoring'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-300">
                {selectedPlayer ? 'Par' : 'Average'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-300">
                {selectedPlayer ? 'Bogey' : 'Challenging'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-300">
                {selectedPlayer ? 'Double+' : 'Difficult'}
              </span>
            </div>
          </>
        )}
        
        {viewMode === 'difficulty' && (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-300">Hard (Handicap 1-6)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-300">Medium (Handicap 7-12)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-300">Easy (Handicap 13-18)</span>
            </div>
          </>
        )}
        
        {viewMode === 'strategy' && (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-gray-300">Aggressive</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-cyan-500 rounded"></div>
              <span className="text-gray-300">Conservative</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-lime-500 rounded"></div>
              <span className="text-gray-300">Moderate</span>
            </div>
          </>
        )}
      </div>

      {/* Main Chart */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="hole"
              stroke="#9CA3AF"
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              label={{ value: 'Hole Number', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              label={{ 
                value: viewMode === 'scores' ? 'Average Score' : 'Par', 
                angle: -90, 
                position: 'insideLeft' 
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={viewMode === 'scores' ? 'avgScore' : 'par'}
              radius={[2, 2, 0, 0]}
              stroke="#1F2937"
              strokeWidth={1}
              cursor="pointer"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getHoleColor(entry, index)}
                  opacity={selectedHole === entry.hole ? 1 : 0.8}
                  onClick={() => handleHoleClick(entry.hole)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Hole Grid Overview */}
      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-3">
        {chartData.map((hole) => (
          <div
            key={hole.hole}
            onClick={() => handleHoleClick(hole.hole)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedHole === hole.hole
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            style={{ backgroundColor: selectedHole === hole.hole ? undefined : `${getHoleColor(hole, 0)}20` }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-100">{hole.hole}</span>
              {getHoleIcon(hole)}
            </div>
            <div className="text-xs text-gray-400">
              Par {hole.par} • {hole.yardage}y
            </div>
            <div className="text-xs text-gray-400">
              Hdcp #{hole.handicap}
            </div>
            {selectedPlayer && hole.playerScore && (
              <div className={`text-xs font-medium mt-1 ${
                hole.playerScore <= hole.par ? 'text-green-400' : 'text-red-400'
              }`}>
                {hole.playerScore} ({hole.playerScore > hole.par ? '+' : ''}{hole.playerScore - hole.par})
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Hole Details */}
      {selectedHole && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-lg border border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              const hole = chartData.find(h => h.hole === selectedHole)!
              const details = holeDetails.find(d => d.number === selectedHole)!
              
              return (
                <>
                  {/* Hole Info */}
                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-blue-400" />
                      Hole {selectedHole} Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Par:</span>
                        <span className="text-gray-100">{hole.par}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Yardage:</span>
                        <span className="text-gray-100">{hole.yardage} yards</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Handicap:</span>
                        <span className="text-gray-100">#{hole.handicap}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-gray-100">{details.holeType.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Stats */}
                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-green-400" />
                      Performance Stats
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Average Score:</span>
                        <span className="text-gray-100">{hole.avgScore.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Over Par:</span>
                        <span className={hole.overPar > 0 ? 'text-red-400' : 'text-green-400'}>
                          {hole.overPar > 0 ? '+' : ''}{hole.overPar.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Birdie Rate:</span>
                        <span className="text-green-400">{hole.birdieRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bogey Rate:</span>
                        <span className="text-red-400">{hole.bogeyRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Strategy */}
                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
                      Strategic Elements
                    </h4>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-400">Risk Level:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          hole.riskLevel === 'Aggressive' ? 'bg-purple-900/50 text-purple-400' :
                          hole.riskLevel === 'Conservative' ? 'bg-cyan-900/50 text-cyan-400' :
                          'bg-lime-900/50 text-lime-400'
                        }`}>
                          {hole.riskLevel}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {details.description}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {details.strategicElements.map((element, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                          >
                            {element.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseLayoutChart