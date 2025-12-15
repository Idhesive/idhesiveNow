"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Breadcrumb } from "@/components/navigation/breadcrumb"
import {
  PracticeModeGrid,
  DailyChallengeCard,
  SessionList,
  QuickPracticeGrid,
  PracticeStatsCard,
} from "@/components/practice"
import type { PracticeModeCardProps } from "@/components/practice"
import type { SessionCardProps } from "@/components/practice"
import { Zap, History, Brain, Target } from "lucide-react"

interface PracticeDashboardData {
  stats: {
    totalQuestionsAnswered: number
    totalCorrect: number
    totalTimeSpentSeconds: number
    currentStreak: number
  }
  streak: {
    currentStreak: number
    todayProgress: number
    dailyGoalTarget: number
    todayGoalMet: boolean
  } | null
  templates: PracticeModeCardProps[]
  recentSessions: SessionCardProps[]
  dailyChallenge: {
    id: string
    questionCount: number
    totalParticipants: number
    hasCompleted: boolean
    userScore?: number
    userRank?: number | null
  } | null
  recommendations: {
    weakTopicsCount: number
    reviewCount: number
    weakTopics: {
      topicId: string
      topicName: string
      masteryLevel: number
      questionCount: number
    }[]
  }
}

interface PracticeDashboardContentProps {
  data: PracticeDashboardData
}

export function PracticeDashboardContent({ data }: PracticeDashboardContentProps) {
  const [activeTab, setActiveTab] = useState("quick")

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[{ label: "Practice", href: "/dashboard/practice" }]}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Practice</h1>
        <p className="text-muted-foreground">
          Strengthen your skills with various practice modes and challenges.
        </p>
      </div>

      {/* Stats Card */}
      <PracticeStatsCard
        totalQuestionsAnswered={data.stats.totalQuestionsAnswered}
        totalCorrect={data.stats.totalCorrect}
        totalTimeSpentSeconds={data.stats.totalTimeSpentSeconds}
        currentStreak={data.stats.currentStreak}
      />

      {/* Daily Challenge & Quick Actions Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Daily Challenge */}
        <DailyChallengeCard
          challengeId={data.dailyChallenge?.id}
          questionCount={data.dailyChallenge?.questionCount}
          hasCompleted={data.dailyChallenge?.hasCompleted}
          userScore={data.dailyChallenge?.userScore}
          userRank={data.dailyChallenge?.userRank}
          totalParticipants={data.dailyChallenge?.totalParticipants}
        />

        {/* Recommendations */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Recommended for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recommendations.weakTopics.length > 0 ? (
              <div className="space-y-3">
                {data.recommendations.weakTopics.slice(0, 3).map((topic) => (
                  <RecommendedTopicCard
                    key={topic.topicId}
                    topicId={topic.topicId}
                    topicName={topic.topicName}
                    masteryLevel={topic.masteryLevel}
                    questionCount={topic.questionCount}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Target className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Great work! No weak areas detected. Keep practicing to maintain your skills.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="quick" className="gap-2">
            <Zap className="h-4 w-4" />
            Quick Start
          </TabsTrigger>
          <TabsTrigger value="modes" className="gap-2">
            <Target className="h-4 w-4" />
            Practice Modes
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-4">
          <QuickPracticeGrid
            weakTopicsCount={data.recommendations.weakTopicsCount}
            reviewCount={data.recommendations.reviewCount}
          />
        </TabsContent>

        <TabsContent value="modes" className="space-y-4">
          <PracticeModeGrid modes={data.templates} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <SessionList
            sessions={data.recentSessions}
            emptyMessage="No practice sessions yet"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface RecommendedTopicCardProps {
  topicId: string
  topicName: string
  masteryLevel: number
  questionCount: number
}

function RecommendedTopicCard({
  topicId,
  topicName,
  masteryLevel,
  questionCount,
}: RecommendedTopicCardProps) {
  const masteryPercent = Math.round(masteryLevel * 100)

  return (
    <a
      href={`/dashboard/practice/quiz/start?mode=topic&topic=${topicId}`}
      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{topicName}</p>
        <p className="text-xs text-muted-foreground">
          {masteryPercent}% mastery • {questionCount} questions
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-orange-600 font-medium">Needs practice</span>
        <Zap className="h-4 w-4 text-orange-500" />
      </div>
    </a>
  )
}
