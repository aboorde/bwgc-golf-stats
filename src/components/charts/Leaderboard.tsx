import React from 'react'
import { Trophy, Medal, Award } from 'lucide-react'

interface LeaderboardEntry {
  position: number
  player: string
  score: number
  average?: number
  badge?: 'winner' | 'runner-up' | 'third'
}

interface LeaderboardProps {
  data: LeaderboardEntry[]
  title?: string
  showAverage?: boolean
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  data, 
  title = 'Leaderboard',
  showAverage = true
}) => {
  const getBadgeIcon = (badge?: string) => {
    switch (badge) {
      case 'winner':
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 'runner-up':
        return <Medal className="h-5 w-5 text-gray-400" />
      case 'third':
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return null
    }
  }

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-900 to-yellow-800 border-yellow-600'
      case 2:
        return 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600'
      case 3:
        return 'bg-gradient-to-r from-amber-900 to-amber-800 border-amber-600'
      default:
        return 'bg-gray-800 border-gray-700'
    }
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">{title}</h3>
      <div className="space-y-2">
        {data.map((entry) => (
          <div
            key={entry.player}
            className={`
              flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-sm
              ${getPositionStyle(entry.position)}
            `}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-300 w-6">
                  {entry.position}
                </span>
                {getBadgeIcon(entry.badge)}
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-100">{entry.player}</h4>
                {showAverage && entry.average && (
                  <p className="text-sm text-gray-400">
                    Avg: {entry.average}
                  </p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xl font-bold text-gray-100">
                {entry.score}
              </div>
              <div className="text-sm text-gray-400">
                Total Score
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Leaderboard