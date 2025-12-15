"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Clock,
  Trophy,
  CheckCircle,
  Play,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface DailyChallengeCardProps {
  challengeId?: string
  topicName?: string
  difficultyLevel?: string
  questionCount?: number
  timeRemaining?: string // "12:34:56" or null
  hasCompleted?: boolean
  userScore?: number
  userRank?: number | null
  totalParticipants?: number
  className?: string
}

export function DailyChallengeCard({
  challengeId,
  topicName,
  difficultyLevel,
  questionCount,
  timeRemaining,
  hasCompleted,
  userScore,
  userRank,
  totalParticipants,
  className,
}: DailyChallengeCardProps) {
  const noChallengeAvailable = !challengeId

  if (noChallengeAvailable) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10" />

        <CardHeader className="relative pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-500" />
            <CardTitle className="text-lg">Daily Challenge</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="font-semibold">No Challenge Today</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Check back tomorrow for a new challenge!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10" />

      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-500" />
            <CardTitle className="text-lg">Daily Challenge</CardTitle>
          </div>
          {timeRemaining && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {timeRemaining}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Challenge info */}
        <div className="space-y-2">
          {topicName && (
            <p className="font-medium">{topicName}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {difficultyLevel && (
              <Badge variant="secondary" className="text-xs">
                {difficultyLevel}
              </Badge>
            )}
            {questionCount && (
              <Badge variant="outline" className="text-xs">
                {questionCount} questions
              </Badge>
            )}
          </div>
        </div>

        {/* Completion status or start button */}
        {hasCompleted ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Completed!</span>
            </div>

            {userScore !== undefined && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{userScore}</p>
                  <p className="text-xs text-muted-foreground">Your Score</p>
                </div>
                {userRank && (
                  <div className="text-center">
                    <p className="text-2xl font-bold">#{userRank}</p>
                    <p className="text-xs text-muted-foreground">
                      of {totalParticipants || "?"}
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/practice/daily">
                <Trophy className="h-4 w-4 mr-2" />
                View Leaderboard
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Leaderboard preview */}
            {totalParticipants !== undefined && totalParticipants > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{totalParticipants} participants today</span>
              </div>
            )}

            <Button className="w-full" asChild>
              <Link href={`/dashboard/practice/daily?challenge=${challengeId}`}>
                <Play className="h-4 w-4 mr-2" />
                Start Challenge
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
