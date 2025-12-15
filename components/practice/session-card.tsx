"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Clock,
  Target,
  XCircle,
  Pause,
  Play,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { SessionStatus, AssessmentType } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"

const statusConfig: Record<SessionStatus, { icon: LucideIcon; label: string; color: string }> = {
  NOT_STARTED: { icon: Play, label: "Not Started", color: "text-gray-500" },
  IN_PROGRESS: { icon: Clock, label: "In Progress", color: "text-blue-500" },
  PAUSED: { icon: Pause, label: "Paused", color: "text-orange-500" },
  COMPLETED: { icon: CheckCircle, label: "Completed", color: "text-green-500" },
  ABANDONED: { icon: XCircle, label: "Abandoned", color: "text-gray-400" },
  TIMED_OUT: { icon: Clock, label: "Timed Out", color: "text-red-500" },
}

const assessmentTypeLabels: Record<AssessmentType, string> = {
  FIXED_ASSESSMENT: "Assessment",
  PRACTICE_SET: "Practice",
  QUIZ: "Quiz",
  ADAPTIVE_ASSESSMENT: "Adaptive",
  DIAGNOSTIC: "Diagnostic",
  PLACEMENT: "Placement",
  PUZZLE_STREAK: "Streak",
  PUZZLE_STORM: "Storm",
  PUZZLE_RACER: "Racer",
  ENDLESS_PRACTICE: "Endless",
  REVIEW_SESSION: "Review",
  FLASHCARD_DRILL: "Flashcards",
  DUEL: "Duel",
  TOURNAMENT: "Tournament",
  DAILY_CHALLENGE: "Daily",
  GUIDED_LESSON: "Lesson",
  MASTERY_CHECK: "Mastery",
  CUSTOM: "Custom",
}

export interface SessionCardProps {
  id: string
  assessmentType: AssessmentType
  status: SessionStatus
  topicNames?: string[]
  questionsAttempted: number
  questionsCorrect: number
  totalScore: number
  maxPossibleScore: number
  startedAt: Date
  className?: string
}

export function SessionCard({
  id,
  assessmentType,
  status,
  topicNames,
  questionsAttempted,
  questionsCorrect,
  startedAt,
  className,
}: SessionCardProps) {
  const statusInfo = statusConfig[status]
  const StatusIcon = statusInfo.icon
  const typeLabel = assessmentTypeLabels[assessmentType]
  const accuracy = questionsAttempted > 0
    ? Math.round((questionsCorrect / questionsAttempted) * 100)
    : 0

  const isResumable = status === "IN_PROGRESS" || status === "PAUSED"
  const href = isResumable
    ? `/dashboard/practice/quiz/${id}`
    : `/dashboard/practice/quiz/results/${id}`

  return (
    <Link href={href}>
      <Card
        className={cn(
          "group transition-all hover:shadow-md cursor-pointer",
          className
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Left side - main info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {typeLabel}
                </Badge>
                <div className={cn("flex items-center gap-1 text-xs", statusInfo.color)}>
                  <StatusIcon className="h-3 w-3" />
                  <span>{statusInfo.label}</span>
                </div>
              </div>

              {topicNames && topicNames.length > 0 && (
                <p className="text-sm font-medium truncate">
                  {topicNames.join(", ")}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(startedAt), { addSuffix: true })}
              </p>
            </div>

            {/* Right side - stats */}
            <div className="flex items-center gap-4 text-right shrink-0">
              <div>
                <p className="text-lg font-bold">{questionsCorrect}/{questionsAttempted}</p>
                <p className="text-xs text-muted-foreground">Questions</p>
              </div>
              <div>
                <p className={cn(
                  "text-lg font-bold",
                  accuracy >= 80 ? "text-green-600" :
                  accuracy >= 60 ? "text-yellow-600" :
                  "text-red-600"
                )}>
                  {accuracy}%
                </p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

interface SessionListProps {
  sessions: SessionCardProps[]
  className?: string
  emptyMessage?: string
}

export function SessionList({
  sessions,
  className,
  emptyMessage = "No sessions found",
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Target className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">{emptyMessage}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Start practicing to see your sessions here.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {sessions.map((session) => (
        <SessionCard key={session.id} {...session} />
      ))}
    </div>
  )
}
