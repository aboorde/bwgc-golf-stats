import React, { useState, useMemo } from 'react'
import Card from '../ui/Card'
import CourseLayoutChart from '../charts/CourseLayoutChart'
import HoleDifficultyHeatMap from '../charts/HoleDifficultyHeatMap'
import StrategicInsightsChart from '../charts/StrategicInsightsChart'
import { HoleAnalysisService } from '../../services/HoleAnalysisService'
import { usePlayerData } from '../../hooks'
import { 
  MapPin, 
  Thermometer, 
  Brain, 
  Filter, 
  BarChart3,
  Target,
  TrendingUp,
  Award,
  Users
} from 'lucide-react'
import { CourseName, PlayerName } from '../../models/tournament.types'

const HoleByHoleAnalysis: React.FC = () => {
  const { allPlayers, playerNames } = usePlayerData()
  const [selectedCourse, setSelectedCourse] = useState<CourseName>('Barefoot Dye')
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerName | null>(null)
  const [activeTab, setActiveTab] = useState<'layout' | 'heatmap' | 'strategy'>('layout')

  // Initialize hole analysis service
  const holeAnalysisService = useMemo(() => new HoleAnalysisService(), [])

  // Available courses
  const availableCourses: CourseName[] = ['Barefoot Dye', 'Aberdeen Country Club', 'Arcadian Shores']

  // Get hole analytics for selected course
  const courseAnalytics = useMemo(() => {
    return holeAnalysisService.getHoleAnalytics(selectedCourse)
  }, [holeAnalysisService, selectedCourse])

  // Get course hole details
  const courseHoles = useMemo(() => {
    return holeAnalysisService.getCourseHoles(selectedCourse) || []
  }, [holeAnalysisService, selectedCourse])

  // Get visualization data
  const visualizationData = useMemo(() => {
    return holeAnalysisService.getHoleVisualizationData(selectedCourse)
  }, [holeAnalysisService, selectedCourse])

  // Calculate course summary statistics
  const courseSummary = useMemo(() => {
    if (!courseAnalytics) return null

    const totalPar = courseHoles.reduce((sum, hole) => sum + hole.par, 0)
    const avgScore = courseAnalytics.holes.reduce((sum, hole) => sum + hole.averageScore, 0)
    const totalBirdies = courseAnalytics.holes.reduce((sum, hole) => sum + hole.birdieFrequency, 0)
    const hardestHole = courseAnalytics.courseDifficulty.hardestHoles[0]
    const easiestHole = courseAnalytics.courseDifficulty.easiestHoles[0]
    const scoringOpportunities = courseAnalytics.riskRewardAnalysis.scoringOpportunities.length
    const riskRewardHoles = courseAnalytics.riskRewardAnalysis.aggressiveHoles.length

    return {
      totalPar,
      avgScore,
      avgOverPar: avgScore - totalPar,
      totalBirdies,
      avgBirdieRate: totalBirdies / 18,
      hardestHole,
      easiestHole,
      scoringOpportunities,
      riskRewardHoles,
      playerCount: playerNames?.length || 0
    }
  }, [courseAnalytics, courseHoles, playerNames])

  if (!courseAnalytics || !courseSummary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading hole analysis...</div>
      </div>
    )
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'layout': return <MapPin className="h-4 w-4" />
      case 'heatmap': return <Thermometer className="h-4 w-4" />
      case 'strategy': return <Brain className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header and Course Selection */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100">Hole-by-Hole Analysis</h1>
          <p className="text-sm md:text-base text-gray-400 mt-2">
            Comprehensive strategic breakdown and performance insights
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Course Selection */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value as CourseName)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableCourses.map(course => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
          
          {/* Player Filter */}
          <select
            value={selectedPlayer || ''}
            onChange={(e) => setSelectedPlayer(e.target.value || null)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Players</option>
            {playerNames?.map(player => (
              <option key={player} value={player}>
                {player}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Summary Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-400">{courseSummary.totalPar}</div>
          <div className="text-sm text-gray-400">Total Par</div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-gray-100">{courseSummary.avgScore.toFixed(1)}</div>
          <div className="text-sm text-gray-400">Avg Score</div>
        </Card>
        
        <Card className="text-center p-4">
          <div className={`text-2xl font-bold ${courseSummary.avgOverPar >= 0 ? 'text-red-400' : 'text-green-400'}`}>
            {courseSummary.avgOverPar > 0 ? '+' : ''}{courseSummary.avgOverPar.toFixed(1)}
          </div>
          <div className="text-sm text-gray-400">Over Par</div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-400">{courseSummary.avgBirdieRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-400">Birdie Rate</div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-purple-400">{courseSummary.scoringOpportunities}</div>
          <div className="text-sm text-gray-400">Scoring Holes</div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-yellow-400">{courseSummary.riskRewardHoles}</div>
          <div className="text-sm text-gray-400">Risk/Reward</div>
        </Card>
      </div>

      {/* Key Insights Banner */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 rounded-lg border border-purple-600/30">
        <h3 className="font-semibold text-purple-300 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Key Course Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <TrendingUp className="h-5 w-5 text-red-400 mt-1" />
            <div>
              <h4 className="font-medium text-gray-100">Hardest Hole</h4>
              <p className="text-sm text-gray-300">
                Hole {courseSummary.hardestHole.hole} averaging +{courseSummary.hardestHole.avgOverPar.toFixed(1)} over par
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Award className="h-5 w-5 text-green-400 mt-1" />
            <div>
              <h4 className="font-medium text-gray-100">Best Scoring Opportunity</h4>
              <p className="text-sm text-gray-300">
                Hole {courseSummary.easiestHole.hole} with {courseSummary.easiestHole.avgOverPar.toFixed(1)} avg over par
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Users className="h-5 w-5 text-blue-400 mt-1" />
            <div>
              <h4 className="font-medium text-gray-100">Field Performance</h4>
              <p className="text-sm text-gray-300">
                {courseSummary.playerCount} players averaging {courseSummary.avgBirdieRate.toFixed(1)}% birdies
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'layout', label: 'Course Layout', icon: 'layout' },
            { id: 'heatmap', label: 'Performance Heat Map', icon: 'heatmap' },
            { id: 'strategy', label: 'Strategic Analysis', icon: 'strategy' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {getTabIcon(tab.icon)}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'layout' && (
          <Card className="p-6">
            <CourseLayoutChart
              courseData={visualizationData}
              holeDetails={courseHoles}
              selectedPlayer={selectedPlayer || undefined}
              height={600}
            />
          </Card>
        )}
        
        {activeTab === 'heatmap' && (
          <Card className="p-6">
            <HoleDifficultyHeatMap
              courseData={visualizationData}
              playerNames={playerNames || []}
              courseName={selectedCourse}
            />
          </Card>
        )}
        
        {activeTab === 'strategy' && (
          <Card className="p-6">
            <StrategicInsightsChart
              strategicInsights={courseAnalytics.strategicInsights}
              riskRewardAnalysis={courseAnalytics.riskRewardAnalysis}
              holeDetails={courseHoles}
              courseName={selectedCourse}
            />
          </Card>
        )}
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty vs Handicap Analysis */}
        <Card title="Handicap Accuracy Analysis" subtitle="How actual difficulty compares to hole handicap">
          <div className="space-y-4">
            {courseAnalytics.courseDifficulty.handicapAccuracy.slice(0, 6).map((hole) => (
              <div key={hole.hole} className="flex justify-between items-center p-3 rounded bg-gray-700/50">
                <div>
                  <span className="font-medium text-gray-100">Hole {hole.hole}</span>
                  <span className="text-sm text-gray-400 ml-2">
                    Handicap #{hole.expectedDifficulty}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">
                    Actual: #{hole.actualDifficulty}
                  </span>
                  {hole.actualDifficulty < hole.expectedDifficulty ? (
                    <TrendingUp className="h-4 w-4 text-red-400" />
                  ) : hole.actualDifficulty > hole.expectedDifficulty ? (
                    <TrendingUp className="h-4 w-4 text-green-400 transform rotate-180" />
                  ) : (
                    <Target className="h-4 w-4 text-blue-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Highlights */}
        <Card title="Performance Highlights" subtitle="Notable achievements and patterns">
          <div className="space-y-4">
            {/* Birdie Opportunities */}
            <div>
              <h4 className="font-medium text-green-400 mb-2 flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Best Birdie Opportunities
              </h4>
              <div className="space-y-2">
                {courseAnalytics.courseDifficulty.birdieOpportunities.slice(0, 3).map((hole) => (
                  <div key={hole.hole} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">
                      Hole {hole.hole} (Par {hole.par})
                    </span>
                    <span className="text-green-400 font-medium">
                      {hole.birdieRate.toFixed(1)}% birdie rate
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trouble Spots */}
            <div>
              <h4 className="font-medium text-red-400 mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trouble Spots
              </h4>
              <div className="space-y-2">
                {courseAnalytics.courseDifficulty.troubleSpots.slice(0, 3).map((hole) => (
                  <div key={hole.hole} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">
                      Hole {hole.hole} (Par {hole.par})
                    </span>
                    <span className="text-red-400 font-medium">
                      {hole.bogeyPlusRate.toFixed(1)}% double+
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Course Strategy Summary */}
      <Card title="Course Strategy Summary" subtitle={`Overall approach for playing ${selectedCourse}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-900/30 flex items-center justify-center">
              <Award className="h-8 w-8 text-green-400" />
            </div>
            <h4 className="font-medium text-gray-100 mb-2">Attack</h4>
            <p className="text-sm text-gray-400">
              {courseSummary.scoringOpportunities} holes offer good birdie chances
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-900/30 flex items-center justify-center">
              <Filter className="h-8 w-8 text-purple-400" />
            </div>
            <h4 className="font-medium text-gray-100 mb-2">Assess</h4>
            <p className="text-sm text-gray-400">
              {courseSummary.riskRewardHoles} holes require situational decisions
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-red-900/30 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-red-400" />
            </div>
            <h4 className="font-medium text-gray-100 mb-2">Avoid</h4>
            <p className="text-sm text-gray-400">
              Hole {courseSummary.hardestHole.hole} is the danger zone
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-900/30 flex items-center justify-center">
              <Target className="h-8 w-8 text-blue-400" />
            </div>
            <h4 className="font-medium text-gray-100 mb-2">Aim</h4>
            <p className="text-sm text-gray-400">
              Course management beats power every time
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default HoleByHoleAnalysis