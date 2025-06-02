import React, { useState } from 'react'
import Card from '../ui/Card'
import CourseDifficultyChart from '../charts/CourseDifficultyChart'
import { useCourseData, usePlayerData } from '../../hooks'
import { MapPin, TrendingUp, Award, Users, Target, Trophy, AlertTriangle, Filter, BarChart3 } from 'lucide-react'

const CourseAnalysis: React.FC = () => {
  const { allCourses, difficultyAnalysis } = useCourseData()
  const { allPlayers } = usePlayerData()
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [showRange, setShowRange] = useState(false)
  
  // Get course data
  const courseStatistics = allCourses
  const difficultyRanking = difficultyAnalysis?.rankings || []
  
  // Calculate best performers per course using service data
  const getBestPerformers = (courseName: string) => {
    if (!allPlayers) return []
    
    const performances = allPlayers
      .map(player => {
        const coursePerf = player.coursePerformances.get(courseName)
        return {
          player: player.name,
          average_score: coursePerf?.averageScore || 999,
          best_round: coursePerf?.bestRound || 999,
          rating: coursePerf?.performanceRating || 'N/A'
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
          const stats = courseStatistics?.find(c => c.name === course.course)
          if (!stats) return null
          const Icon = getDifficultyIcon(index + 1)
          const topPerformers = getBestPerformers(course.course)
          
          return (
            <div
              key={course.course}
              onClick={() => setSelectedCourse(course.course === selectedCourse ? null : course.course)}
              className="cursor-pointer"
            >
              <Card className="text-center hover:border-gray-600 transition-colors">
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
                    +{stats.averageOverPar.toFixed(1)}
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
                      <div key={perf.player} className="flex justify-between items-center text-xs mb-1">
                        <span className="text-gray-300">
                          {idx === 0 && '🥇'} {perf.player}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">{perf.average_score.toFixed(1)}</span>
                          <span className={`px-1 py-0.5 rounded text-xs ${
                            perf.rating === 'Excelled' ? 'bg-green-900/50 text-green-400' :
                            perf.rating === 'Solid' ? 'bg-blue-900/50 text-blue-400' :
                            'bg-red-900/50 text-red-400'
                          }`}>
                            {perf.rating}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
            </div>
          )
        })}
      </div>

      {/* Course Difficulty Chart */}
      <Card className="p-6">
        <CourseDifficultyChart height={400} />
      </Card>

      {/* Comprehensive Player Performance Table */}
      <Card>
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-gray-100">Course Performance Analysis</h3>
            <p className="text-sm text-gray-400 mt-1">Player performance across all tournament courses</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRange(!showRange)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showRange ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>{showRange ? 'Hide Range' : 'Show Range'}</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">Player</th>
                {difficultyRanking.map((course) => (
                  <th key={course.course} className="px-4 py-3 text-center font-semibold text-gray-300">
                    <div className="text-xs">{course.course.split(' ')[0]}</div>
                    <div className="text-xs text-gray-500">#{course.difficulty}</div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-semibold text-gray-300">Avg</th>
              </tr>
            </thead>
            <tbody>
              {allPlayers?.map((player) => {
                const playerCourseScores = difficultyRanking.map(course => {
                  const coursePerf = player.coursePerformances.get(course.course)
                  return {
                    course: course.course,
                    score: coursePerf?.averageScore || 0,
                    rating: coursePerf?.performanceRating || 'N/A',
                    range: showRange && coursePerf?.worstRound ? 
                      `${coursePerf.bestRound}-${coursePerf.worstRound}` : null
                  }
                })
                
                const validScores = playerCourseScores.filter(s => s.score > 0)
                const playerAvg = validScores.length > 0 ? 
                  validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length : 0
                
                return (
                  <tr key={player.name} className="border-b border-gray-700 hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-100">{player.name}</div>
                      <div className="text-xs text-gray-400">#{player.position}</div>
                    </td>
                    {playerCourseScores.map((courseData) => (
                      <td key={courseData.course} className="px-4 py-3 text-center">
                        {courseData.score > 0 ? (
                          <div>
                            <div className={`font-semibold ${
                              courseData.rating === 'Excelled' ? 'text-green-400' :
                              courseData.rating === 'Solid' ? 'text-blue-400' :
                              courseData.rating === 'Struggled' ? 'text-red-400' :
                              'text-gray-400'
                            }`}>
                              {courseData.score.toFixed(1)}
                            </div>
                            {showRange && courseData.range && (
                              <div className="text-xs text-gray-500">{courseData.range}</div>
                            )}
                            <div className={`text-xs px-1 py-0.5 rounded mt-1 ${
                              courseData.rating === 'Excelled' ? 'bg-green-900/50 text-green-400' :
                              courseData.rating === 'Solid' ? 'bg-blue-900/50 text-blue-400' :
                              courseData.rating === 'Struggled' ? 'bg-red-900/50 text-red-400' :
                              'bg-gray-700 text-gray-400'
                            }`}>
                              {courseData.rating}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <div className="font-bold text-gray-100">{playerAvg.toFixed(1)}</div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Course Records & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Best Rounds */}
        <Card title="Course Records" className="">
          <div className="space-y-3">
            {courseStatistics?.map((stats) => {
              // Find who shot the best round
              const bestPlayer = allPlayers?.find(player => {
                const coursePerf = player.coursePerformances.get(stats.name)
                return coursePerf?.bestRound === stats.bestScore
              })?.name || 'Unknown'
              
              return (
                <div key={stats.name} className="flex justify-between items-center p-3 rounded bg-gray-800/50">
                  <div>
                    <span className="text-gray-100 text-sm font-medium">{stats.name.split(' ')[0]}</span>
                    <span className="text-gray-400 text-xs ml-2">({bestPlayer})</span>
                  </div>
                  <span className="text-green-400 font-mono font-bold">{stats.bestScore}</span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Difficulty Analysis */}
        <Card title="Difficulty Analysis" className="">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-1" />
              <div>
                <h4 className="font-medium text-gray-100">Most Challenging</h4>
                <p className="text-sm text-gray-400">
                  {difficultyAnalysis?.mostDifficult.course.split(' ')[0]} (+{difficultyAnalysis?.mostDifficult.averageOverPar.toFixed(1)})
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Award className="h-5 w-5 text-green-400 mt-1" />
              <div>
                <h4 className="font-medium text-gray-100">Most Scoreable</h4>
                <p className="text-sm text-gray-400">
                  {difficultyAnalysis?.easiest.course.split(' ')[0]} (+{difficultyAnalysis?.easiest.averageOverPar.toFixed(1)})
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics Summary */}
        <Card title="Tournament Summary" className="">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <BarChart3 className="h-5 w-5 text-blue-400 mt-1" />
              <div>
                <h4 className="font-medium text-gray-100">Total Rounds</h4>
                <p className="text-sm text-gray-400">
                  {courseStatistics?.reduce((sum, stats) => sum + stats.roundsPlayed, 0) || 0} rounds played
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-purple-400 mt-1" />
              <div>
                <h4 className="font-medium text-gray-100">Courses Played</h4>
                <p className="text-sm text-gray-400">
                  {courseStatistics?.length || 0} different courses
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Score Distribution by Course */}
      <Card title="Score Ranges by Course" subtitle="Showing the spread between best and worst rounds">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courseStatistics?.map((stats, index) => {
            const range = stats.worstScore - stats.bestScore
            
            return (
              <div key={stats.name} className="text-center">
                <h4 className="font-medium text-gray-100 mb-3">{stats.name}</h4>
                <div className="relative h-32 flex items-end justify-center space-x-2">
                  {/* Best score bar */}
                  <div className="w-12 bg-green-600 rounded-t" style={{ height: `${(stats.bestScore / stats.worstScore) * 100}%` }}>
                    <div className="text-xs text-white font-bold mt-1">{stats.bestScore}</div>
                  </div>
                  {/* Average score bar */}
                  <div className="w-12 bg-blue-600 rounded-t" style={{ height: `${(stats.averageScore / stats.worstScore) * 100}%` }}>
                    <div className="text-xs text-white font-bold mt-1">{stats.averageScore.toFixed(0)}</div>
                  </div>
                  {/* Worst score bar */}
                  <div className="w-12 bg-red-600 rounded-t" style={{ height: '100%' }}>
                    <div className="text-xs text-white font-bold mt-1">{stats.worstScore}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Range: {range} strokes
                </div>
                <div className="mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(stats.difficultyRank)}`}>
                    Difficulty #{stats.difficultyRank}
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