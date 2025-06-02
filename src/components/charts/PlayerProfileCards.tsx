import React, { useState } from 'react'
import { usePlayerData, useAchievements, useStyleUtils } from '../../hooks'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Award,
  BarChart3,
  MapPin,
  Calendar,
  Users
} from 'lucide-react'

interface PlayerProfileCardsProps {
  columns?: number
  showDetailedStats?: boolean
}

const PlayerProfileCards: React.FC<PlayerProfileCardsProps> = ({ 
  columns = 3,
  showDetailedStats = true 
}) => {
  const { allPlayers, playerNames } = usePlayerData()
  const { getPositionIcon } = useStyleUtils()
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)

  // Get all achievements at the component level to satisfy hooks rules
  const allAchievements = useAchievements()

  // Convert achievements to highlights format using memo
  const getPlayerHighlights = React.useCallback((playerName: string) => {
    const playerAchievements = allAchievements.filter(achievement => achievement.playerName === playerName)
    
    return playerAchievements.slice(0, 3).map(achievement => ({
      type: achievement.category,
      icon: getIconForCategory(achievement.category),
      text: achievement.title,
      color: getColorForRarity(achievement.rarity),
      bg: getBgForRarity(achievement.rarity)
    }))
  }, [allAchievements])

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'special': return Trophy
      case 'consistency': return Target
      case 'scoring': return Award
      case 'matchPlay': return Zap
      case 'course': return MapPin
      default: return BarChart3
    }
  }

  const getColorForRarity = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400'
      case 'epic': return 'text-purple-400'
      case 'rare': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getBgForRarity = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-900'
      case 'epic': return 'bg-purple-900'
      case 'rare': return 'bg-blue-900'
      default: return 'bg-gray-700'
    }
  }

  const getPlayerGrade = (position: number) => {
    if (position === 1) return { grade: 'A+', color: 'text-green-600' }
    if (position <= 3) return { grade: 'A', color: 'text-green-500' }
    if (position <= 5) return { grade: 'B+', color: 'text-blue-600' }
    if (position <= 6) return { grade: 'B', color: 'text-blue-500' }
    return { grade: 'C+', color: 'text-orange-600' }
  }

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center px-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-100">Player Profiles</h2>
        <p className="text-xs md:text-sm text-gray-400 mt-2">
          <span className="hidden sm:inline">Comprehensive stats and performance highlights for each player</span>
          <span className="sm:hidden">Player stats and highlights</span>
        </p>
      </div>

      {/* Player Cards Grid */}
      <div className={`grid ${gridColsClass} gap-4 md:gap-6 px-4 md:px-0`}>
        {allPlayers?.map(player => {
          const highlights = getPlayerHighlights(player.name)
          const grade = getPlayerGrade(player.position)

          return (
            <div 
              key={player.name}
              className={`bg-gray-800 rounded-xl border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden ${
                selectedPlayer === player.name ? 'ring-2 ring-golf-lightgreen' : ''
              }`}
              onClick={() => setSelectedPlayer(selectedPlayer === player.name ? null : player.name)}
            >
              {/* Player Header */}
              <div className="p-4 md:p-6 pb-3 md:pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-100">{player.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs md:text-sm text-gray-400">#{player.position}</span>
                      <span className={`text-base md:text-lg font-bold ${grade.color}`}>{grade.grade}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl md:text-2xl font-bold text-gray-100">
                      {player.basicStats.totalScore}
                    </div>
                    <div className="text-xs md:text-sm text-gray-400">total strokes</div>
                  </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                  <div>
                    <div className="text-base md:text-lg font-semibold text-gray-100">
                      {player.basicStats.scoringAverage.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-400">Average</div>
                  </div>
                  <div>
                    <div className="text-base md:text-lg font-semibold text-green-400">
                      {player.basicStats.bestRound}
                    </div>
                    <div className="text-xs text-gray-400">Best Round</div>
                  </div>
                  <div>
                    <div className="text-base md:text-lg font-semibold text-blue-400">
                      {player.consistencyStats.standardDeviation.toFixed(1)}σ
                    </div>
                    <div className="text-xs text-gray-400">Consistency</div>
                  </div>
                </div>
              </div>

              {/* Performance Highlights */}
              <div className="px-4 md:px-6 pb-3 md:pb-4">
                <div className="space-y-1 md:space-y-2">
                  {highlights.map((highlight, index) => {
                    const Icon = highlight.icon
                    return (
                      <div 
                        key={index}
                        className={`flex items-center space-x-2 p-2 rounded-lg ${highlight.bg}/20 border border-gray-600`}
                      >
                        <Icon className={`h-4 w-4 ${highlight.color}`} />
                        <span className={`text-xs md:text-sm font-medium ${highlight.color}`}>
                          {highlight.text}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Detailed Stats (expandable) */}
              {selectedPlayer === player.name && showDetailedStats && (
                <div className="border-t border-gray-700 bg-gray-900 p-4 md:p-6">
                  <div className="space-y-4">
                    {/* Performance Breakdown */}
                    <div>
                      <h4 className="font-semibold text-gray-100 mb-2 flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Performance Breakdown
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Pars:</span>
                          <span className="font-medium text-gray-100">{player.scoringStats.pars}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Bogeys:</span>
                          <span className="font-medium text-gray-100">{player.scoringStats.bogeys}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Par %:</span>
                          <span className="font-medium text-gray-100">{player.scoringStats.parOrBetterPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Match Play:</span>
                          <span className="font-medium text-gray-100">{player.matchPlayPerformance.winPercentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Daily Performance */}
                    <div>
                      <h4 className="font-semibold text-gray-100 mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Daily Scores
                      </h4>
                      <div className="space-y-2">
                        {player.dailyPerformances.map((performance) => (
                          <div key={performance.day} className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 text-xs md:text-sm">
                              Day {performance.day}: <span className="hidden sm:inline">{performance.course}</span><span className="sm:hidden">{performance.course.split(' ')[0]}</span>
                            </span>
                            <span className="font-medium text-gray-100">
                              {performance.score} (+{performance.toPar})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Course Performance */}
                    <div>
                      <h4 className="font-semibold text-gray-100 mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Course Ratings
                      </h4>
                      <div className="space-y-2">
                        {Array.from(player.coursePerformances.entries()).map(([course, performance]) => (
                          <div key={course} className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 text-xs md:text-sm">
                              <span className="hidden sm:inline">{course}:</span>
                              <span className="sm:hidden">{course.split(' ')[0]}:</span>
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-100">{performance.averageScore.toFixed(0)}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                performance.performanceRating === 'Excelled' ? 'bg-green-900/50 text-green-400 border border-green-700' :
                                performance.performanceRating === 'Solid' ? 'bg-blue-900/50 text-blue-400 border border-blue-700' :
                                'bg-red-900/50 text-red-400 border border-red-700'
                              }`}>
                                {performance.performanceRating}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Click hint */}
              <div className="px-4 md:px-6 pb-3 md:pb-4">
                <div className="text-xs text-gray-500 text-center">
                  {selectedPlayer === player.name ? 'Click to collapse' : 'Click to expand details'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Comparison */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 md:p-6 border border-gray-700 mx-4 md:mx-0">
        <h3 className="font-semibold text-gray-100 mb-3 md:mb-4 flex items-center text-sm md:text-base">
          <Users className="h-4 w-4 md:h-5 md:w-5 mr-2" />
          Quick Player Comparison
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-xs md:text-sm">
          <div>
            <div className="font-semibold text-gray-100">Best Average:</div>
            <div className="text-green-400">
              {allPlayers?.[0]?.name} - {allPlayers?.[0]?.basicStats.scoringAverage.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-100">Most Consistent:</div>
            <div className="text-blue-400">
              {allPlayers?.sort((a, b) => b.consistencyStats.consistencyRating - a.consistencyStats.consistencyRating)[0]?.name}
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-100">Match Play King:</div>
            <div className="text-purple-400">
              {allPlayers?.sort((a, b) => b.matchPlayPerformance.totalPoints - a.matchPlayPerformance.totalPoints)[0]?.name}
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-100">Lowest Round:</div>
            <div className="text-green-400">
              {allPlayers?.sort((a, b) => a.basicStats.bestRound - b.basicStats.bestRound)[0]?.name} - {allPlayers?.sort((a, b) => a.basicStats.bestRound - b.basicStats.bestRound)[0]?.basicStats.bestRound}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayerProfileCards