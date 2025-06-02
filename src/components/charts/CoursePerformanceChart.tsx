import React, { useState } from 'react'
import { data, getPlayerList } from '../../utils/data'
import { MapPin, Trophy, Target, TrendingUp } from 'lucide-react'

interface CoursePerformanceChartProps {
  height?: number
}

const CoursePerformanceChart: React.FC<CoursePerformanceChartProps> = ({ height }) => {
  // Responsive height - smaller on mobile
  const responsiveHeight = height || (typeof window !== 'undefined' && window.innerWidth < 768 ? 350 : 600)
  const players = getPlayerList()
  const courses = Object.keys(data.course_analysis.course_stats)
  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0])
  
  // Get course statistics
  const courseStats = data.course_analysis.course_stats[selectedCourse]
  
  // Get player performances for selected course
  const playerPerformances = players.map(player => {
    const playerData = data.player_statistics[player]
    const coursePerf = playerData?.course_performance[selectedCourse]
    
    return {
      player,
      average_score: coursePerf?.average_score || 0,
      best_round: coursePerf?.best_round || 0,
      performance_rating: coursePerf?.performance_rating || 'N/A',
      relative_to_par: coursePerf?.average_relative_to_par || 0
    }
  }).sort((a, b) => a.average_score - b.average_score)
  
  // Get difficulty ranking
  const difficultyRank = data.course_analysis.difficulty_ranking.findIndex(
    c => c.course === selectedCourse
  ) + 1
  
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Excelled': return 'text-green-400 bg-green-900/20'
      case 'Solid': return 'text-blue-400 bg-blue-900/20'
      case 'Struggled': return 'text-red-400 bg-red-900/20'
      default: return 'text-gray-400 bg-gray-800'
    }
  }
  
  const getDifficultyColor = (rank: number) => {
    if (rank === 1) return 'text-red-600'
    if (rank === 2) return 'text-orange-600'
    return 'text-green-600'
  }
  
  // Find best performer
  const bestPerformer = playerPerformances[0]
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-100">Course Performance Analysis</h2>
        <p className="text-sm text-gray-400 mt-2">
          Player performance breakdown by course
        </p>
      </div>
      
      {/* Course Selection */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
          {courses.map(course => (
            <button
              key={course}
              onClick={() => setSelectedCourse(course)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedCourse === course
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {course}
            </button>
          ))}
        </div>
      </div>
      
      {/* Course Overview */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-lg border border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-100 flex items-center">
            <MapPin className="h-6 w-6 mr-2 text-blue-600" />
            {selectedCourse}
          </h3>
          <div className={`text-lg font-bold ${getDifficultyColor(difficultyRank)}`}>
            #{difficultyRank} Difficulty
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-gray-100">
              {courseStats.average_score.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Avg Score</div>
          </div>
          <div className="text-center p-3 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-red-400">
              +{courseStats.average_over_par.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Over Par</div>
          </div>
          <div className="text-center p-3 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-green-400">
              {courseStats.best_score}
            </div>
            <div className="text-sm text-gray-400">Best Score</div>
          </div>
          <div className="text-center p-3 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-orange-400">
              {courseStats.worst_score}
            </div>
            <div className="text-sm text-gray-400">Worst Score</div>
          </div>
        </div>
      </div>
      
      {/* Best Performer Banner */}
      {bestPerformer && (
        <div className="p-4 bg-gradient-to-r from-yellow-900/20 to-yellow-900/10 rounded-lg border border-yellow-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="h-6 w-6 text-yellow-400" />
              <div>
                <p className="font-semibold text-yellow-100">
                  Best at {selectedCourse}: {bestPerformer.player}
                </p>
                <p className="text-sm text-yellow-300">
                  Average score: {bestPerformer.average_score.toFixed(1)} (+{bestPerformer.relative_to_par.toFixed(1)})
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Player Performance Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 bg-gray-900">
          <h3 className="font-semibold text-gray-100">Player Performance Rankings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">Rank</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">Player</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-300">Avg Score</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-300">To Par</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-300">Best Round</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-300">Rating</th>
              </tr>
            </thead>
            <tbody>
              {playerPerformances.map((perf, index) => {
                const isFirst = index === 0
                const isLast = index === playerPerformances.length - 1
                
                return (
                  <tr 
                    key={perf.player}
                    className={`border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                      isFirst ? 'bg-yellow-900/10' : ''
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        {index === 0 && <Trophy className="h-4 w-4 text-yellow-600" />}
                        {index === 1 && <Target className="h-4 w-4 text-gray-400" />}
                        {index === 2 && <TrendingUp className="h-4 w-4 text-orange-600" />}
                        <span className="font-semibold text-gray-100">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-100">{perf.player}</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className={`font-bold ${
                        isFirst ? 'text-green-400' : isLast ? 'text-red-400' : 'text-gray-100'
                      }`}>
                        {perf.average_score.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="font-medium text-gray-300">
                        +{perf.relative_to_par.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="font-medium text-blue-400">
                        {perf.best_round}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRatingColor(perf.performance_rating)}`}>
                        {perf.performance_rating}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Course Comparison Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map(course => {
          const stats = data.course_analysis.course_stats[course]
          const rank = data.course_analysis.difficulty_ranking.findIndex(c => c.course === course) + 1
          
          return (
            <div 
              key={course}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedCourse === course 
                  ? 'border-blue-500 bg-blue-900/20' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setSelectedCourse(course)}
            >
              <h4 className="font-semibold text-gray-100 mb-2">{course}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Difficulty:</span>
                  <span className={`font-medium ${getDifficultyColor(rank)}`}>
                    #{rank}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Score:</span>
                  <span className="font-medium">{stats.average_score.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Over Par:</span>
                  <span className="font-medium text-red-600">+{stats.average_over_par.toFixed(1)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CoursePerformanceChart