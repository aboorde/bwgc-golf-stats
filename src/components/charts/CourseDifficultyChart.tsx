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
import { getCourseData, data } from '../../utils/data'
import { Mountain, TrendingUp, Award, AlertTriangle } from 'lucide-react'

interface CourseDifficultyChartProps {
  height?: number
}

const CourseDifficultyChart: React.FC<CourseDifficultyChartProps> = ({ height }) => {
  // Responsive height - smaller on mobile
  const responsiveHeight = height || (typeof window !== 'undefined' && window.innerWidth < 768 ? 300 : 400)
  const courseData = getCourseData()
  const [sortBy, setSortBy] = useState<'difficulty' | 'average' | 'name'>('difficulty')

  // Sort courses based on selected criteria
  const sortedCourses = React.useMemo(() => {
    // Add difficulty ranking based on average_over_par
    const coursesWithRanking = courseData.map(course => {
      const ranking = data.course_analysis.difficulty_ranking
        ? data.course_analysis.difficulty_ranking.findIndex(c => c.course === course.course) + 1
        : 0
      return {
        ...course,
        difficulty_ranking: ranking,
        par: 72 // All courses are par 72
      }
    })
    
    const sorted = [...coursesWithRanking]
    
    switch (sortBy) {
      case 'difficulty':
        return sorted.sort((a, b) => b.average_over_par - a.average_over_par)
      case 'average':
        return sorted.sort((a, b) => b.average_score - a.average_score)
      case 'name':
        return sorted.sort((a, b) => a.course.localeCompare(b.course))
      default:
        return sorted
    }
  }, [courseData, sortBy])

  // Color based on difficulty ranking
  const getBarColor = (difficulty: number) => {
    if (difficulty === 1) return '#ef4444' // Red - hardest
    if (difficulty === 2) return '#f59e0b' // Orange - moderate
    if (difficulty === 3) return '#10b981' // Green - easiest
    return '#6b7280' // Gray - default
  }

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty === 1) return 'Most Difficult'
    if (difficulty === 2) return 'Moderate'
    return 'Easiest'
  }

  const getDifficultyIcon = (difficulty: number) => {
    if (difficulty === 1) return AlertTriangle
    if (difficulty === 2) return TrendingUp
    return Award
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-700">
              <strong>Average Score:</strong> {data.average_score.toFixed(1)}
            </p>
            <p className="text-gray-700">
              <strong>Par:</strong> {data.par || 72}
            </p>
            <p className="text-gray-700">
              <strong>Over Par:</strong> +{data.average_over_par.toFixed(1)}
            </p>
            <p className="text-gray-700">
              <strong>Rounds Played:</strong> {data.rounds_played}
            </p>
            <p className="text-gray-700">
              <strong>Best Score:</strong> {data.best_score}
            </p>
            <p className="text-gray-700">
              <strong>Worst Score:</strong> {data.worst_score}
            </p>
            <p className="text-gray-700">
              <strong>Difficulty Rank:</strong> #{data.difficulty_ranking} ({getDifficultyLabel(data.difficulty_ranking)})
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Difficulty Analysis</h2>
          <p className="text-sm text-gray-600">Comparing average scores across all courses</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSortBy('difficulty')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'difficulty'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            By Difficulty
          </button>
          <button
            onClick={() => setSortBy('average')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'average'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            By Average Score
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'name'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Alphabetical
          </button>
        </div>
      </div>

      {/* Course Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedCourses.map((course, index) => {
          const Icon = getDifficultyIcon(course.difficulty_ranking)
          const overPar = course.average_score - course.par
          
          return (
            <div 
              key={course.course}
              className="p-4 rounded-lg border"
              style={{ borderColor: getBarColor(course.difficulty_ranking) }}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon 
                  className="h-6 w-6" 
                  style={{ color: getBarColor(course.difficulty_ranking) }}
                />
                <span className="text-xs font-medium text-gray-500">
                  #{course.difficulty_ranking}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                {course.course}
              </h3>
              
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Avg Score:</span>
                  <span className="font-medium">{course.average_score?.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Over Par:</span>
                  <span 
                    className="font-medium"
                    style={{ color: getBarColor(course.difficulty_ranking) }}
                  >
                    +{overPar.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Best Score:</span>
                  <span className="font-medium">{course.best_score}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Average Scores by Course
        </h3>
        <ResponsiveContainer width="100%" height={responsiveHeight}>
          <BarChart 
            data={sortedCourses}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="course"
              stroke="#666"
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#666"
              tick={{ fontSize: 12 }}
              label={{ value: 'Average Score', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="average_score" 
              radius={[4, 4, 0, 0]}
              stroke="#fff"
              strokeWidth={1}
            >
              {sortedCourses.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.difficulty_ranking)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Course Analysis Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Rankings */}
        <div className="p-6 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Mountain className="h-5 w-5 text-gray-600 mr-2" />
            Difficulty Rankings
          </h4>
          <div className="space-y-3">
            {sortedCourses
              .sort((a, b) => a.difficulty_ranking - b.difficulty_ranking)
              .map((course, index) => {
                const overPar = course.average_score - course.par
                return (
                  <div key={course.course} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: getBarColor(course.difficulty_ranking) }}
                      >
                        {course.difficulty_ranking}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {course.course}
                        </div>
                        <div className="text-xs text-gray-500">
                          Par {course.par || 72}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {course.average_score?.toFixed(1)}
                      </div>
                      <div 
                        className="text-xs font-medium"
                        style={{ color: getBarColor(course.difficulty_ranking) }}
                      >
                        +{overPar.toFixed(1)}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Score Range Analysis */}
        <div className="p-6 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-4">Score Range Analysis</h4>
          <div className="space-y-4">
            {sortedCourses.map(course => {
              const range = course.worst_score - course.best_score
              const overPar = course.average_over_par
              
              return (
                <div key={course.course} className="p-3 bg-white rounded border">
                  <div className="font-medium text-gray-900 text-sm mb-2">
                    {course.course}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="text-green-600 font-medium">{course.best_score}</div>
                      <div className="text-gray-500">Best</div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-medium">{course.average_score?.toFixed(1)}</div>
                      <div className="text-gray-500">Average</div>
                    </div>
                    <div>
                      <div className="text-red-600 font-medium">{course.worst_score}</div>
                      <div className="text-gray-500">Worst</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                    Range: {range} strokes • Avg over par: +{overPar.toFixed(1)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDifficultyChart