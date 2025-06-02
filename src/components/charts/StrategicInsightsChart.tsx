import React, { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts'
import { 
  Lightbulb, 
  Zap, 
  Shield, 
  Target, 
  TrendingUp, 
  Award, 
  AlertTriangle,
  MapPin,
  Compass,
  Brain
} from 'lucide-react'
import { StrategicInsight, RiskRewardAnalysis, HoleInfo } from '../../models/tournament.types'

interface StrategicInsightsChartProps {
  strategicInsights: StrategicInsight[]
  riskRewardAnalysis: RiskRewardAnalysis
  holeDetails: HoleInfo[]
  courseName: string
}

type InsightView = 'strategy' | 'risk-reward' | 'scoring' | 'course-management'

const StrategicInsightsChart: React.FC<StrategicInsightsChartProps> = ({
  strategicInsights,
  riskRewardAnalysis,
  holeDetails,
  courseName
}) => {
  const [activeView, setActiveView] = useState<InsightView>('strategy')
  const [selectedHole, setSelectedHole] = useState<number | null>(null)

  // Process risk/reward data for visualization
  const riskRewardData = useMemo(() => {
    return riskRewardAnalysis.aggressiveHoles.map(hole => {
      const details = holeDetails.find(h => h.number === hole.hole)!
      const insight = strategicInsights.find(i => i.holeNumber === hole.hole)!
      
      return {
        hole: hole.hole,
        par: details.par,
        yardage: details.yardage,
        riskLevel: hole.riskLevel,
        reward: hole.avgReward,
        penalty: hole.avgPenalty,
        netValue: hole.avgReward - hole.avgPenalty,
        strategy: hole.recommendedStrategy,
        type: details.holeType,
        elements: details.strategicElements.join(', ')
      }
    })
  }, [riskRewardAnalysis, holeDetails, strategicInsights])

  // Categorize insights by type
  const insightsByCategory = useMemo(() => {
    const categories = {
      'risk-reward': strategicInsights.filter(i => i.category === 'risk-reward'),
      'scoring-opportunity': strategicInsights.filter(i => i.category === 'scoring-opportunity'),
      'damage-control': strategicInsights.filter(i => i.category === 'damage-control'),
      'course-management': strategicInsights.filter(i => i.category === 'course-management')
    }
    return categories
  }, [strategicInsights])

  // Scoring opportunities analysis
  const scoringData = useMemo(() => {
    return riskRewardAnalysis.scoringOpportunities.map(hole => {
      const details = holeDetails.find(h => h.number === hole.hole)!
      const isReachablePar5 = details.par === 5 && details.holeType === 'short-par-5'
      const isDriveablePar4 = details.par === 4 && details.holeType === 'short-par-4'
      
      return {
        hole: hole.hole,
        par: details.par,
        birdieRate: hole.birdieRate,
        eagleRate: hole.eagleRate,
        opportunity: isReachablePar5 ? 'Reachable Par 5' : 
                    isDriveablePar4 ? 'Driveable Par 4' :
                    details.par === 3 ? 'Scoring Par 3' : 'Birdie Par 4',
        strategy: hole.optimalApproach,
        yardage: details.yardage,
        handicap: details.handicap
      }
    }).sort((a, b) => b.birdieRate - a.birdieRate)
  }, [riskRewardAnalysis, holeDetails])

  // Course management insights
  const managementData = useMemo(() => {
    return riskRewardAnalysis.conservativeHoles.map(hole => {
      const details = holeDetails.find(h => h.number === hole.hole)!
      const insight = strategicInsights.find(i => i.holeNumber === hole.hole)!
      
      return {
        hole: hole.hole,
        par: details.par,
        parRate: hole.parProtectionRate,
        strategy: hole.bogeyAvoidanceStrategy,
        elements: details.strategicElements,
        handicap: details.handicap,
        difficulty: details.handicap <= 6 ? 'Hard' : details.handicap <= 12 ? 'Medium' : 'Easy'
      }
    })
  }, [riskRewardAnalysis, holeDetails])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'risk-reward': return <Zap className="h-4 w-4" />
      case 'scoring-opportunity': return <Award className="h-4 w-4" />
      case 'damage-control': return <Shield className="h-4 w-4" />
      case 'course-management': return <Compass className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'risk-reward': return 'text-purple-400 bg-purple-900/20'
      case 'scoring-opportunity': return 'text-green-400 bg-green-900/20'
      case 'damage-control': return 'text-red-400 bg-red-900/20'
      case 'course-management': return 'text-blue-400 bg-blue-900/20'
      default: return 'text-gray-400 bg-gray-700'
    }
  }

  const getRiskColor = (riskLevel: number) => {
    if (riskLevel >= 7) return '#ef4444' // High risk
    if (riskLevel >= 4) return '#f59e0b' // Medium risk
    return '#10b981' // Low risk
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-800 p-4 border border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-100 mb-2">
            Hole {data.hole} - Par {data.par}
          </p>
          <div className="space-y-1 text-sm">
            {data.birdieRate && (
              <div className="flex justify-between">
                <span className="text-gray-400">Birdie Rate:</span>
                <span className="text-green-400">{data.birdieRate.toFixed(1)}%</span>
              </div>
            )}
            {data.riskLevel && (
              <div className="flex justify-between">
                <span className="text-gray-400">Risk Level:</span>
                <span className="text-gray-100">{data.riskLevel.toFixed(1)}/10</span>
              </div>
            )}
            {data.strategy && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <p className="text-xs text-gray-400 mb-1">Strategy:</p>
                <p className="text-xs text-gray-300">{data.strategy}</p>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header and Navigation */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-100 flex items-center">
            <Brain className="h-6 w-6 mr-2 text-purple-400" />
            Strategic Course Analysis
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Advanced insights and course management strategies for {courseName}
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveView('strategy')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'strategy'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Lightbulb className="h-4 w-4 inline mr-1" />
            Insights
          </button>
          <button
            onClick={() => setActiveView('risk-reward')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'risk-reward'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Zap className="h-4 w-4 inline mr-1" />
            Risk/Reward
          </button>
          <button
            onClick={() => setActiveView('scoring')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'scoring'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Award className="h-4 w-4 inline mr-1" />
            Scoring
          </button>
          <button
            onClick={() => setActiveView('course-management')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'course-management'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Compass className="h-4 w-4 inline mr-1" />
            Management
          </button>
        </div>
      </div>

      {/* Strategic Insights Overview */}
      {activeView === 'strategy' && (
        <div className="space-y-6">
          {/* Insights by Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(insightsByCategory).map(([category, insights]) => (
              <div key={category} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h4 className={`font-semibold mb-4 flex items-center ${getCategoryColor(category)}`}>
                  {getCategoryIcon(category)}
                  <span className="ml-2 capitalize">{category.replace('-', ' ')}</span>
                  <span className="ml-2 text-sm">({insights.length})</span>
                </h4>
                <div className="space-y-3">
                  {insights.slice(0, 3).map((insight) => (
                    <div 
                      key={insight.holeNumber}
                      className="p-3 rounded bg-gray-700/50 hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => setSelectedHole(selectedHole === insight.holeNumber ? null : insight.holeNumber)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-100">
                          Hole {insight.holeNumber} (Par {insight.par})
                        </span>
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{insight.insight}</p>
                      <p className="text-xs text-gray-400 italic">{insight.recommendedStrategy}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Key Strategic Themes */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-lg border border-gray-600">
            <h4 className="font-semibold text-gray-100 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-400" />
              Key Strategic Themes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {insightsByCategory['scoring-opportunity'].length}
                </div>
                <div className="text-sm text-gray-400">Scoring Opportunities</div>
                <div className="text-xs text-gray-500 mt-1">Attack these holes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {insightsByCategory['risk-reward'].length}
                </div>
                <div className="text-sm text-gray-400">Risk/Reward Holes</div>
                <div className="text-xs text-gray-500 mt-1">Situational decisions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {insightsByCategory['damage-control'].length}
                </div>
                <div className="text-sm text-gray-400">Damage Control</div>
                <div className="text-xs text-gray-500 mt-1">Play conservative</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk/Reward Analysis */}
      {activeView === 'risk-reward' && (
        <div className="space-y-6">
          {/* Risk vs Reward Scatter Plot */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h4 className="font-semibold text-gray-100 mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-purple-400" />
              Risk vs Reward Analysis
            </h4>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number"
                  dataKey="riskLevel"
                  domain={[0, 10]}
                  stroke="#9CA3AF"
                  label={{ value: 'Risk Level', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  type="number"
                  dataKey="reward"
                  stroke="#9CA3AF"
                  label={{ value: 'Birdie Rate %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter data={riskRewardData} fill="#8b5cf6">
                  {riskRewardData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getRiskColor(entry.riskLevel)}
                      r={6 + (entry.par - 3) * 2} // Size by par
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Risk/Reward Hole Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h5 className="font-medium text-gray-100 mb-4 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-400" />
                High Reward Holes
              </h5>
              <div className="space-y-3">
                {riskRewardData
                  .filter(h => h.reward > 15)
                  .sort((a, b) => b.reward - a.reward)
                  .map((hole) => (
                    <div key={hole.hole} className="p-3 rounded bg-green-900/20 border border-green-700/50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-100">
                          Hole {hole.hole} (Par {hole.par})
                        </span>
                        <span className="text-green-400 font-bold">
                          {hole.reward.toFixed(1)}% birdie
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{hole.strategy}</p>
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>{hole.yardage} yards</span>
                        <span>Risk: {hole.riskLevel.toFixed(1)}/10</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h5 className="font-medium text-gray-100 mb-4 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-400" />
                High Risk Holes
              </h5>
              <div className="space-y-3">
                {riskRewardData
                  .filter(h => h.riskLevel > 5)
                  .sort((a, b) => b.riskLevel - a.riskLevel)
                  .map((hole) => (
                    <div key={hole.hole} className="p-3 rounded bg-red-900/20 border border-red-700/50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-100">
                          Hole {hole.hole} (Par {hole.par})
                        </span>
                        <span className="text-red-400 font-bold">
                          {hole.riskLevel.toFixed(1)}/10 risk
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{hole.strategy}</p>
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>Penalty: {hole.penalty.toFixed(1)}%</span>
                        <span>Net: {hole.netValue.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Opportunities */}
      {activeView === 'scoring' && (
        <div className="space-y-6">
          {/* Scoring Chart */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h4 className="font-semibold text-gray-100 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-green-400" />
              Birdie Opportunities by Hole
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoringData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="hole"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  label={{ value: 'Birdie Rate %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="birdieRate" radius={[2, 2, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Scoring Strategies */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scoringData.map((hole) => (
              <div key={hole.hole} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-medium text-gray-100">
                      Hole {hole.hole}
                    </h5>
                    <p className="text-sm text-gray-400">Par {hole.par} • {hole.yardage}y</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {hole.birdieRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">birdie rate</div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    hole.opportunity.includes('Par 5') ? 'bg-purple-900/50 text-purple-400' :
                    hole.opportunity.includes('Par 4') ? 'bg-blue-900/50 text-blue-400' :
                    'bg-green-900/50 text-green-400'
                  }`}>
                    {hole.opportunity}
                  </span>
                </div>
                
                <p className="text-sm text-gray-300 mb-2">{hole.strategy}</p>
                
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Handicap #{hole.handicap}</span>
                  {hole.eagleRate > 0 && (
                    <span className="text-yellow-400">Eagle: {hole.eagleRate}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Management */}
      {activeView === 'course-management' && (
        <div className="space-y-6">
          {/* Management Philosophy */}
          <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 p-6 rounded-lg border border-blue-600/30">
            <h4 className="font-semibold text-blue-300 mb-4 flex items-center">
              <Compass className="h-5 w-5 mr-2" />
              Course Management Philosophy
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-green-400" />
                <h5 className="font-medium text-gray-100 mb-1">Conservative Holes</h5>
                <p className="text-sm text-gray-300">
                  {managementData.length} holes where par protection is key
                </p>
              </div>
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                <h5 className="font-medium text-gray-100 mb-1">Smart Targets</h5>
                <p className="text-sm text-gray-300">
                  Aim for center of greens and wide fairways
                </p>
              </div>
              <div className="text-center">
                <Brain className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                <h5 className="font-medium text-gray-100 mb-1">Strategic Thinking</h5>
                <p className="text-sm text-gray-300">
                  Course knowledge beats power every time
                </p>
              </div>
            </div>
          </div>

          {/* Management Strategies by Hole */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {managementData.map((hole) => (
              <div key={hole.hole} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h5 className="font-medium text-gray-100">
                      Hole {hole.hole} (Par {hole.par})
                    </h5>
                    <p className="text-sm text-gray-400">
                      Handicap #{hole.handicap} • {hole.difficulty} Difficulty
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-400">
                      {hole.parRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">par rate</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h6 className="font-medium text-gray-100 mb-2">Strategy:</h6>
                  <p className="text-sm text-gray-300">{hole.strategy}</p>
                </div>
                
                <div className="mb-3">
                  <h6 className="font-medium text-gray-100 mb-2">Key Elements:</h6>
                  <div className="flex flex-wrap gap-1">
                    {hole.elements.map((element, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                      >
                        {element.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg ${
                  hole.difficulty === 'Hard' ? 'bg-red-900/20 border border-red-700/50' :
                  hole.difficulty === 'Medium' ? 'bg-yellow-900/20 border border-yellow-700/50' :
                  'bg-green-900/20 border border-green-700/50'
                }`}>
                  <p className="text-xs text-gray-300">
                    <strong>Priority:</strong> {
                      hole.difficulty === 'Hard' ? 'Avoid big numbers - bogey is acceptable' :
                      hole.difficulty === 'Medium' ? 'Solid par with occasional birdie' :
                      'Birdie opportunity if played smart'
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Hole Detail */}
      {selectedHole && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-lg border border-gray-600">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-semibold text-gray-100 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-purple-400" />
              Hole {selectedHole} Strategic Breakdown
            </h4>
            <button
              onClick={() => setSelectedHole(null)}
              className="text-gray-400 hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          
          {(() => {
            const insight = strategicInsights.find(i => i.holeNumber === selectedHole)!
            const details = holeDetails.find(h => h.number === selectedHole)!
            const riskData = riskRewardData.find(r => r.hole === selectedHole)
            const scoringData_item = scoringData.find(s => s.hole === selectedHole)
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h5 className="font-medium text-gray-100 mb-3">Hole Details</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Par:</span>
                      <span className="text-gray-100">{details.par}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Yardage:</span>
                      <span className="text-gray-100">{details.yardage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Handicap:</span>
                      <span className="text-gray-100">#{details.handicap}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-gray-100">{details.holeType.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-100 mb-3">Strategic Insight</h5>
                  <p className="text-sm text-gray-300 mb-3">{insight.insight}</p>
                  <p className="text-sm text-blue-400 italic">{insight.recommendedStrategy}</p>
                  {insight.alternativeStrategies && insight.alternativeStrategies.length > 0 && (
                    <div className="mt-3">
                      <h6 className="text-xs text-gray-400 mb-1">Alternative Strategies:</h6>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {insight.alternativeStrategies.map((strategy, idx) => (
                          <li key={idx}>• {strategy}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-100 mb-3">Performance Data</h5>
                  <div className="space-y-2 text-sm">
                    {riskData && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Risk Level:</span>
                          <span className="text-gray-100">{riskData.riskLevel.toFixed(1)}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Birdie Rate:</span>
                          <span className="text-green-400">{riskData.reward.toFixed(1)}%</span>
                        </div>
                      </>
                    )}
                    {scoringData_item && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Opportunity:</span>
                        <span className="text-gray-100">{scoringData_item.opportunity}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

export default StrategicInsightsChart