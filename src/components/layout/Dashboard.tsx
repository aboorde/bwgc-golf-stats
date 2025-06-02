import React, { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'
import TournamentOverview from './TournamentOverview'
import PlayerStats from './PlayerStats'
import CourseAnalysis from './CourseAnalysis'
import MatchPlayResults from './MatchPlayResults'
import PlayerProgressionChart from '../charts/PlayerProgressionChart'
import ScoreDistributionChart from '../charts/ScoreDistributionChart'
import MatchPlayMatrix from '../charts/MatchPlayMatrix'
import CourseDifficultyChart from '../charts/CourseDifficultyChart'
import TeamComparisonChart from '../charts/TeamComparisonChart'
import SortableLeaderboard from '../charts/SortableLeaderboard'
import PlayerProfileCards from '../charts/PlayerProfileCards'
import FunFacts from '../charts/FunFacts'
import CoursePerformanceChart from '../charts/CoursePerformanceChart'
import Card from '../ui/Card'

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Tournament Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-100">
          Myrtle Beach Tournament 2024
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Comprehensive analytics from our 4-day golf adventure featuring 8 players, 
          3 challenging courses, and multiple tournament formats.
        </p>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="matchplay">Match Play</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-8">
          <div className="space-y-8">
            <TournamentOverview />
            <Card title="Team Performance Comparison" subtitle="Banana Boys vs 3 Lefties make a Righty">
              <TeamComparisonChart />
            </Card>
            <FunFacts />
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-8">
          <div className="space-y-8">
            <SortableLeaderboard />
            <PlayerProfileCards columns={2} />
          </div>
        </TabsContent>

        <TabsContent value="players" className="mt-8">
          <div className="space-y-8">
            <PlayerStats />
            <Card title="Player Scoring Progression" subtitle="Performance across all 4 tournament days">
              <PlayerProgressionChart />
            </Card>
            <Card title="Score Distribution Analysis" subtitle="Individual player scoring patterns">
              <ScoreDistributionChart />
            </Card>
            <PlayerProfileCards columns={3} showDetailedStats={true} />
          </div>
        </TabsContent>

        <TabsContent value="courses" className="mt-8">
          <div className="space-y-8">
            <CourseAnalysis />
            <Card title="Course Difficulty Analysis" subtitle="Comprehensive comparison across all courses">
              <CourseDifficultyChart />
            </Card>
            <CoursePerformanceChart />
          </div>
        </TabsContent>

        <TabsContent value="matchplay" className="mt-8">
          <div className="space-y-8">
            <MatchPlayResults />
            <Card title="Head-to-Head Match Play Matrix" subtitle="Complete player vs player results">
              <MatchPlayMatrix />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Dashboard