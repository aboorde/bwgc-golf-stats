import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { getPlayerList, getScoreDistribution, data } from '../../utils/data'

interface ScoreDistributionChartProps {
  height?: number
}

const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({ height = 400 }) => {
  const players = getPlayerList()
  const [selectedPlayer, setSelectedPlayer] = useState(players[0])

  // Get score distribution for selected player
  const scores = getScoreDistribution(selectedPlayer)
  const playerStats = data.player_statistics[selectedPlayer]

  // Create histogram data
  const histogramData = React.useMemo(() => {
    if (scores.length === 0) return []

    const min = Math.min(...scores)
    const max = Math.max(...scores)
    const binSize = Math.max(1, Math.ceil((max - min) / 8)) // Create up to 8 bins
    
    const bins: Array<{ range: string, count: number, scores: number[] }> = []
    
    for (let i = min; i <= max; i += binSize) {
      const binEnd = Math.min(i + binSize - 1, max)
      const binScores = scores.filter(score => score >= i && score <= binEnd)
      
      if (binScores.length > 0) {
        bins.push({
          range: i === binEnd ? `${i}` : `${i}-${binEnd}`,
          count: binScores.length,
          scores: binScores
        })
      }
    }
    
    return bins
  }, [scores])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">Score Range: {label}</p>
          <p className="text-sm text-gray-700">
            <strong>{data.count}</strong> round{data.count !== 1 ? 's' : ''}
          </p>
          {data.scores.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Scores: {data.scores.join(', ')}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const getBarColor = (index: number) => {
    const colors = ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a']
    return colors[index % colors.length]
  }

  return (
    <div className="space-y-6">
      {/* Player Selection */}
      <div className="flex flex-wrap gap-2">
        {players.map(player => (
          <button
            key={player}
            onClick={() => setSelectedPlayer(player)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPlayer === player
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {player}
          </button>
        ))}
      </div>

      {/* Player Stats Summary */}
      {playerStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {playerStats.basic_stats.scoring_average.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {playerStats.basic_stats.best_round}
            </div>
            <div className="text-sm text-gray-600">Best Round</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {playerStats.basic_stats.worst_round}
            </div>
            <div className="text-sm text-gray-600">Worst Round</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {playerStats.consistency.score_standard_deviation.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Std Deviation</div>
          </div>
        </div>
      )}

      {/* Histogram Chart */}
      <div className="bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedPlayer}'s Score Distribution
        </h3>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart 
            data={histogramData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="range" 
              stroke="#666"
              tick={{ fontSize: 12 }}
              label={{ value: 'Score Range', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              stroke="#666"
              tick={{ fontSize: 12 }}
              label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {histogramData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Insights */}
      {playerStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">Consistency Rating</h4>
            <div className="text-2xl font-bold text-blue-700 mb-2">
              {playerStats.consistency.consistency_rating}
            </div>
            <p className="text-sm text-blue-600">
              Based on standard deviation of {playerStats.consistency.score_standard_deviation.toFixed(1)} strokes
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">Performance Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Birdies:</span>
                <span className="font-medium">{playerStats.detailed_performance.birdies}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Pars:</span>
                <span className="font-medium">{playerStats.detailed_performance.pars} ({playerStats.detailed_performance.par_or_better_percentage.toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">Bogeys:</span>
                <span className="font-medium">{playerStats.detailed_performance.bogeys}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Double+:</span>
                <span className="font-medium">{playerStats.detailed_performance.double_bogeys + playerStats.detailed_performance.triple_bogeys + playerStats.detailed_performance.big_numbers}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScoreDistributionChart