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
import { getTeamData, data } from '../../utils/data'
import { Users, Trophy, Target, TrendingDown } from 'lucide-react'

interface TeamComparisonChartProps {
  height?: number
}

const TeamComparisonChart: React.FC<TeamComparisonChartProps> = ({ height = 400 }) => {
  const teamData = getTeamData()
  const [viewMode, setViewMode] = useState<'total' | 'average'>('average')

  // Calculate additional team statistics
  const enhancedTeamData = React.useMemo(() => {
    return teamData.map(team => {
      // Calculate best and worst individual scores from team members
      const memberScores = team.players.map(player => {
        const playerStats = data.player_statistics[player]
        return {
          player,
          total: playerStats?.basic_stats.total_score || 0,
          average: playerStats?.basic_stats.scoring_average || 0,
          best: playerStats?.basic_stats.best_round || 0,
          worst: playerStats?.basic_stats.worst_round || 0
        }
      })

      const bestIndividualScore = Math.min(...memberScores.map(m => m.best))
      const worstIndividualScore = Math.max(...memberScores.map(m => m.worst))
      const teamConsistency = memberScores.reduce((sum, member) => {
        const playerStats = data.player_statistics[member.player]
        return sum + (playerStats?.consistency.score_standard_deviation || 0)
      }, 0) / memberScores.length

      return {
        ...team,
        memberScores,
        bestIndividualScore,
        worstIndividualScore,
        teamConsistency
      }
    })
  }, [teamData])

  const chartData = enhancedTeamData.map(team => ({
    team: team.team,
    value: viewMode === 'total' ? team.totalScore : team.averageScore,
    totalScore: team.totalScore,
    averageScore: team.averageScore,
    players: team.players,
    bestScore: team.bestIndividualScore,
    worstScore: team.worstIndividualScore,
    consistency: team.teamConsistency
  }))

  const teamColors = ['#3b82f6', '#ef4444'] // Blue for Banana Boys, Red for 3 Lefties

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-3">{label}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Score:</span>
              <span className="font-medium">{data.totalScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Average Score:</span>
              <span className="font-medium">{data.averageScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Best Individual:</span>
              <span className="font-medium text-green-600">{data.bestScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Worst Individual:</span>
              <span className="font-medium text-red-600">{data.worstScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Team Consistency:</span>
              <span className="font-medium">{data.consistency.toFixed(1)} σ</span>
            </div>
            <div className="mt-3 pt-2 border-t">
              <p className="text-xs text-gray-600 mb-1">Players:</p>
              <p className="text-xs text-gray-700">{data.players.join(', ')}</p>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const winner = enhancedTeamData.reduce((best, current) => 
    current.averageScore < best.averageScore ? current : best
  )

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Performance Comparison</h2>
          <p className="text-sm text-gray-600">Banana Boys vs 3 Lefties make a Righty</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('average')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'average'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Average Score
          </button>
          <button
            onClick={() => setViewMode('total')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'total'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Total Score
          </button>
        </div>
      </div>

      {/* Winner Banner */}
      <div className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
        <div className="flex items-center justify-center space-x-3">
          <Trophy className="h-8 w-8 text-yellow-600" />
          <div className="text-center">
            <h3 className="text-xl font-bold text-yellow-800">
              Tournament Winners: {winner.team}
            </h3>
            <p className="text-sm text-yellow-700">
              Average score of {winner.averageScore.toFixed(1)} per player
            </p>
          </div>
          <Trophy className="h-8 w-8 text-yellow-600" />
        </div>
      </div>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enhancedTeamData.map((team, index) => (
          <div 
            key={team.team}
            className="p-6 rounded-lg border-2"
            style={{ borderColor: teamColors[index] }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: `${teamColors[index]}20` }}
                >
                  <Users className="h-6 w-6" style={{ color: teamColors[index] }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{team.team}</h3>
                  {team === winner && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Trophy className="h-3 w-3 mr-1" />
                      Winners
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-gray-900">
                  {team.averageScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-gray-900">
                  {team.totalScore}
                </div>
                <div className="text-sm text-gray-600">Total Score</div>
              </div>
            </div>

            {/* Team Member Details */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 text-sm">Team Members:</h4>
              {team.memberScores.map(member => (
                <div key={member.player} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                  <span className="font-medium text-gray-900">{member.player}</span>
                  <span className="text-gray-600">{member.average.toFixed(1)} avg</span>
                </div>
              ))}
            </div>

            {/* Team Stats */}
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">{team.bestIndividualScore}</div>
                <div className="text-xs text-gray-500">Best Round</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{team.worstIndividualScore}</div>
                <div className="text-xs text-gray-500">Worst Round</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{team.teamConsistency.toFixed(1)}</div>
                <div className="text-xs text-gray-500">Consistency</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Chart */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {viewMode === 'total' ? 'Total Team Scores' : 'Average Player Scores'}
        </h3>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="team"
              stroke="#666"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#666"
              tick={{ fontSize: 12 }}
              label={{ 
                value: viewMode === 'total' ? 'Total Score' : 'Average Score', 
                angle: -90, 
                position: 'insideLeft' 
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              stroke="#fff"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={teamColors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Head-to-Head Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Comparison */}
        <div className="p-6 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Score Comparison
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white rounded border">
              <span className="font-medium text-gray-900">Winning Margin</span>
              <span className="font-bold text-blue-600">
                {Math.abs(enhancedTeamData[0].averageScore - enhancedTeamData[1].averageScore).toFixed(1)} strokes
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded border">
              <span className="font-medium text-gray-900">Best Individual Round</span>
              <span className="font-bold text-green-600">
                {Math.min(...enhancedTeamData.map(t => t.bestIndividualScore))}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded border">
              <span className="font-medium text-gray-900">Most Consistent Team</span>
              <span className="font-bold text-purple-600">
                {enhancedTeamData.reduce((best, current) => 
                  current.teamConsistency < best.teamConsistency ? current : best
                ).team}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="p-6 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-4 flex items-center">
            <TrendingDown className="h-5 w-5 mr-2" />
            Performance Insights
          </h4>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-white rounded border">
              <p className="font-medium text-gray-900 mb-1">Tournament Winner</p>
              <p className="text-gray-700">
                <strong>{winner.team}</strong> won with an average score of {winner.averageScore.toFixed(1)} strokes per player
              </p>
            </div>
            
            <div className="p-3 bg-white rounded border">
              <p className="font-medium text-gray-900 mb-1">Closest Competition</p>
              <p className="text-gray-700">
                The teams were separated by only {Math.abs(enhancedTeamData[0].averageScore - enhancedTeamData[1].averageScore).toFixed(1)} strokes on average
              </p>
            </div>

            <div className="p-3 bg-white rounded border">
              <p className="font-medium text-gray-900 mb-1">Team Strengths</p>
              <p className="text-gray-700">
                Both teams showed competitive play with strong individual performances throughout the tournament
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamComparisonChart