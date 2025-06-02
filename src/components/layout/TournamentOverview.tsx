import React from 'react'
import Card from '../ui/Card'
import StatCard from '../ui/StatCard'
import Leaderboard from '../charts/Leaderboard'
import { data } from '../../utils/data'
import { Trophy, Users, MapPin, Calendar } from 'lucide-react'

const TournamentOverview: React.FC = () => {
  // Load real tournament data
  const leaderboardData = data.tournament_summary.leaderboard.map((entry, index) => ({
    position: index + 1,
    player: entry.player,
    score: entry.total_score,
    average: entry.scoring_average,
    badge: index === 0 ? 'winner' as const : index === 1 ? 'runner-up' as const : index === 2 ? 'third' as const : undefined
  }))

  const tournamentInsights = data.tournament_insights

  return (
    <div className="space-y-8">
      {/* Tournament Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tournament Winner"
          value={data.tournament_summary.winner}
          subtitle={`${data.tournament_summary.winning_score} total strokes`}
          icon={Trophy}
        />
        <StatCard
          title="Total Players"
          value="8"
          subtitle="2 teams of 4"
          icon={Users}
        />
        <StatCard
          title="Courses Played"
          value={data.tournament_summary.courses_played.toString()}
          subtitle="Multiple formats"
          icon={MapPin}
        />
        <StatCard
          title="Total Rounds"
          value={data.tournament_summary.total_rounds.toString()}
          subtitle="Myrtle Beach 2024"
          icon={Calendar}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Final Leaderboard */}
        <Card>
          <Leaderboard 
            data={leaderboardData}
            title="Final Tournament Standings"
          />
        </Card>

        {/* Tournament Highlights */}
        <Card title="Tournament Highlights">
          <div className="space-y-4">
            <div className="p-4 bg-green-900 rounded-lg border border-green-600">
              <h4 className="font-semibold text-green-400">🏆 Tournament Champion</h4>
              <p className="text-sm text-green-300 mt-1">
                {data.tournament_summary.winner} won with {data.tournament_summary.winning_score} total strokes
              </p>
            </div>
            
            <div className="p-4 bg-blue-900 rounded-lg border border-blue-600">
              <h4 className="font-semibold text-blue-400">🎯 Lowest Single Round</h4>
              <p className="text-sm text-blue-300 mt-1">
                {tournamentInsights.lowest_single_round.player} shot {tournamentInsights.lowest_single_round.score} at {tournamentInsights.lowest_single_round.course}
              </p>
            </div>
            
            <div className="p-4 bg-purple-900 rounded-lg border border-purple-600">
              <h4 className="font-semibold text-purple-400">⚔️ Match Play Champion</h4>
              <p className="text-sm text-purple-300 mt-1">
                {tournamentInsights.match_play_dominator.player} dominated with {tournamentInsights.match_play_dominator.points} points
              </p>
            </div>
            
            <div className="p-4 bg-orange-900 rounded-lg border border-orange-600">
              <h4 className="font-semibold text-orange-400">🎳 Most Consistent Player</h4>
              <p className="text-sm text-orange-300 mt-1">
                {tournamentInsights.most_consistent_player.player} with σ={tournamentInsights.most_consistent_player.standard_deviation.toFixed(1)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tournament Format Summary */}
      <Card title="Tournament Format Breakdown">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-golf-green bg-opacity-10 rounded-lg">
            <h4 className="font-semibold text-golf-green">Day 1</h4>
            <p className="text-sm text-gray-300 mt-1">Scramble</p>
            <p className="text-xs text-gray-400">Myrtle Beach National</p>
          </div>
          
          <div className="text-center p-4 bg-blue-500 bg-opacity-10 rounded-lg">
            <h4 className="font-semibold text-blue-400">Day 2</h4>
            <p className="text-sm text-gray-300 mt-1">Match Play</p>
            <p className="text-xs text-gray-400">Barefoot Dye</p>
          </div>
          
          <div className="text-center p-4 bg-purple-500 bg-opacity-10 rounded-lg">
            <h4 className="font-semibold text-purple-400">Day 3</h4>
            <p className="text-sm text-gray-300 mt-1">Best Ball</p>
            <p className="text-xs text-gray-400">Aberdeen Country Club</p>
          </div>
          
          <div className="text-center p-4 bg-orange-500 bg-opacity-10 rounded-lg">
            <h4 className="font-semibold text-orange-400">Day 4</h4>
            <p className="text-sm text-gray-300 mt-1">Stableford</p>
            <p className="text-xs text-gray-400">Arcadian Shores</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default TournamentOverview