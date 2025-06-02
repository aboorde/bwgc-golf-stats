import React, { useState } from 'react'
import Card from '../ui/Card'
import MatchPlayMatrix from '../charts/MatchPlayMatrix'
import { data, getPlayerList, getTeamData } from '../../utils/data'
import { Swords, Target, Crown, Trophy, Users, TrendingUp, Award, AlertTriangle } from 'lucide-react'

const MatchPlayResults: React.FC = () => {
  const [viewMode, setViewMode] = useState<'individual' | 'team'>('individual')
  const players = getPlayerList()
  const teams = getTeamData()
  
  // Get match play data for all players
  const matchPlayData = players.map(player => {
    const playerStats = data.player_statistics[player]
    return {
      player,
      points: playerStats?.match_play_performance.total_points || 0,
      possiblePoints: playerStats?.match_play_performance.possible_points || 18,
      winPercentage: playerStats?.match_play_performance.win_percentage || 0
    }
  }).sort((a, b) => b.points - a.points)
  
  // Calculate team match play totals
  const teamMatchPlayTotals = teams.map(team => {
    const teamPoints = team.players.reduce((sum, player) => {
      const playerData = matchPlayData.find(p => p.player === player)
      return sum + (playerData?.points || 0)
    }, 0)
    
    const teamPossiblePoints = team.players.reduce((sum, player) => {
      const playerData = matchPlayData.find(p => p.player === player)
      return sum + (playerData?.possiblePoints || 0)
    }, 0)
    
    return {
      ...team,
      matchPlayPoints: teamPoints,
      matchPlayPossible: teamPossiblePoints,
      matchPlayPercentage: teamPossiblePoints > 0 ? (teamPoints / teamPossiblePoints) * 100 : 0
    }
  }).sort((a, b) => b.matchPlayPoints - a.matchPlayPoints)
  
  const champion = matchPlayData[0]
  const totalPointsEarned = matchPlayData.reduce((sum, p) => sum + p.points, 0)
  const totalPossiblePoints = matchPlayData.reduce((sum, p) => sum + p.possiblePoints, 0)
  
  // Find closest match (smallest point difference between consecutive players)
  let closestDiff = Infinity
  let closestPair = { player1: '', player2: '', diff: 0 }
  for (let i = 0; i < matchPlayData.length - 1; i++) {
    const diff = matchPlayData[i].points - matchPlayData[i + 1].points
    if (diff < closestDiff && diff > 0) {
      closestDiff = diff
      closestPair = {
        player1: matchPlayData[i].player,
        player2: matchPlayData[i + 1].player,
        diff
      }
    }
  }
  
  const getPositionIcon = (position: number) => {
    if (position === 1) return '🥇'
    if (position === 2) return '🥈'
    if (position === 3) return '🥉'
    return `#${position}`
  }
  
  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-400'
    if (percentage >= 50) return 'text-blue-400'
    if (percentage >= 30) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-8">
      {/* Match Play Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-900/20 p-3 rounded-full">
              <Crown className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <h3 className="font-semibold text-lg text-gray-100 mb-2">
            Match Play Champion
          </h3>
          <div className="text-2xl font-bold text-gray-100">{champion.player}</div>
          <div className="text-sm text-gray-400">{champion.points} out of {champion.possiblePoints} points</div>
          <div className="text-xs text-yellow-400 mt-1">{champion.winPercentage.toFixed(1)}% win rate</div>
        </Card>

        <Card className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-900/20 p-3 rounded-full">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <h3 className="font-semibold text-lg text-gray-100 mb-2">
            Total Points Earned
          </h3>
          <div className="text-2xl font-bold text-gray-100">{totalPointsEarned}</div>
          <div className="text-sm text-gray-400">out of {totalPossiblePoints} possible</div>
          <div className="text-xs text-blue-400 mt-1">{((totalPointsEarned / totalPossiblePoints) * 100).toFixed(1)}% overall</div>
        </Card>

        <Card className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-900/20 p-3 rounded-full">
              <Swords className="h-6 w-6 text-red-400" />
            </div>
          </div>
          <h3 className="font-semibold text-lg text-gray-100 mb-2">
            Closest Match
          </h3>
          <div className="text-2xl font-bold text-gray-100">{closestPair.diff}</div>
          <div className="text-sm text-gray-400">point difference</div>
          <div className="text-xs text-red-400 mt-1">{closestPair.player1} vs {closestPair.player2}</div>
        </Card>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-700 overflow-hidden">
          <button
            onClick={() => setViewMode('individual')}
            className={`px-6 py-2 text-sm font-medium transition-colors ${
              viewMode === 'individual'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Individual Results
          </button>
          <button
            onClick={() => setViewMode('team')}
            className={`px-6 py-2 text-sm font-medium transition-colors ${
              viewMode === 'team'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Team Comparison
          </button>
        </div>
      </div>

      {viewMode === 'individual' ? (
        <>
          {/* Individual Match Play Leaderboard */}
          <Card title="Match Play Leaderboard" subtitle="Head-to-head performance on Day 2 at Barefoot Dye">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-300">Rank</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-300">Player</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-300">Points</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-300">Out of</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-300">Win %</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-300">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {matchPlayData.map((player, index) => (
                    <tr 
                      key={player.player}
                      className={`border-b border-gray-700 hover:bg-gray-800 transition-colors ${
                        index === 0 ? 'bg-yellow-900/10' : ''
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-100">
                            {getPositionIcon(index + 1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-100">{player.player}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="font-bold text-gray-100">{player.points}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="text-gray-400">{player.possiblePoints}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className={`font-medium ${getPerformanceColor(player.winPercentage)}`}>
                          {player.winPercentage.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              player.winPercentage >= 70 ? 'bg-green-500' :
                              player.winPercentage >= 50 ? 'bg-blue-500' :
                              player.winPercentage >= 30 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${player.winPercentage}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Match Play Matrix */}
          <Card className="p-6">
            <MatchPlayMatrix />
          </Card>

          {/* Player Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {matchPlayData.slice(0, 8).map((player, index) => {
              const Icon = index === 0 ? Crown : index === 1 ? Trophy : index === 2 ? Award : Target
              const iconColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-400' : 'text-blue-400'
              
              return (
                <Card key={player.player} className="text-center">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-lg font-bold">{getPositionIcon(index + 1)}</span>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <h4 className="font-semibold text-gray-100 text-lg mb-2">{player.player}</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-2xl font-bold text-gray-100">{player.points}</div>
                      <div className="text-xs text-gray-400">points earned</div>
                    </div>
                    <div>
                      <div className={`text-lg font-medium ${getPerformanceColor(player.winPercentage)}`}>
                        {player.winPercentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">win rate</div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      ) : (
        <>
          {/* Team Match Play Comparison */}
          <Card title="Team Match Play Performance" subtitle="Combined team results from Day 2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamMatchPlayTotals.map((team, index) => (
                <div 
                  key={team.team}
                  className={`p-6 rounded-lg border ${
                    index === 0 
                      ? 'border-yellow-600 bg-yellow-900/10' 
                      : 'border-gray-600 bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-100">{team.team}</h3>
                    {index === 0 && <Trophy className="h-6 w-6 text-yellow-400" />}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gray-900 rounded-lg">
                      <div className="text-3xl font-bold text-gray-100">
                        {team.matchPlayPoints}
                      </div>
                      <div className="text-sm text-gray-400">
                        out of {team.matchPlayPossible} possible points
                      </div>
                      <div className={`text-lg font-medium mt-2 ${getPerformanceColor(team.matchPlayPercentage)}`}>
                        {team.matchPlayPercentage.toFixed(1)}% success rate
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-300 text-sm">Player Contributions:</h4>
                      {team.players.map(player => {
                        const playerData = matchPlayData.find(p => p.player === player)
                        return (
                          <div key={player} className="flex justify-between items-center p-2 bg-gray-900 rounded">
                            <span className="text-gray-100">{player}</span>
                            <div className="text-right">
                              <span className="font-medium text-gray-100">{playerData?.points || 0}</span>
                              <span className="text-gray-400 text-sm ml-2">
                                ({playerData?.winPercentage.toFixed(0) || 0}%)
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Team vs Team Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Team Performance Analysis">
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-gray-100 mb-3">Match Play Team Rankings</h4>
                  <div className="space-y-3">
                    {teamMatchPlayTotals.map((team, index) => (
                      <div key={team.team} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{index === 0 ? '🏆' : '2️⃣'}</span>
                          <span className="font-medium text-gray-100">{team.team}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-100">{team.matchPlayPoints} pts</div>
                          <div className="text-xs text-gray-400">{team.matchPlayPercentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                  <h4 className="font-medium text-blue-300 mb-2">Point Differential</h4>
                  <div className="text-2xl font-bold text-blue-100">
                    {Math.abs(teamMatchPlayTotals[0].matchPlayPoints - teamMatchPlayTotals[1].matchPlayPoints)} points
                  </div>
                  <div className="text-sm text-blue-200 mt-1">
                    {teamMatchPlayTotals[0].team} advantage
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Match Play Insights">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-400 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-100">Best Performer</h4>
                    <p className="text-sm text-gray-400">
                      {champion.player} dominated with {champion.points} points ({champion.winPercentage.toFixed(1)}% win rate)
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-blue-400 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-100">Team Champion</h4>
                    <p className="text-sm text-gray-400">
                      {teamMatchPlayTotals[0].team} won the match play competition
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-100">Toughest Day</h4>
                    <p className="text-sm text-gray-400">
                      Match play at Barefoot Dye proved challenging with only {((totalPointsEarned / totalPossiblePoints) * 100).toFixed(0)}% of points earned
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Match Play Format Explanation */}
      <Card title="Match Play Format" subtitle="Understanding the scoring system">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-100 mb-3 flex items-center">
              <Target className="h-4 w-4 text-blue-400 mr-2" />
              How It Worked
            </h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Each player competed head-to-head on every hole
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Winner of each hole earned 1 point
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Ties earned 0.5 points for each player
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                18 holes = 18 possible points per matchup
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-100 mb-3 flex items-center">
              <Trophy className="h-4 w-4 text-yellow-400 mr-2" />
              Key Takeaways
            </h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                {champion.player} won {champion.winPercentage.toFixed(0)}% of head-to-head battles
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                Match play rewards consistency over low scores
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                Several players were evenly matched
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                Format played at the toughest course (Barefoot Dye)
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default MatchPlayResults