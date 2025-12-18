"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Target,
  Clock,
  Flame,
  Brain,
  Trophy,
  Sparkles,
  BookOpen,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { AssessmentType } from "@prisma/client"

// Icon mapping for assessment types
const assessmentTypeIcons: Record<AssessmentType, LucideIcon> = {
  FIXED_ASSESSMENT: Target,
  PRACTICE_SET: BookOpen,
  QUIZ: Zap,
  ADAPTIVE_ASSESSMENT: Brain,
  DIAGNOSTIC: Target,
  PLACEMENT: Target,
  PUZZLE_STREAK: Flame,
  PUZZLE_STORM: Clock,
  PUZZLE_RACER: Trophy,
  ENDLESS_PRACTICE: Sparkles,
  REVIEW_SESSION: BookOpen,
  FLASHCARD_DRILL: Zap,
  DUEL: Trophy,
  TOURNAMENT: Trophy,
  DAILY_CHALLENGE: Sparkles,
  GUIDED_LESSON: BookOpen,
  MASTERY_CHECK: Target,
  CUSTOM: Zap,
}

const assessmentTypeLabels: Record<AssessmentType, string> = {
  FIXED_ASSESSMENT: "Assessment",
  PRACTICE_SET: "Practice Set",
  QUIZ: "Quick Quiz",
  ADAPTIVE_ASSESSMENT: "Adaptive Test",
  DIAGNOSTIC: "Diagnostic",
  PLACEMENT: "Placement Test",
  PUZZLE_STREAK: "Puzzle Streak",
  PUZZLE_STORM: "Puzzle Storm",
  PUZZLE_RACER: "Puzzle Racer",
  ENDLESS_PRACTICE: "Endless Practice",
  REVIEW_SESSION: "Review",
  FLASHCARD_DRILL: "Flashcard Drill",
  DUEL: "Duel",
  TOURNAMENT: "Tournament",
  DAILY_CHALLENGE: "Daily Challenge",
  GUIDED_LESSON: "Guided Lesson",
  MASTERY_CHECK: "Mastery Check",
  CUSTOM: "Custom",
}

const assessmentTypeColors: Record<AssessmentType, string> = {
  FIXED_ASSESSMENT: "#6366f1",
  PRACTICE_SET: "#3b82f6",
  QUIZ: "#10b981",
  ADAPTIVE_ASSESSMENT: "#8b5cf6",
  DIAGNOSTIC: "#f59e0b",
  PLACEMENT: "#f59e0b",
  PUZZLE_STREAK: "#ef4444",
  PUZZLE_STORM: "#f97316",
  PUZZLE_RACER: "#eab308",
  ENDLESS_PRACTICE: "#06b6d4",
  REVIEW_SESSION: "#3b82f6",
  FLASHCARD_DRILL: "#10b981",
  DUEL: "#dc2626",
  TOURNAMENT: "#7c3aed",
  DAILY_CHALLENGE: "#ec4899",
  GUIDED_LESSON: "#14b8a6",
  MASTERY_CHECK: "#6366f1",
  CUSTOM: "#64748b",
}

export interface PracticeModeCardProps {
  id: string
  code: string
  name: string
  description?: string | null
  assessmentType: AssessmentType
  questionLimit?: number | null
  timeLimitSeconds?: number | null
  isRanked?: boolean
  className?: string
}

export function PracticeModeCard({
  id,
  name,
  description,
  assessmentType,
  questionLimit,
  timeLimitSeconds,
  isRanked,
  className,
}: PracticeModeCardProps) {
  const Icon = assessmentTypeIcons[assessmentType] || Zap
  const typeLabel = assessmentTypeLabels[assessmentType]
  const color = assessmentTypeColors[assessmentType]

  return (
    <Link href={`/dashboard/practice/start?template=${id}`}>
      <Card
        className={cn(
          "group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer",
          className
        )}
      >
        {/* Color accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: color }}
        />

        <CardContent className="p-5 pt-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="h-6 w-6" style={{ color }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base truncate">{name}</h3>
                {isRanked && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    <Trophy className="h-3 w-3 mr-1" />
                    Ranked
                  </Badge>
                )}
              </div>
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Metadata badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {typeLabel}
            </Badge>
            {questionLimit && (
              <Badge variant="outline" className="text-xs">
                {questionLimit} questions
              </Badge>
            )}
            {timeLimitSeconds && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {Math.round(timeLimitSeconds / 60)} min
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

interface PracticeModeGridProps {
  modes: PracticeModeCardProps[]
  className?: string
}

export function PracticeModeGrid({ modes, className }: PracticeModeGridProps) {
  if (modes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Zap className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No practice modes available</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Practice modes will appear here once they are configured.
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {modes.map((mode) => (
        <PracticeModeCard key={mode.id} {...mode} />
      ))}
    </div>
  )
}
