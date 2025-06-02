import React, { useState, useMemo } from 'react'
import { data, getPlayerList } from '../../utils/data'
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  Crown,
  Mountain,
  Users,
  Award,
  BarChart3,
  RefreshCw
} from 'lucide-react'

interface FunFactsProps {
  refreshInterval?: number
  showCategories?: boolean
}

const FunFacts: React.FC<FunFactsProps> = ({ 
  refreshInterval = 5000,
  showCategories = true 
}) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const players = getPlayerList()

  // Generate comprehensive fun facts
  const funFacts = useMemo(() => {
    const facts = []

    // Tournament Champion Facts
    const winner = data.tournament_summary.winner
    const winnerStats = data.player_statistics[winner]
    facts.push({
      category: 'Champion',
      icon: Crown,
      color: 'text-yellow-400',
      bg: 'bg-yellow-900',
      border: 'border-yellow-600',
      title: 'Tournament Domination',
      fact: `${winner} won by ${data.tournament_summary.leaderboard[1].total_score - data.tournament_summary.winning_score} strokes with a ${winnerStats.basic_stats.scoring_average.toFixed(1)} average!`
    })

    // Most Consistent Player
    const mostConsistent = players.reduce((best, player) => {
      const current = data.player_statistics[player]?.consistency.score_standard_deviation || Infinity
      const bestVal = data.player_statistics[best]?.consistency.score_standard_deviation || Infinity
      return current < bestVal ? player : best
    })
    facts.push({
      category: 'Consistency',
      icon: Target,
      color: 'text-blue-400',
      bg: 'bg-blue-900',
      border: 'border-blue-600',
      title: 'Mr. Reliable',
      fact: `${mostConsistent} was the most consistent player with only ${data.player_statistics[mostConsistent].consistency.score_standard_deviation.toFixed(1)} strokes standard deviation!`
    })

    // Biggest Comeback
    const comebacks = players.map(player => {
      const daily = Object.values(data.player_statistics[player]?.daily_performance || {})
      if (daily.length < 2) return { player, comeback: 0 }
      return {
        player,
        comeback: daily[0].score - daily[daily.length - 1].score
      }
    }).filter(p => p.comeback > 0)
    
    if (comebacks.length > 0) {
      const biggestComeback = comebacks.reduce((best, current) => 
        current.comeback > best.comeback ? current : best
      )
      facts.push({
        category: 'Comeback',
        icon: TrendingUp,
        color: 'text-green-400',
        bg: 'bg-green-900',
        border: 'border-green-600',
        title: 'The Phoenix',
        fact: `${biggestComeback.player} had the biggest comeback, improving ${biggestComeback.comeback} strokes from first to last round!`
      })
    }

    // Course Crusher
    const coursePerformances: Array<{
      player: string
      course: string
      score: number
      rating: string
    }> = []
    Object.keys(data.course_analysis.course_stats || {}).forEach(course => {
      players.forEach(player => {
        const courseStats = data.player_statistics[player]?.course_performance[course]
        if (courseStats) {
          coursePerformances.push({
            player,
            course,
            score: courseStats.average_score,
            rating: courseStats.performance_rating
          })
        }
      })
    })

    if (coursePerformances.length > 0) {
      const bestCoursePerformance = coursePerformances.reduce((best, current) => 
        current.score < best.score ? current : best
      )
      facts.push({
        category: 'Course Master',
        icon: Mountain,
        color: 'text-indigo-400',
        bg: 'bg-indigo-900',
        border: 'border-indigo-600',
        title: 'Course Crusher',
        fact: `${bestCoursePerformance.player} performed best at ${bestCoursePerformance.course} with an average score of ${bestCoursePerformance.score.toFixed(1)}!`
      })
    }

    // Match Play Dominator
    const matchPlayKing = players.reduce((best, player) => {
      const current = data.player_statistics[player]?.match_play_performance.total_points || 0
      const bestVal = data.player_statistics[best]?.match_play_performance.total_points || 0
      return current > bestVal ? player : best
    })
    const matchPlayStats = data.player_statistics[matchPlayKing].match_play_performance
    facts.push({
      category: 'Match Play',
      icon: Zap,
      color: 'text-purple-400',
      bg: 'bg-purple-900',
      border: 'border-purple-600',
      title: 'Head-to-Head Hero',
      fact: `${matchPlayKing} dominated match play with ${matchPlayStats.total_points} points and a ${matchPlayStats.win_percentage.toFixed(1)}% win rate!`
    })

    // Lowest Single Round
    const allRounds: Array<{
      player: string
      score: number
      course: string
      day: any
    }> = []
    players.forEach(player => {
      const daily = Object.values(data.player_statistics[player]?.daily_performance || {})
      daily.forEach(day => {
        allRounds.push({ player, score: day.score, course: day.course, day: day })
      })
    })
    const lowestRound = allRounds.reduce((best, current) => 
      current.score < best.score ? current : best
    )
    facts.push({
      category: 'Hot Round',
      icon: Award,
      color: 'text-orange-400',
      bg: 'bg-orange-900',
      border: 'border-orange-600',
      title: 'Round of the Tournament',
      fact: `${lowestRound.player} fired the tournament's lowest round with a ${lowestRound.score} at ${lowestRound.course}!`
    })

    // Team Performance
    const teamStats = [
      {
        team: 'Banana Boys',
        players: ['Mike', 'Ryan', 'Nixon', 'Doug'],
        totalScore: 0,
        avgScore: 0
      },
      {
        team: '3 Lefties make a Righty', 
        players: ['Jimbo', 'AJ', 'Todd', 'Dave'],
        totalScore: 0,
        avgScore: 0
      }
    ]

    teamStats.forEach(team => {
      team.totalScore = team.players.reduce((sum, player) => {
        const playerData = data.tournament_summary.leaderboard.find(p => p.player === player)
        return sum + (playerData?.total_score || 0)
      }, 0)
      team.avgScore = team.totalScore / team.players.length
    })

    const winningTeam = teamStats.reduce((best, current) => 
      current.avgScore < best.avgScore ? current : best
    )
    const margin = Math.abs(teamStats[0].avgScore - teamStats[1].avgScore)
    facts.push({
      category: 'Team Battle',
      icon: Users,
      color: 'text-teal-400',
      bg: 'bg-teal-900',
      border: 'border-teal-600',
      title: 'Team Champions',
      fact: `Team ${winningTeam.team} won the team battle by ${margin.toFixed(1)} strokes per player on average!`
    })

    // Scoring Spread
    const totalScores = data.tournament_summary.leaderboard.map(p => p.total_score)
    const spread = Math.max(...totalScores) - Math.min(...totalScores)
    facts.push({
      category: 'Competition',
      icon: BarChart3,
      color: 'text-red-400',
      bg: 'bg-red-900',
      border: 'border-red-600',
      title: 'Competitive Field',
      fact: `The tournament had a ${spread}-stroke spread from first to last place, showing how competitive our group is!`
    })

    // Par Performance
    const totalPars = players.reduce((sum, player) => {
      return sum + (data.player_statistics[player]?.detailed_performance.pars || 0)
    }, 0)
    const totalHoles = players.length * 54 // 3 rounds of 18 holes each
    const parPercentage = (totalPars / totalHoles * 100).toFixed(1)
    facts.push({
      category: 'Scoring',
      icon: Target,
      color: 'text-emerald-400',
      bg: 'bg-emerald-900',
      border: 'border-emerald-600',
      title: 'Par Performance',
      fact: `The group made par on ${parPercentage}% of holes played, with ${totalPars} total pars across all rounds!`
    })

    // Weather the Storm (highest scoring round)
    const highestRound = allRounds.reduce((worst, current) => 
      current.score > worst.score ? current : worst
    )
    facts.push({
      category: 'Tough Day',
      icon: TrendingDown,
      color: 'text-gray-400',
      bg: 'bg-gray-800',
      border: 'border-gray-600',
      title: 'Weathered the Storm',
      fact: `Everyone has tough days - the highest round was ${highestRound.score} by ${highestRound.player} at ${highestRound.course}!`
    })

    return facts
  }, [players])

  // Auto-advance facts
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % funFacts.length)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [funFacts.length, refreshInterval])

  const currentFact = funFacts[currentFactIndex]
  const categories = Array.from(new Set(funFacts.map(f => f.category)))

  return (
    <div className="space-y-6">
      {/* Main Fun Fact Display */}
      <div className={`p-6 rounded-xl border-2 ${currentFact.border} ${currentFact.bg} transition-all duration-500`}>
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full bg-gray-800 shadow-sm`}>
            <currentFact.icon className={`h-6 w-6 ${currentFact.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-lg font-bold ${currentFact.color}`}>
                {currentFact.title}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">
                  {currentFactIndex + 1} / {funFacts.length}
                </span>
                <button
                  onClick={() => setCurrentFactIndex((prev) => (prev + 1) % funFacts.length)}
                  className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                >
                  <RefreshCw className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {currentFact.fact}
            </p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${currentFact.bg} ${currentFact.color}`}>
                <Sparkles className="h-3 w-3 mr-1" />
                {currentFact.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center space-x-2">
        {funFacts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentFactIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentFactIndex ? 'bg-golf-lightgreen' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Category Quick Access */}
      {showCategories && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h4 className="font-semibold text-gray-100 mb-4">Fun Fact Categories</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map(category => {
              const categoryFacts = funFacts.filter(f => f.category === category)
              const firstFact = categoryFacts[0]
              return (
                <button
                  key={category}
                  onClick={() => {
                    const factIndex = funFacts.findIndex(f => f.category === category)
                    setCurrentFactIndex(factIndex)
                  }}
                  className={`p-3 rounded-lg border text-left transition-colors hover:shadow-sm ${
                    currentFact.category === category 
                      ? `${firstFact.bg} ${firstFact.border}` 
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <firstFact.icon className={`h-4 w-4 ${
                      currentFact.category === category ? firstFact.color : 'text-gray-400'
                    }`} />
                    <span className="text-sm font-medium text-gray-100">{category}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {categoryFacts.length} fact{categoryFacts.length !== 1 ? 's' : ''}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-750 p-6 rounded-lg border border-gray-700">
        <h4 className="font-semibold text-gray-100 mb-4">Tournament by the Numbers</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {data.tournament_summary.total_rounds}
            </div>
            <div className="text-sm text-gray-400">Total Rounds</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {players.reduce((sum, player) => {
                return sum + (data.player_statistics[player]?.detailed_performance.pars || 0)
              }, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Pars</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {data.head_to_head.match_play_leaderboard.reduce((sum, player) => sum + player.points, 0).toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Match Play Points</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">
              {Math.max(...data.tournament_summary.leaderboard.map(p => p.total_score)) - 
               Math.min(...data.tournament_summary.leaderboard.map(p => p.total_score))}
            </div>
            <div className="text-sm text-gray-400">Score Spread</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FunFacts