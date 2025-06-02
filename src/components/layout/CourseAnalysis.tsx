import React, { useState } from 'react'
import Card from '../ui/Card'
import CourseDifficultyChart from '../charts/CourseDifficultyChart'
import CoursePerformanceChart from '../charts/CoursePerformanceChart'
import { data, getCourseData, getPlayerList } from '../../utils/data'
import { MapPin, TrendingUp, Award, Users, Target, Trophy, AlertTriangle } from 'lucide-react'

const CourseAnalysis: React.FC = () => {
  const courseData = getCourseData()
  const players = getPlayerList()
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  
  // Get course stats from data
  const courseStats = data.course_analysis.course_stats
  const difficultyRanking = data.course_analysis.difficulty_ranking
  
  // Calculate best performers per course
  const getBestPerformers = (courseName: string) => {
    const performances = players
      .map(player => {
        const playerData = data.player_statistics[player]
        const coursePerf = playerData?.course_performance[courseName]
        return {
          player,
          average_score: coursePerf?.average_score || 999,
          best_round: coursePerf?.best_round || 999
        }
      })
      .filter(p => p.average_score < 999)
      .sort((a, b) => a.average_score - b.average_score)
    
    return performances.slice(0, 3) // Top 3
  }
  
  // Get course difficulty color
  const getDifficultyColor = (rank: number) => {
    if (rank === 1) return 'text-red-400 bg-red-900/20'
    if (rank === 2) return 'text-yellow-400 bg-yellow-900/20'
    return 'text-green-400 bg-green-900/20'
  }
  
  const getDifficultyIcon = (rank: number) => {
    if (rank === 1) return AlertTriangle
    if (rank === 2) return TrendingUp
    return Award
  }

  return (
    <div className="space-y-8">
      {/* Course Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {difficultyRanking.map((course, index) => {
          const stats = courseStats[course.course]
          const Icon = getDifficultyIcon(index + 1)
          const topPerformers = getBestPerformers(course.course)
          
          return (
            <Card 
              key={course.course} 
              className="text-center hover:border-gray-600 transition-colors cursor-pointer"
              onClick={() => setSelectedCourse(course.course === selectedCourse ? null : course.course)}
            >
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${getDifficultyColor(index + 1)}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="font-semibold text-lg text-gray-100 mb-2">
                {course.course}
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-gray-100">
                    +{stats.average_over_par.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-400">Average Over Par</div>
                </div>
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    index === 0 
                      ? 'bg-red-900/20 text-red-400'
                      : index === 1
                      ? 'bg-yellow-900/20 text-yellow-400'
                      : 'bg-green-900/20 text-green-400'
                  }`}>
                    {index === 0 ? 'Most Difficult' : index === 1 ? 'Moderate' : 'Easiest'}
                  </span>
                </div>
                
                {/* Show top performer when course is selected */}
                {selectedCourse === course.course && topPerformers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="text-xs text-gray-400 mb-2">Top Performers</div>
                    {topPerformers.map((perf, idx) => (
                      <div key={perf.player} className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">
                          {idx === 0 && '🥇'} {perf.player}
                        </span>
                        <span className="text-gray-400">{perf.average_score.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Integrated Charts */}
      <div className="space-y-8">
        {/* Course Difficulty Chart */}
        <Card className="p-6">
          <CourseDifficultyChart height={400} />
        </Card>

        {/* Course Performance Chart */}
        <Card className="p-6">
          <CoursePerformanceChart height={600} />
        </Card>
      </div>

      {/* Course Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* All Players Performance Summary */}
        <Card title="Player Performance by Course" subtitle="Average scores for all 8 players">
          <div className="space-y-4">
            {Object.entries(courseStats).map(([courseName, stats]) => {
              const performances = players
                .map(player => {
                  const playerData = data.player_statistics[player]
                  const coursePerf = playerData?.course_performance[courseName]
                  return {
                    player,
                    score: coursePerf?.average_score || 0
                  }
                })
                .filter(p => p.score > 0)
                .sort((a, b) => a.score - b.score)
              
              return (
                <div key={courseName} className="p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                  <h4 className="font-semibold text-gray-100 mb-3">{courseName}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {performances.map((perf, idx) => (
                      <div key={perf.player} className="flex justify-between">
                        <span className={`text-gray-${idx === 0 ? '100' : '300'}`}>
                          {idx === 0 && '👑'} {perf.player}
                        </span>
                        <span className={`font-mono ${
                          idx === 0 ? 'text-green-400' : 
                          idx === performances.length - 1 ? 'text-red-400' : 
                          'text-gray-400'
                        }`}>
                          {perf.score.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Course Records & Insights */}
        <Card title="Course Records & Analysis">
          <div className="space-y-4">
            {/* Best Single Rounds */}
            <div>
              <h4 className="font-medium text-gray-100 mb-3 flex items-center">
                <Trophy className="h-4 w-4 text-yellow-400 mr-2" />
                Best Single Rounds
              </h4>
              <div className="space-y-2">
                {Object.entries(courseStats).map(([courseName, stats]) => {
                  // Find who shot the best round
                  let bestPlayer = ''
                  let bestScore = stats.best_score
                  
                  players.forEach(player => {
                    const playerData = data.player_statistics[player]
                    const coursePerf = playerData?.course_performance[courseName]
                    if (coursePerf?.best_round === bestScore) {
                      bestPlayer = player
                    }
                  })
                  
                  return (
                    <div key={courseName} className="flex justify-between items-center p-2 rounded bg-gray-800/50">
                      <div>
                        <span className="text-gray-100 text-sm font-medium">{courseName}</span>
                        <span className="text-gray-400 text-xs ml-2">({bestPlayer})</span>
                      </div>
                      <span className="text-green-400 font-mono font-bold">{bestScore}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Course Insights */}
            <div className="space-y-3 pt-4 border-t border-gray-700">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-red-400 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-100">Most Challenging</h4>
                  <p className="text-sm text-gray-400">
                    {difficultyRanking[0].course} with an average of +{courseStats[difficultyRanking[0].course].average_over_par.toFixed(1)} over par
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-green-400 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-100">Most Scoreable</h4>
                  <p className="text-sm text-gray-400">
                    {difficultyRanking[2].course} with an average of +{courseStats[difficultyRanking[2].course].average_over_par.toFixed(1)} over par
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-blue-400 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-100">Total Rounds</h4>
                  <p className="text-sm text-gray-400">
                    {Object.values(courseStats).reduce((sum, stats) => sum + stats.rounds_played, 0)} rounds played across all courses
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Score Distribution by Course */}
      <Card title="Score Ranges by Course" subtitle="Showing the spread between best and worst rounds">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(courseStats).map(([courseName, stats]) => {
            const range = stats.worst_score - stats.best_score
            const difficultyIdx = difficultyRanking.findIndex(c => c.course === courseName)
            
            return (
              <div key={courseName} className="text-center">
                <h4 className="font-medium text-gray-100 mb-3">{courseName}</h4>
                <div className="relative h-32 flex items-end justify-center space-x-2">
                  {/* Best score bar */}
                  <div className="w-12 bg-green-600 rounded-t" style={{ height: `${(stats.best_score / stats.worst_score) * 100}%` }}>
                    <div className="text-xs text-white font-bold mt-1">{stats.best_score}</div>
                  </div>
                  {/* Average score bar */}
                  <div className="w-12 bg-blue-600 rounded-t" style={{ height: `${(stats.average_score / stats.worst_score) * 100}%` }}>
                    <div className="text-xs text-white font-bold mt-1">{stats.average_score.toFixed(0)}</div>
                  </div>
                  {/* Worst score bar */}
                  <div className="w-12 bg-red-600 rounded-t" style={{ height: '100%' }}>
                    <div className="text-xs text-white font-bold mt-1">{stats.worst_score}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Range: {range} strokes
                </div>
                <div className="mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(difficultyIdx + 1)}`}>
                    Difficulty #{difficultyIdx + 1}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

export default CourseAnalysis