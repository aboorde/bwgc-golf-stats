import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts'
import { data } from '../../utils/data'
import { BarChart3, TrendingUp, Target } from 'lucide-react'

interface ScoreDistributionChartProps {
  height?: number
}

const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({ height = 400 }) => {
  const [viewMode, setViewMode] = useState<'all' | 'course' | 'team'>('all')
  
  // Collect all individual round scores from tournament data
  const allScores = React.useMemo(() => {
    const scores: Array<{ score: number, player: string, course: string, day: number, team: string }> = []
    
    Object.entries(data.player_statistics).forEach(([player, stats]) => {
      // Get team for player
      const team = ['Mike', 'Ryan', 'Nixon', 'Doug'].includes(player) ? 'Banana Boys' : '3 Lefties make a Righty'
      
      // Add scores from days 2, 3, 4 (day 1 was scramble)
      Object.entries(stats.daily_performance).forEach(([dayKey, dayData]) => {
        const day = parseInt(dayKey.replace('day_', ''))
        scores.push({
          score: dayData.score,
          player,
          course: dayData.course,
          day,
          team
        })
      })
    })
    
    return scores
  }, [])

  // Create meaningful golf score distribution
  const distributionData = React.useMemo(() => {
    let filteredScores = allScores
    
    // Filter based on view mode
    if (viewMode === 'course') {
      // Group by course for comparison
      const courseGroups = ['Barefoot Dye', 'Aberdeen Country Club', 'Arcadian Shores']
      return courseGroups.map(course => {
        const courseScores = allScores.filter(s => s.course === course)
        return {
          range: course.split(' ')[0], // Abbreviated name
          count: courseScores.length,
          averageScore: courseScores.reduce((sum, s) => sum + s.score, 0) / courseScores.length,
          scores: courseScores.map(s => s.score),
          details: course
        }
      })
    } else if (viewMode === 'team') {
      // Group by team
      const teams = ['Banana Boys', '3 Lefties make a Righty']
      return teams.map(team => {
        const teamScores = allScores.filter(s => s.team === team)
        return {
          range: team.split(' ')[0], // First word
          count: teamScores.length,
          averageScore: teamScores.reduce((sum, s) => sum + s.score, 0) / teamScores.length,
          scores: teamScores.map(s => s.score),
          details: team
        }
      })
    }
    
    // Default: Score range distribution
    const ranges = [
      { min: 80, max: 89, label: '80-89', description: 'Excellent' },
      { min: 90, max: 99, label: '90-99', description: 'Good' },
      { min: 100, max: 109, label: '100-109', description: 'Average' },
      { min: 110, max: 119, label: '110-119', description: 'Challenging' },
      { min: 120, max: 129, label: '120-129', description: 'Difficult' },
      { min: 130, max: 139, label: '130+', description: 'Very Difficult' }
    ]
    
    return ranges.map(range => {
      const rangeScores = filteredScores.filter(s => {
        if (range.max === 139) return s.score >= range.min // 130+ category
        return s.score >= range.min && s.score <= range.max
      })
      
      return {
        range: range.label,
        count: rangeScores.length,
        percentage: ((rangeScores.length / filteredScores.length) * 100).toFixed(1),
        scores: rangeScores.map(s => s.score),
        description: range.description,
        averageScore: rangeScores.length > 0 ? rangeScores.reduce((sum, s) => sum + s.score, 0) / rangeScores.length : 0
      }
    }).filter(range => range.count > 0)
  }, [allScores, viewMode])
  
  // Calculate tournament statistics
  const tournamentStats = React.useMemo(() => {
    const scores = allScores.map(s => s.score)
    return {
      totalRounds: scores.length,
      averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      lowestScore: Math.min(...scores),
      highestScore: Math.max(...scores),
      par: 72
    }
  }, [allScores])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-800 p-4 border border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-100 mb-2">
            {viewMode === 'course' ? 'Course' : viewMode === 'team' ? 'Team' : 'Score Range'}: {data.details || label}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Rounds:</span>
              <span className="font-medium text-gray-100">{data.count}</span>
            </div>
            {data.percentage && (
              <div className="flex justify-between">
                <span className="text-gray-300">Percentage:</span>
                <span className="font-medium text-gray-100">{data.percentage}%</span>
              </div>
            )}
            {data.averageScore > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-300">Avg Score:</span>
                <span className="font-medium text-gray-100">{data.averageScore.toFixed(1)}</span>
              </div>
            )}
            {data.description && (
              <p className="text-xs text-gray-400 mt-2">{data.description}</p>
            )}
            {data.scores.length > 0 && data.scores.length <= 8 && (
              <p className="text-xs text-gray-400 mt-1">
                Scores: {data.scores.join(', ')}
              </p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const getBarColor = (range: string, index: number) => {
    if (viewMode === 'course') {
      const courseColors = { 'Barefoot': '#ef4444', 'Aberdeen': '#3b82f6', 'Arcadian': '#22c55e' }
      return courseColors[range as keyof typeof courseColors] || '#6b7280'
    } else if (viewMode === 'team') {
      const teamColors = { 'Banana': '#3b82f6', '3': '#ef4444' }
      return teamColors[range as keyof typeof teamColors] || '#6b7280'
    }
    
    // Score range colors - green to red gradient based on difficulty
    const rangeColors = {
      '80-89': '#22c55e',   // Excellent - Green
      '90-99': '#84cc16',   // Good - Light Green  
      '100-109': '#eab308', // Average - Yellow
      '110-119': '#f97316', // Challenging - Orange
      '120-129': '#ef4444', // Difficult - Red
      '130+': '#dc2626'     // Very Difficult - Dark Red
    }
    return rangeColors[range as keyof typeof rangeColors] || '#6b7280'
  }

  return (
    <div className="space-y-6">
      {/* View Mode Selection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Tournament Score Distribution</h2>
          <p className="text-sm text-gray-400">Analysis of all {tournamentStats.totalRounds} individual rounds</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            By Score Range
          </button>
          <button
            onClick={() => setViewMode('course')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'course'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            By Course
          </button>
          <button
            onClick={() => setViewMode('team')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'team'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            By Team
          </button>
        </div>
      </div>

      {/* Tournament Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-100">
            {tournamentStats.averageScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-400">Tournament Average</div>
          <div className="text-xs text-gray-500">+{(tournamentStats.averageScore - tournamentStats.par).toFixed(1)} over par</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {tournamentStats.lowestScore}
          </div>
          <div className="text-sm text-gray-400">Lowest Round</div>
          <div className="text-xs text-gray-500">+{tournamentStats.lowestScore - tournamentStats.par} over par</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">
            {tournamentStats.highestScore}
          </div>
          <div className="text-sm text-gray-400">Highest Round</div>
          <div className="text-xs text-gray-500">+{tournamentStats.highestScore - tournamentStats.par} over par</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {tournamentStats.totalRounds}
          </div>
          <div className="text-sm text-gray-400">Total Rounds</div>
          <div className="text-xs text-gray-500">8 players × 3 rounds</div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          {viewMode === 'all' ? 'Score Distribution by Range' : 
           viewMode === 'course' ? 'Performance by Course' : 'Team Comparison'}
        </h3>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart 
            data={distributionData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="range" 
              stroke="#9CA3AF"
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              label={{ 
                value: viewMode === 'all' ? 'Score Range' : viewMode === 'course' ? 'Course' : 'Team', 
                position: 'insideBottom', 
                offset: -5,
                style: { textAnchor: 'middle', fill: '#9CA3AF' }
              }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              label={{ 
                value: 'Number of Rounds', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#9CA3AF' }
              }}
            />
            {viewMode === 'all' && (
              <ReferenceLine 
                y={tournamentStats.totalRounds / 6} 
                stroke="#6b7280" 
                strokeDasharray="5 5"
                label={{ value: "Expected (uniform)", position: "topRight", fill: '#6b7280' }}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {distributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.range, index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Analysis Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-900/20 rounded-lg border border-blue-800/30">
          <h4 className="font-semibold text-blue-300 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Distribution Analysis
          </h4>
          {viewMode === 'all' ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-2 bg-gray-800 rounded">
                <span className="text-gray-300">Most Common Range:</span>
                <span className="font-medium text-gray-100">
                  {distributionData.reduce((max, current) => current.count > max.count ? current : max).range}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-gray-800 rounded">
                <span className="text-gray-300">Scoring Spread:</span>
                <span className="font-medium text-gray-100">
                  {tournamentStats.highestScore - tournamentStats.lowestScore} strokes
                </span>
              </div>
              <p className="text-gray-300 text-xs mt-3">
                Most rounds fell in the {distributionData.reduce((max, current) => current.count > max.count ? current : max).description?.toLowerCase()} range.
              </p>
            </div>
          ) : viewMode === 'course' ? (
            <div className="space-y-3 text-sm">
              {distributionData.map(course => (
                <div key={course.range} className="flex justify-between p-2 bg-gray-800 rounded">
                  <span className="text-gray-300">{course.details}:</span>
                  <span className="font-medium text-gray-100">{course.averageScore.toFixed(1)} avg</span>
                </div>
              ))}
              <p className="text-gray-300 text-xs mt-3">
                Course difficulty varies significantly - 
                {distributionData.reduce((hardest, current) => current.averageScore > hardest.averageScore ? current : hardest).details} was the most challenging.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              {distributionData.map(team => (
                <div key={team.range} className="flex justify-between p-2 bg-gray-800 rounded">
                  <span className="text-gray-300">{team.details}:</span>
                  <span className="font-medium text-gray-100">{team.averageScore.toFixed(1)} avg</span>
                </div>
              ))}
              <p className="text-gray-300 text-xs mt-3">
                Team performance was competitive with a 
                {Math.abs(distributionData[0].averageScore - distributionData[1].averageScore).toFixed(1)} stroke average difference.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 bg-green-900/20 rounded-lg border border-green-800/30">
          <h4 className="font-semibold text-green-300 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Tournament Context
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-2 bg-gray-800 rounded">
              <span className="text-gray-300">Par for Round:</span>
              <span className="font-medium text-gray-100">{tournamentStats.par}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-800 rounded">
              <span className="text-gray-300">Field Average:</span>
              <span className="font-medium text-gray-100">
                {tournamentStats.averageScore.toFixed(1)} (+{(tournamentStats.averageScore - tournamentStats.par).toFixed(1)})
              </span>
            </div>
            <div className="flex justify-between p-2 bg-gray-800 rounded">
              <span className="text-gray-300">Rounds Under 100:</span>
              <span className="font-medium text-gray-100">
                {allScores.filter(s => s.score < 100).length} of {tournamentStats.totalRounds}
              </span>
            </div>
            <p className="text-gray-300 text-xs mt-3">
              The field averaged {(tournamentStats.averageScore - tournamentStats.par).toFixed(1)} strokes over par, 
              showing the challenging nature of the courses played.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScoreDistributionChart