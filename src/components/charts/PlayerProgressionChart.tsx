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

const PlayerProgressionChart: React.FC<PlayerProgressionChartProps> = ({ height }) => {
  // Responsive height - smaller on mobile
  const responsiveHeight = height || (typeof window !== 'undefined' && window.innerWidth < 768 ? 300 : 400)
  const allProgressions = getAllPlayerProgressions()
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
    allProgressions.map(p => p.player)
  )

  // Course information for meaningful labels
  const courseInfo = {
    2: { name: 'Barefoot Dye', format: 'Match Play' },
    3: { name: 'Aberdeen Country Club', format: 'Best Ball' },
    4: { name: 'Arcadian Shores', format: 'Stableford' }
  }

  // Transform data for the chart - include ALL players always
  const chartData = React.useMemo(() => {
    const days = [2, 3, 4] // Only days 2-4 have individual scores (day 1 was scramble)
    return days.map(day => {
      const courseData = courseInfo[day as keyof typeof courseInfo]
      const dayData: any = { 
        day: `Day ${day}`,
        dayLabel: `Day ${day}\n${courseData.name}`,
        course: courseData.name,
        format: courseData.format
      }
      // Always include all players in the data, regardless of selection
      allProgressions.forEach(({ player, data }) => {
        const dayScore = data.find(d => d.day === day)
        if (dayScore) {
          dayData[player] = dayScore.score
        }
      })
      return dayData
    })
  }, [allProgressions])

  // Color palette for players (dark mode friendly)
  const colors = [
    '#60A5FA', '#F87171', '#34D399', '#FBBF24',
    '#A78BFA', '#22D3EE', '#A3E635', '#FB923C'
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
      const dayData = chartData.find(d => d.day === label)
      return (
        <div className="bg-gray-800 p-4 border border-gray-600 rounded-lg shadow-lg">
          <div className="mb-2">
            <p className="font-semibold text-gray-100">{label}</p>
            <p className="text-xs text-gray-400">
              {dayData?.course} • {dayData?.format}
            </p>
          </div>
          {payload
            .filter((entry: any) => selectedPlayers.includes(entry.dataKey))
            .sort((a: any, b: any) => a.value - b.value)
            .map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-3 mb-1">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-300">{entry.dataKey}</span>
              </div>
              <span className="font-semibold text-gray-100">{entry.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Player Selection with Select All/None */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-100">Player Selection</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPlayers(allProgressions.map(p => p.player))}
              className="px-3 py-1 rounded text-sm bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedPlayers([])}
              className="px-3 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {allProgressions.map(({ player }, index) => (
            <button
              key={player}
              onClick={() => togglePlayer(player)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                selectedPlayers.includes(player)
                  ? 'text-white shadow-md transform scale-105'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105'
              }`}
              style={selectedPlayers.includes(player) ? { backgroundColor: colors[index] } : {}}
            >
              {player}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={responsiveHeight}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 50, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="day" 
            stroke="#9CA3AF"
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            interval={0}
            height={60}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            label={{ 
              value: 'Golf Score', 
              angle: -90, 
              position: 'insideLeft', 
              style: { textAnchor: 'middle', fill: '#9CA3AF', fontSize: '14px' } 
            }}
            domain={[75, 145]}
            ticks={[80, 90, 100, 110, 120, 130, 140]}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {allProgressions.map(({ player }, index) => (
            <Line
              key={player}
              type="monotone"
              dataKey={player}
              stroke={colors[index]}
              strokeWidth={selectedPlayers.includes(player) ? 3 : 2}
              strokeOpacity={selectedPlayers.includes(player) ? 1 : 0.3}
              dot={{ 
                r: selectedPlayers.includes(player) ? 6 : 4, 
                strokeWidth: 2,
                fillOpacity: selectedPlayers.includes(player) ? 1 : 0.4
              }}
              activeDot={{ r: 8, strokeWidth: 0 }}
              connectNulls={false}
              strokeDasharray={selectedPlayers.includes(player) ? '0' : '8 4'}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Tournament Context */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-4">
        <h4 className="font-semibold text-gray-100 mb-2">Tournament Format by Day</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="text-center p-2 bg-blue-900/20 rounded border border-blue-800/30">
            <div className="font-medium text-blue-300">Day 2 • Match Play</div>
            <div className="text-xs text-gray-400">Barefoot Dye (Hardest)</div>
          </div>
          <div className="text-center p-2 bg-purple-900/20 rounded border border-purple-800/30">
            <div className="font-medium text-purple-300">Day 3 • Best Ball</div>
            <div className="text-xs text-gray-400">Aberdeen Country Club</div>
          </div>
          <div className="text-center p-2 bg-orange-900/20 rounded border border-orange-800/30">
            <div className="font-medium text-orange-300">Day 4 • Stableford</div>
            <div className="text-xs text-gray-400">Arcadian Shores (Easiest)</div>
          </div>
        </div>
      </div>

      {/* Player Performance Summary */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h4 className="font-semibold text-gray-100 mb-3">Player Performance Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {allProgressions
            .sort((a, b) => {
              const avgA = a.data.reduce((sum, d) => sum + d.score, 0) / a.data.length
              const avgB = b.data.reduce((sum, d) => sum + d.score, 0) / b.data.length
              return avgA - avgB // Sort by average score (best first)
            })
            .map((progression, index) => {
            const { player, data } = progression
            const originalIndex = allProgressions.findIndex(p => p.player === player)
            const scores = data.map(d => d.score)
            const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 'N/A'
            const improvement = scores.length > 1 ? scores[0] - scores[scores.length - 1] : 0
            const bestRound = Math.min(...scores)
            const worstRound = Math.max(...scores)
            const isSelected = selectedPlayers.includes(player)
            
            return (
              <div 
                key={player}
                className={`p-3 rounded-lg border transition-all cursor-pointer hover:scale-105 ${
                  isSelected 
                    ? 'border-2 shadow-lg' 
                    : 'border-gray-700 opacity-60 hover:opacity-80'
                }`}
                style={isSelected ? { borderColor: colors[originalIndex], backgroundColor: `${colors[originalIndex]}10` } : {}}
                onClick={() => togglePlayer(player)}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white" 
                    style={{ backgroundColor: colors[originalIndex] }}
                  />
                  <div className="font-medium text-gray-100">{player}</div>
                  <div className="text-xs text-gray-400">#{index + 1}</div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">3-Round Avg:</span>
                    <span className="font-semibold text-gray-200">{avg}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Best Round:</span>
                    <span className="text-green-400 font-semibold">{bestRound}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Worst Round:</span>
                    <span className="text-red-400 font-semibold">{worstRound}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Improvement:</span>
                    <span className={`font-semibold ${
                      improvement > 0 ? 'text-green-400' : 
                      improvement < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {improvement > 0 ? '↗' : improvement < 0 ? '↘' : '→'} {Math.abs(improvement) || 0}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PlayerProgressionChart