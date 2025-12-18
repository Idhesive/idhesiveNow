"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  Target,
  Clock,
  Flame,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface PracticeStatsCardProps {
  totalQuestionsAnswered: number
  totalCorrect: number
  totalTimeSpentSeconds: number
  currentStreak: number
  weeklyQuestionsAnswered?: number
  weeklyAccuracy?: number
  className?: string
}

export function PracticeStatsCard({
  totalQuestionsAnswered,
  totalCorrect,
  totalTimeSpentSeconds,
  currentStreak,
  weeklyQuestionsAnswered = 0,
  weeklyAccuracy = 0,
  className,
}: PracticeStatsCardProps) {
  const overallAccuracy = totalQuestionsAnswered > 0
    ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
    : 0

  const hours = Math.floor(totalTimeSpentSeconds / 3600)
  const minutes = Math.floor((totalTimeSpentSeconds % 3600) / 60)

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Practice Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Questions */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <CheckCircle className="h-4 w-4" />
              Questions Answered
            </div>
            <p className="text-2xl font-bold">{totalQuestionsAnswered.toLocaleString()}</p>
            {weeklyQuestionsAnswered > 0 && (
              <p className="text-xs text-muted-foreground">
                +{weeklyQuestionsAnswered} this week
              </p>
            )}
          </div>

          {/* Accuracy */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Target className="h-4 w-4" />
              Accuracy
            </div>
            <p className={cn(
              "text-2xl font-bold",
              overallAccuracy >= 80 ? "text-green-600" :
              overallAccuracy >= 60 ? "text-yellow-600" :
              "text-red-600"
            )}>
              {overallAccuracy}%
            </p>
            {weeklyAccuracy > 0 && (
              <p className="text-xs text-muted-foreground">
                {weeklyAccuracy}% this week
              </p>
            )}
          </div>

          {/* Time Spent */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" />
              Time Practicing
            </div>
            <p className="text-2xl font-bold">
              {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
            </p>
            <p className="text-xs text-muted-foreground">
              Total time spent
            </p>
          </div>

          {/* Streak */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Flame className="h-4 w-4 text-orange-500" />
              Current Streak
            </div>
            <p className="text-2xl font-bold text-orange-500">
              {currentStreak} days
            </p>
            <p className="text-xs text-muted-foreground">
              Keep it going!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export interface TopicPracticeStatsProps {
  masteryLevel: number
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  className?: string
}

export function TopicPracticeStats({
  masteryLevel,
  totalQuestions,
  answeredQuestions,
  correctAnswers,
  className,
}: TopicPracticeStatsProps) {
  const accuracy = answeredQuestions > 0
    ? Math.round((correctAnswers / answeredQuestions) * 100)
    : 0
  const masteryPercent = Math.round(masteryLevel * 100)

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="grid gap-4 sm:grid-cols-4">
          {/* Mastery */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Mastery</span>
              <span className="font-medium">{masteryPercent}%</span>
            </div>
            <Progress value={masteryPercent} className="h-2" />
          </div>

          {/* Questions Answered */}
          <div className="text-center">
            <p className="text-xl font-bold">{answeredQuestions}</p>
            <p className="text-xs text-muted-foreground">
              of {totalQuestions} questions
            </p>
          </div>

          {/* Correct */}
          <div className="text-center">
            <p className="text-xl font-bold text-green-600">{correctAnswers}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>

          {/* Accuracy */}
          <div className="text-center">
            <p className={cn(
              "text-xl font-bold",
              accuracy >= 80 ? "text-green-600" :
              accuracy >= 60 ? "text-yellow-600" :
              "text-red-600"
            )}>
              {accuracy}%
            </p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
