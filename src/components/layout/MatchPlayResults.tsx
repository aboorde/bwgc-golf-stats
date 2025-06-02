import React from 'react'
import Card from '../ui/Card'
import Leaderboard from '../charts/Leaderboard'
import BarChart from '../charts/BarChart'
import { Swords, Target, Crown } from 'lucide-react'

const MatchPlayResults: React.FC = () => {
  // Placeholder data - will be replaced with real match play results
  const matchPlayLeaderboard = [
    { position: 1, player: 'Nixon', score: 13, average: 72.2, badge: 'winner' as const },
    { position: 2, player: 'Mike', score: 11, average: 61.1, badge: 'runner-up' as const },
    { position: 3, player: 'Todd', score: 10.5, average: 58.3, badge: 'third' as const },
    { position: 4, player: 'Dave', score: 10, average: 55.6 },
    { position: 5, player: 'Ryan', score: 8, average: 44.4 },
    { position: 6, player: 'Doug', score: 7.5, average: 41.7 },
    { position: 7, player: 'Jimbo', score: 7, average: 38.9 },
    { position: 8, player: 'AJ', score: 5, average: 27.8 },
  ]

  const matchPlayData = [
    { player: 'Nixon', points: 13, percentage: 72.2 },
    { player: 'Mike', points: 11, percentage: 61.1 },
    { player: 'Todd', points: 10.5, percentage: 58.3 },
    { player: 'Dave', points: 10, percentage: 55.6 },
  ]

  const barConfig = [
    { key: 'points', name: 'Points Earned', color: '#3b82f6' }
  ]

  return (
    <div className="space-y-8">
      {/* Match Play Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Crown className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            Match Play Champion
          </h3>
          <div className="text-2xl font-bold text-gray-900">Nixon</div>
          <div className="text-sm text-gray-600">13 out of 18 points</div>
          <div className="text-xs text-yellow-600 mt-1">72.2% win rate</div>
        </Card>

        <Card className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            Total Points Earned
          </h3>
          <div className="text-2xl font-bold text-gray-900">72</div>
          <div className="text-sm text-gray-600">out of 144 possible</div>
          <div className="text-xs text-blue-600 mt-1">50% overall</div>
        </Card>

        <Card className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <Swords className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            Closest Match
          </h3>
          <div className="text-2xl font-bold text-gray-900">0.5</div>
          <div className="text-sm text-gray-600">point difference</div>
          <div className="text-xs text-red-600 mt-1">Several tight matches</div>
        </Card>
      </div>

      {/* Match Play Leaderboard */}
      <Card>
        <Leaderboard
          data={matchPlayLeaderboard}
          title="Match Play Results (Day 2)"
          showAverage={true}
        />
      </Card>

      {/* Match Play Performance Chart */}
      <Card title="Match Play Points Earned" subtitle="Head-to-head performance on Day 2">
        <BarChart
          data={matchPlayData}
          xKey="player"
          bars={barConfig}
          height={300}
        />
      </Card>

      {/* Match Play Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers */}
        <Card title="Match Play Standouts">
          <div className="space-y-4">
            <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-yellow-800">👑 Match Play King</h4>
                  <p className="text-sm text-yellow-600">Nixon dominated with 13 points</p>
                  <p className="text-xs text-yellow-500">72.2% win rate in head-to-head</p>
                </div>
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
            </div>

            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-blue-800">⚔️ Consistent Competitor</h4>
                  <p className="text-sm text-blue-600">Mike earned 11 points</p>
                  <p className="text-xs text-blue-500">Strong all-around match play</p>
                </div>
                <Swords className="h-5 w-5 text-blue-600" />
              </div>
            </div>

            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-green-800">🎯 Clutch Performer</h4>
                  <p className="text-sm text-green-600">Todd earned 10.5 points</p>
                  <p className="text-xs text-green-500">Several close match victories</p>
                </div>
                <Target className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </Card>

        {/* Match Play Format Explanation */}
        <Card title="Match Play Format">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">How It Worked</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Each player competed head-to-head on every hole</li>
                <li>• Winner of each hole earned 1 point</li>
                <li>• Ties earned 0.5 points for each player</li>
                <li>• 18 holes = 18 possible points per player</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Key Insights</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Nixon won 72% of his head-to-head battles</li>
                <li>• AJ struggled in the match play format</li>
                <li>• Several players were very evenly matched</li>
                <li>• Match play rewards consistency over low scores</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default MatchPlayResults