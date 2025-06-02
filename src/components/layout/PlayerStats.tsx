import React from 'react'
import Card from '../ui/Card'
import LineChart from '../charts/LineChart'
import BarChart from '../charts/BarChart'

const PlayerStats: React.FC = () => {
  // Placeholder data - will be replaced with real data from advanced_stats.json
  const dailyScoresData = [
    { day: 'Day 2', Mike: 97, Jimbo: 100, Dave: 110, Ryan: 114 },
    { day: 'Day 3', Mike: 88, Jimbo: 93, Dave: 98, Ryan: 99 },
    { day: 'Day 4', Mike: 84, Jimbo: 92, Dave: 90, Ryan: 99 },
  ]

  const playerStatsData = [
    { player: 'Mike', birdies: 0, pars: 21, bogeys: 21, doubles: 9 },
    { player: 'Jimbo', birdies: 0, pars: 8, bogeys: 30, doubles: 11 },
    { player: 'Dave', birdies: 0, pars: 12, bogeys: 18, doubles: 14 },
    { player: 'Ryan', birdies: 1, pars: 9, bogeys: 12, doubles: 19 },
  ]

  const lineConfig = [
    { key: 'Mike', name: 'Mike', color: '#22c55e' },
    { key: 'Jimbo', name: 'Jimbo', color: '#3b82f6' },
    { key: 'Dave', name: 'Dave', color: '#f59e0b' },
    { key: 'Ryan', name: 'Ryan', color: '#ef4444' },
  ]

  const barConfig = [
    { key: 'birdies', name: 'Birdies', color: '#22c55e' },
    { key: 'pars', name: 'Pars', color: '#3b82f6' },
    { key: 'bogeys', name: 'Bogeys', color: '#f59e0b' },
    { key: 'doubles', name: 'Double+', color: '#ef4444' },
  ]

  return (
    <div className="space-y-8">
      {/* Performance Trends */}
      <Card title="Daily Scoring Progression" subtitle="Individual round scores across tournament days">
        <LineChart
          data={dailyScoresData}
          xKey="day"
          lines={lineConfig}
          height={400}
        />
      </Card>

      {/* Scoring Distribution */}
      <Card title="Scoring Distribution" subtitle="Breakdown of hole performance by player">
        <BarChart
          data={playerStatsData}
          xKey="player"
          bars={barConfig}
          height={400}
        />
      </Card>

      {/* Player Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card title="Top Performers">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-green-800">Tournament Winner</h4>
                <p className="text-sm text-green-600">Mike - 269 strokes</p>
              </div>
              <div className="text-2xl">🏆</div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-blue-800">Most Improved</h4>
                <p className="text-sm text-blue-600">Mike - Strong finish</p>
              </div>
              <div className="text-2xl">📈</div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-purple-800">Birdie Machine</h4>
                <p className="text-sm text-purple-600">Ryan - 1 birdie</p>
              </div>
              <div className="text-2xl">🎯</div>
            </div>
          </div>
        </Card>

        {/* Consistency Rankings */}
        <Card title="Consistency Rankings">
          <div className="space-y-3">
            {[
              { player: 'Mike', rating: 'Excellent', score: '4.2σ' },
              { player: 'Jimbo', rating: 'Good', score: '6.8σ' },
              { player: 'Dave', rating: 'Average', score: '8.1σ' },
              { player: 'Ryan', rating: 'Variable', score: '10.5σ' },
            ].map((item, index) => (
              <div key={item.player} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  <span className="font-semibold">{item.player}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{item.rating}</div>
                  <div className="text-xs text-gray-600">{item.score}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default PlayerStats