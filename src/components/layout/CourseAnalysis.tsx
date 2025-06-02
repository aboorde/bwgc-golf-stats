import React from 'react'
import Card from '../ui/Card'
import BarChart from '../charts/BarChart'
import { MapPin, TrendingUp, Award } from 'lucide-react'

const CourseAnalysis: React.FC = () => {
  // Placeholder data - will be replaced with real course analysis
  const courseDifficultyData = [
    { 
      course: 'Barefoot Dye', 
      avgScore: 115.5, 
      avgOverPar: 43.5,
      difficulty: 'Very Hard'
    },
    { 
      course: 'Aberdeen CC', 
      avgScore: 103.8, 
      avgOverPar: 31.8,
      difficulty: 'Hard' 
    },
    { 
      course: 'Arcadian Shores', 
      avgScore: 99.5, 
      avgOverPar: 27.5,
      difficulty: 'Moderate'
    },
  ]

  const barConfig = [
    { key: 'avgOverPar', name: 'Average Over Par', color: '#ef4444' }
  ]

  return (
    <div className="space-y-8">
      {/* Course Difficulty Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courseDifficultyData.map((course) => (
          <Card key={course.course} className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-golf-green bg-opacity-10 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-golf-green" />
              </div>
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              {course.course}
            </h3>
            <div className="space-y-2">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  +{course.avgOverPar}
                </div>
                <div className="text-sm text-gray-600">Average Over Par</div>
              </div>
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  course.difficulty === 'Very Hard' 
                    ? 'bg-red-100 text-red-800'
                    : course.difficulty === 'Hard'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {course.difficulty}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Course Difficulty Chart */}
      <Card title="Course Difficulty Comparison" subtitle="Average strokes over par by course">
        <BarChart
          data={courseDifficultyData}
          xKey="course"
          bars={barConfig}
          height={300}
        />
      </Card>

      {/* Course Performance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Best Course Performances */}
        <Card title="Best Individual Performances by Course">
          <div className="space-y-4">
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-green-800">Barefoot Dye</h4>
                  <p className="text-sm text-green-600">Mike - 97 strokes</p>
                  <p className="text-xs text-green-500">+25 over par</p>
                </div>
                <Award className="h-5 w-5 text-green-600" />
              </div>
            </div>

            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-blue-800">Aberdeen Country Club</h4>
                  <p className="text-sm text-blue-600">Mike - 88 strokes</p>
                  <p className="text-xs text-blue-500">+16 over par</p>
                </div>
                <Award className="h-5 w-5 text-blue-600" />
              </div>
            </div>

            <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-purple-800">Arcadian Shores</h4>
                  <p className="text-sm text-purple-600">Mike - 84 strokes</p>
                  <p className="text-xs text-purple-500">+12 over par</p>
                </div>
                <Award className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </Card>

        {/* Course Insights */}
        <Card title="Course Analysis Insights">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-red-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Most Challenging</h4>
                <p className="text-sm text-gray-600">
                  Barefoot Dye proved the toughest test with players averaging 43.5 strokes over par
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Most Scoreable</h4>
                <p className="text-sm text-gray-600">
                  Arcadian Shores offered the best scoring opportunities on the final day
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Award className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Course Crusher</h4>
                <p className="text-sm text-gray-600">
                  Mike dominated every course, posting the best score on all three layouts
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default CourseAnalysis