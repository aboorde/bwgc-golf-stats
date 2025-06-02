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

const TeamComparisonChart: React.FC<TeamComparisonChartProps> = ({ height }) => {
  // Responsive height - smaller on mobile
  const responsiveHeight = height || (typeof window !== 'undefined' && window.innerWidth < 768 ? 300 : 400)
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
        <div className="bg-gray-800 p-4 border border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-100 mb-3">{label}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Total Score:</span>
              <span className="font-medium text-gray-100">{data.totalScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Average Score:</span>
              <span className="font-medium text-gray-100">{data.averageScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Best Individual:</span>
              <span className="font-medium text-green-400">{data.bestScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Worst Individual:</span>
              <span className="font-medium text-red-400">{data.worstScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Team Consistency:</span>
              <span className="font-medium text-gray-100">{data.consistency.toFixed(1)} σ</span>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-600">
              <p className="text-xs text-gray-400 mb-1">Players:</p>
              <p className="text-xs text-gray-300">{data.players.join(', ')}</p>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 md:px-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-100">Team Performance Comparison</h2>
          <p className="text-xs md:text-sm text-gray-400">
            <span className="hidden sm:inline">Banana Boys vs 3 Lefties make a Righty</span>
            <span className="sm:hidden">Banana Boys vs 3 Lefties</span>
          </p>
        </div>
        
        <div className="flex gap-1 md:gap-2">
          <button
            onClick={() => setViewMode('average')}
            className={`px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
              viewMode === 'average'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="hidden sm:inline">Average Score</span>
            <span className="sm:hidden">Avg</span>
          </button>
          <button
            onClick={() => setViewMode('total')}
            className={`px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
              viewMode === 'total'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="hidden sm:inline">Total Score</span>
            <span className="sm:hidden">Total</span>
          </button>
        </div>
      </div>

      {/* Winner Banner */}
      <div className="p-4 md:p-6 bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 rounded-lg border border-yellow-600/30 mx-4 md:mx-0">
        <div className="flex items-center justify-center space-x-2 md:space-x-3">
          <Trophy className="h-6 w-6 md:h-8 md:w-8 text-yellow-400" />
          <div className="text-center">
            <h3 className="text-base md:text-xl font-bold text-yellow-300">
              <span className="hidden sm:inline">Tournament Winners: {winner.team}</span>
              <span className="sm:hidden">Winners: {winner.team.split(' ')[0]}</span>
            </h3>
            <p className="text-xs md:text-sm text-yellow-400">
              <span className="hidden sm:inline">Average score of {winner.averageScore.toFixed(1)} per player</span>
              <span className="sm:hidden">{winner.averageScore.toFixed(1)} avg</span>
            </p>
          </div>
          <Trophy className="h-6 w-6 md:h-8 md:w-8 text-yellow-400" />
        </div>
      </div>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4 md:px-0">
        {enhancedTeamData.map((team, index) => (
          <div 
            key={team.team}
            className="p-4 md:p-6 rounded-lg border-2"
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
                  <h3 className="text-base md:text-lg font-bold text-gray-100">
                    <span className="hidden sm:inline">{team.team}</span>
                    <span className="sm:hidden">{team.team.split(' ')[0]}</span>
                  </h3>
                  {team === winner && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-300">
                      <Trophy className="h-3 w-3 mr-1" />
                      Winners
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-800 rounded">
                <div className="text-2xl font-bold text-gray-100">
                  {team.averageScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-400">Avg Score</div>
              </div>
              <div className="text-center p-3 bg-gray-800 rounded">
                <div className="text-2xl font-bold text-gray-100">
                  {team.totalScore}
                </div>
                <div className="text-sm text-gray-400">Total Score</div>
              </div>
            </div>

            {/* Team Member Details */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-100 text-sm">Team Members:</h4>
              {team.memberScores.map(member => (
                <div key={member.player} className="flex justify-between items-center p-2 bg-gray-800 rounded text-sm">
                  <span className="font-medium text-gray-100">{member.player}</span>
                  <span className="text-gray-400">{member.average.toFixed(1)} avg</span>
                </div>
              ))}
            </div>

            {/* Team Stats */}
            <div className="mt-4 pt-4 border-t border-gray-600 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-400">{team.bestIndividualScore}</div>
                <div className="text-xs text-gray-400">Best Round</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-400">{team.worstIndividualScore}</div>
                <div className="text-xs text-gray-400">Worst Round</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-400">{team.teamConsistency.toFixed(1)}</div>
                <div className="text-xs text-gray-400">Consistency</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Chart */}
      <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700 mx-4 md:mx-0">
        <h3 className="text-base md:text-lg font-semibold text-gray-100 mb-3 md:mb-4">
          {viewMode === 'total' ? 'Total Team Scores' : 'Average Player Scores'}
        </h3>
        <ResponsiveContainer width="100%" height={responsiveHeight}>
          <BarChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="team"
              stroke="#9CA3AF"
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
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
              stroke="#1F2937"
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
        <div className="p-6 bg-blue-900/20 rounded-lg border border-blue-800/30">
          <h4 className="font-semibold text-blue-300 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Score Comparison
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded border border-gray-700">
              <span className="font-medium text-gray-100">Winning Margin</span>
              <span className="font-bold text-blue-400">
                {Math.abs(enhancedTeamData[0].averageScore - enhancedTeamData[1].averageScore).toFixed(1)} strokes
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded border border-gray-700">
              <span className="font-medium text-gray-100">Best Individual Round</span>
              <span className="font-bold text-green-400">
                {Math.min(...enhancedTeamData.map(t => t.bestIndividualScore))}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded border border-gray-700">
              <span className="font-medium text-gray-100">Most Consistent Team</span>
              <span className="font-bold text-purple-400">
                {enhancedTeamData.reduce((best, current) => 
                  current.teamConsistency < best.teamConsistency ? current : best
                ).team}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="p-6 bg-green-900/20 rounded-lg border border-green-800/30">
          <h4 className="font-semibold text-green-300 mb-4 flex items-center">
            <TrendingDown className="h-5 w-5 mr-2" />
            Performance Insights
          </h4>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-gray-800 rounded border border-gray-700">
              <p className="font-medium text-gray-100 mb-1">Tournament Winner</p>
              <p className="text-gray-300">
                <strong>{winner.team}</strong> won with an average score of {winner.averageScore.toFixed(1)} strokes per player
              </p>
            </div>
            
            <div className="p-3 bg-gray-800 rounded border border-gray-700">
              <p className="font-medium text-gray-100 mb-1">Closest Competition</p>
              <p className="text-gray-300">
                The teams were separated by only {Math.abs(enhancedTeamData[0].averageScore - enhancedTeamData[1].averageScore).toFixed(1)} strokes on average
              </p>
            </div>

            <div className="p-3 bg-gray-800 rounded border border-gray-700">
              <p className="font-medium text-gray-100 mb-1">Team Strengths</p>
              <p className="text-gray-300">
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