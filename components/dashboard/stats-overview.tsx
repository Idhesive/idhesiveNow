"use client"

import { StatCard } from "@/components/data-display/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XpProgressBar, type EngagementLevel } from "@/components/gamification/xp-progress-bar"
import { DailyGoalProgress } from "@/components/gamification/streak-display"
import {
  HelpCircle,
  CheckCircle,
  Clock,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsOverviewProps {
  questionsToday: number
  accuracyToday: number
  timeSpentToday: number
  topicsStudied: number
  className?: string
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMins = minutes % 60
  return `${hours}h ${remainingMins}m`
}

export function StatsOverview({
  questionsToday,
  accuracyToday,
  timeSpentToday,
  topicsStudied,
  className,
}: StatsOverviewProps) {
  const accuracyPercent = Math.round(accuracyToday * 100)

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      <StatCard
        label="Questions Today"
        value={questionsToday}
        icon={HelpCircle}
        description="Keep going!"
      />
      <StatCard
        label="Accuracy"
        value={`${accuracyPercent}%`}
        icon={CheckCircle}
        change={
          accuracyPercent >= 70
            ? { value: accuracyPercent - 50, type: "increase" }
            : undefined
        }
      />
      <StatCard
        label="Time Studied"
        value={formatTime(timeSpentToday)}
        icon={Clock}
      />
      <StatCard
        label="Topics Explored"
        value={topicsStudied}
        icon={BookOpen}
      />
    </div>
  )
}

interface ProgressOverviewProps {
  totalXp: number
  engagementLevel: EngagementLevel
  dailyGoalCurrent: number
  dailyGoalTarget: number
  dailyGoalType: "QUESTIONS" | "MINUTES" | "SCORE"
  dailyGoalMet: boolean
  className?: string
}

export function ProgressOverview({
  totalXp,
  engagementLevel,
  dailyGoalCurrent,
  dailyGoalTarget,
  dailyGoalType,
  dailyGoalMet,
  className,
}: ProgressOverviewProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Experience Points</CardTitle>
        </CardHeader>
        <CardContent>
          <XpProgressBar
            currentXp={totalXp}
            level={engagementLevel}
            showLabel
            showXpValues
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Daily Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyGoalProgress
            current={dailyGoalCurrent}
            target={dailyGoalTarget}
            goalType={dailyGoalType}
            isComplete={dailyGoalMet}
          />
        </CardContent>
      </Card>
    </div>
  )
}
