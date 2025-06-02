import React from 'react'
import Card from '../ui/Card'
import LineChart from '../charts/LineChart'
import BarChart from '../charts/BarChart'
import PlayerProgressionChart from '../charts/PlayerProgressionChart'
import PlayerProfileCards from '../charts/PlayerProfileCards'
import { calculateAchievements, calculateConsistencyRankings, getTopAchievements } from '../../utils/achievements'

const PlayerStats: React.FC = () => {
  // Get data-driven achievements and rankings
  const topAchievements = getTopAchievements(undefined, 6)
  const consistencyRankings = calculateConsistencyRankings()

  return (
    <div className="space-y-8">
      {/* Player Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card title="Top Performers">
          <div className="space-y-4">
            {topAchievements.slice(0, 4).map((achievement) => (
              <div 
                key={achievement.id}
                className={`flex justify-between items-center p-4 rounded-lg border ${achievement.bgColor} ${achievement.borderColor}`}
              >
                <div>
                  <h4 className={`font-semibold ${achievement.textColor}`}>{achievement.title}</h4>
                  <p className="text-sm text-gray-300">
                    {achievement.player} - {achievement.description}
                  </p>
                </div>
                <div className="text-2xl">{achievement.emoji}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Consistency Rankings */}
        <Card title="Consistency Rankings">
          <div className="space-y-3">
            {consistencyRankings.map((ranking) => {
              const getRatingColor = (rating: string) => {
                switch (rating.toLowerCase()) {
                  case 'excellent': return 'text-green-400'
                  case 'good': return 'text-blue-400'
                  case 'average': return 'text-yellow-400'
                  default: return 'text-red-400'
                }
              }
              
              return (
                <div key={ranking.player} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-400">#{ranking.rank}</span>
                    <span className="font-semibold text-gray-100">{ranking.player}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getRatingColor(ranking.rating)}`}>{ranking.rating}</div>
                    <div className="text-xs text-gray-400">{ranking.standardDeviation.toFixed(1)}σ</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Player Progression Chart */}
      <Card title="Daily Scoring Progression">
        <PlayerProgressionChart height={400} />
      </Card>

      {/* Player Profile Cards */}
      <Card title="Individual Player Profiles">
        <PlayerProfileCards />
      </Card>
    </div>
  )
}

export default PlayerStats