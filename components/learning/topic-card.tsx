"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Circle,
  Clock,
  Lock,
  PlayCircle,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type TopicStatus = "locked" | "available" | "in_progress" | "completed"

export interface TopicCardProps {
  id: string
  subjectId: string
  name: string
  description?: string | null
  status: TopicStatus
  progress?: number
  estimatedMinutes?: number
  questionsCount?: number
  masteryLevel?: number
  className?: string
}

const statusConfig: Record<
  TopicStatus,
  { icon: typeof Circle; label: string; color: string }
> = {
  locked: {
    icon: Lock,
    label: "Locked",
    color: "text-muted-foreground",
  },
  available: {
    icon: Circle,
    label: "Available",
    color: "text-blue-500",
  },
  in_progress: {
    icon: PlayCircle,
    label: "In Progress",
    color: "text-orange-500",
  },
  completed: {
    icon: CheckCircle,
    label: "Completed",
    color: "text-green-500",
  },
}

export function TopicCard({
  id,
  subjectId,
  name,
  description,
  status,
  progress = 0,
  estimatedMinutes,
  questionsCount,
  masteryLevel,
  className,
}: TopicCardProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon
  const isLocked = status === "locked"

  const content = (
    <Card
      className={cn(
        "group relative transition-all",
        isLocked
          ? "opacity-60 cursor-not-allowed"
          : "hover:shadow-md hover:border-primary/50",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Status icon */}
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              status === "completed" && "bg-green-100 dark:bg-green-900/30",
              status === "in_progress" && "bg-orange-100 dark:bg-orange-900/30",
              status === "available" && "bg-blue-100 dark:bg-blue-900/30",
              status === "locked" && "bg-muted"
            )}
          >
            <StatusIcon className={cn("h-4 w-4", config.color)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium truncate">{name}</h4>
              {!isLocked && (
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>

            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {description}
              </p>
            )}

            {/* Meta info */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {estimatedMinutes && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {estimatedMinutes} min
                </span>
              )}
              {questionsCount !== undefined && (
                <span className="text-xs text-muted-foreground">
                  {questionsCount} questions
                </span>
              )}
              {masteryLevel !== undefined && masteryLevel > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {Math.round(masteryLevel * 100)}% mastery
                </Badge>
              )}
            </div>

            {/* Progress bar for in-progress topics */}
            {status === "in_progress" && progress > 0 && (
              <div className="mt-2">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isLocked) {
    return content
  }

  return <Link href={`/dashboard/learn/${subjectId}/${id}`}>{content}</Link>
}

interface TopicListProps {
  topics: TopicCardProps[]
  className?: string
}

export function TopicList({ topics, className }: TopicListProps) {
  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">No topics available</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {topics.map((topic) => (
        <TopicCard key={topic.id} {...topic} />
      ))}
    </div>
  )
}
