"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Target,
  Brain,
  RefreshCcw,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

type QuickPracticeMode = "random" | "weak_topics" | "review" | "topic"

const modeConfig: Record<QuickPracticeMode, { icon: LucideIcon; label: string; description: string; color: string }> = {
  random: {
    icon: Play,
    label: "Quick Practice",
    description: "5 random questions across all topics",
    color: "#3b82f6",
  },
  weak_topics: {
    icon: Brain,
    label: "Strengthen Weak Areas",
    description: "Focus on topics you need to improve",
    color: "#f59e0b",
  },
  review: {
    icon: RefreshCcw,
    label: "Review Mistakes",
    description: "Practice questions you got wrong",
    color: "#ef4444",
  },
  topic: {
    icon: Target,
    label: "Topic Practice",
    description: "Practice a specific topic",
    color: "#10b981",
  },
}

export interface QuickPracticeCardProps {
  mode: QuickPracticeMode
  href: string
  disabled?: boolean
  count?: number // Number of questions or items to practice
  className?: string
}

export function QuickPracticeCard({
  mode,
  href,
  disabled,
  count,
  className,
}: QuickPracticeCardProps) {
  const config = modeConfig[mode]
  const Icon = config.icon

  const content = (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:shadow-lg hover:-translate-y-1 cursor-pointer",
        className
      )}
    >
      {/* Color accent */}
      <div
        className="absolute top-0 left-0 bottom-0 w-1"
        style={{ backgroundColor: config.color }}
      />

      <CardContent className="p-4 pl-5">
        <div className="flex items-center gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <Icon className="h-5 w-5" style={{ color: config.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{config.label}</h4>
              {count !== undefined && count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {count} available
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {config.description}
            </p>
          </div>

          <Play className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </CardContent>
    </Card>
  )

  if (disabled) {
    return content
  }

  return <Link href={href}>{content}</Link>
}

interface QuickPracticeGridProps {
  topicId?: string // If provided, shows topic-specific quick practice
  weakTopicsCount?: number
  reviewCount?: number
  className?: string
}

export function QuickPracticeGrid({
  topicId,
  weakTopicsCount = 0,
  reviewCount = 0,
  className,
}: QuickPracticeGridProps) {
  const baseHref = "/dashboard/practice/quiz/start"

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      <QuickPracticeCard
        mode="random"
        href={topicId ? `${baseHref}?mode=quick&topic=${topicId}` : `${baseHref}?mode=quick`}
      />
      <QuickPracticeCard
        mode="weak_topics"
        href={`${baseHref}?mode=weak`}
        disabled={weakTopicsCount === 0}
        count={weakTopicsCount}
      />
      <QuickPracticeCard
        mode="review"
        href={`${baseHref}?mode=review`}
        disabled={reviewCount === 0}
        count={reviewCount}
      />
      {topicId && (
        <QuickPracticeCard
          mode="topic"
          href={`${baseHref}?mode=topic&topic=${topicId}`}
        />
      )}
    </div>
  )
}
