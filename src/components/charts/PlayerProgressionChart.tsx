import React, { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { getAllPlayerProgressions } from '../../utils/data'

interface PlayerProgressionChartProps {
  height?: number
}

const PlayerProgressionChart: React.FC<PlayerProgressionChartProps> = ({ height = 400 }) => {
  const allProgressions = getAllPlayerProgressions()
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
    allProgressions.map(p => p.player)
  )

  // Transform data for the chart
  const chartData = React.useMemo(() => {
    const days = [2, 3, 4] // Only days 2-4 have individual scores (day 1 was scramble)
    return days.map(day => {
      const dayData: any = { day: `Day ${day}` }
      allProgressions.forEach(({ player, data }) => {
        const dayScore = data.find(d => d.day === day)
        if (dayScore && selectedPlayers.includes(player)) {
          dayData[player] = dayScore.score
        }
      })
      return dayData
    })
  }, [selectedPlayers, allProgressions])

  // Color palette for players
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ]

  const togglePlayer = (player: string) => {
    setSelectedPlayers(prev => 
      prev.includes(player) 
        ? prev.filter(p => p !== player)
        : [...prev, player]
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-700">
                {entry.dataKey}: <strong>{entry.value}</strong>
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Player Selection */}
      <div className="flex flex-wrap gap-2">
        {allProgressions.map(({ player }, index) => (
          <button
            key={player}
            onClick={() => togglePlayer(player)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedPlayers.includes(player)
                ? 'text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={selectedPlayers.includes(player) ? { backgroundColor: colors[index] } : {}}
          >
            {player}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="day" 
            stroke="#666"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="#666"
            tick={{ fontSize: 12 }}
            label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {allProgressions.map(({ player }, index) => (
            selectedPlayers.includes(player) && (
              <Line
                key={player}
                type="monotone"
                dataKey={player}
                stroke={colors[index]}
                strokeWidth={3}
                dot={{ r: 6, strokeWidth: 2 }}
                activeDot={{ r: 8, strokeWidth: 0 }}
                connectNulls={false}
              />
            )
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {selectedPlayers.slice(0, 4).map((player, index) => {
          const progression = allProgressions.find(p => p.player === player)
          const scores = progression?.data.map(d => d.score) || []
          const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 'N/A'
          const trend = scores.length > 1 ? scores[0] - scores[scores.length - 1] : 0 // Reversed: positive = improvement
          
          return (
            <div 
              key={player}
              className="p-3 rounded-lg border"
              style={{ borderColor: colors[allProgressions.findIndex(p => p.player === player)] }}
            >
              <div className="font-medium text-gray-900">{player}</div>
              <div className="text-xs text-gray-600">Avg: {avg}</div>
              <div className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '↓' : '↑'} {Math.abs(trend)} improvement
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PlayerProgressionChart