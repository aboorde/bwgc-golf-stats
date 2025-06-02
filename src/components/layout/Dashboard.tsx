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
import Card from '../ui/Card'

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Tournament Header */}
      <div className="text-center space-y-3 px-4">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-100">
          Myrtle Beach Tournament 2023
        </h1>
        <p className="text-sm md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          <span className="hidden sm:inline">Comprehensive analytics from our 4-day golf adventure featuring 8 players, 
          3 challenging courses, and multiple tournament formats.</span>
          <span className="sm:hidden">4-day tournament analytics • 8 players • 3 courses</span>
        </p>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-5 md:grid-cols-5 min-w-max md:min-w-0">
            <TabsTrigger value="overview" className="text-xs md:text-sm px-2 md:px-4">Overview</TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-xs md:text-sm px-2 md:px-4">Leaderboard</TabsTrigger>
            <TabsTrigger value="players" className="text-xs md:text-sm px-2 md:px-4">Players</TabsTrigger>
            <TabsTrigger value="courses" className="text-xs md:text-sm px-2 md:px-4">Courses</TabsTrigger>
            <TabsTrigger value="matchplay" className="text-xs md:text-sm px-2 md:px-4">Match Play</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6 md:mt-8">
          <div className="space-y-6 md:space-y-8">
            <TournamentOverview />
            <Card title="Team Performance Comparison" subtitle="Banana Boys vs 3 Lefties make a Righty">
              <TeamComparisonChart />
            </Card>
            <FunFacts />
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6 md:mt-8">
          <div className="space-y-6 md:space-y-8">
            <SortableLeaderboard />
            <PlayerProfileCards columns={1} />
          </div>
        </TabsContent>

        <TabsContent value="players" className="mt-6 md:mt-8">
          <div className="space-y-6 md:space-y-8">
            <PlayerStats />
            <Card title="Player Scoring Progression" subtitle="Performance across all 4 tournament days">
              <PlayerProgressionChart />
            </Card>
            <Card title="Score Distribution Analysis" subtitle="Individual player scoring patterns">
              <ScoreDistributionChart />
            </Card>
            <PlayerProfileCards columns={1} showDetailedStats={true} />
          </div>
        </TabsContent>

        <TabsContent value="courses" className="mt-6 md:mt-8">
          <div className="space-y-6 md:space-y-8">
            <CourseAnalysis />
            <Card title="Course Difficulty Analysis" subtitle="Comprehensive comparison across all courses">
              <CourseDifficultyChart />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matchplay" className="mt-6 md:mt-8">
          <div className="space-y-6 md:space-y-8">
            <MatchPlayResults />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Dashboard