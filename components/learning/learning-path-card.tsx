"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  MapPin,
  PlayCircle,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface LearningPathItem {
  id: string
  topicId: string
  topicName: string
  sortOrder: number
  isCompleted: boolean
}

export interface LearningPathCardProps {
  id: string
  name: string
  description?: string | null
  type: "CURRICULUM" | "REMEDIAL" | "ENRICHMENT" | "CUSTOM"
  totalItems: number
  completedItems: number
  currentItem?: LearningPathItem | null
  estimatedHours?: number
  startedAt?: Date | null
  className?: string
}

const pathTypeConfig: Record<
  LearningPathCardProps["type"],
  { label: string; color: string; bgColor: string }
> = {
  CURRICULUM: {
    label: "Curriculum",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  REMEDIAL: {
    label: "Remedial",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  ENRICHMENT: {
    label: "Enrichment",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  CUSTOM: {
    label: "Custom",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
}

export function LearningPathCard({
  id,
  name,
  description,
  type,
  totalItems,
  completedItems,
  currentItem,
  estimatedHours,
  startedAt,
  className,
}: LearningPathCardProps) {
  const config = pathTypeConfig[type]
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0
  const isCompleted = completedItems >= totalItems
  const isStarted = startedAt !== null && startedAt !== undefined

  return (
    <Card className={cn("group hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="secondary"
                className={cn("text-xs", config.color, config.bgColor)}
              >
                {config.label}
              </Badge>
              {isCompleted && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
            <CardTitle className="text-base truncate">{name}</CardTitle>
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {completedItems}/{totalItems} topics
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {estimatedHours && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {estimatedHours}h
            </span>
          )}
          <span className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            {totalItems} topics
          </span>
        </div>

        {/* Current topic or action */}
        {currentItem && !isCompleted && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm truncate flex-1">
              {currentItem.topicName}
            </span>
          </div>
        )}

        {/* Action button */}
        <Button asChild className="w-full" variant={isStarted ? "default" : "outline"}>
          <Link href={`/dashboard/learn/path/${id}`}>
            {isCompleted ? (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Review Path
              </>
            ) : isStarted ? (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Continue
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4 mr-2" />
                Start Path
              </>
            )}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

interface LearningPathGridProps {
  paths: LearningPathCardProps[]
  className?: string
}

export function LearningPathGrid({ paths, className }: LearningPathGridProps) {
  if (paths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Target className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No learning paths</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Learning paths will appear here once assigned.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {paths.map((path) => (
        <LearningPathCard key={path.id} {...path} />
      ))}
    </div>
  )
}
