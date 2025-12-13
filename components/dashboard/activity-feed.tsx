"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Trophy,
  Target,
  BookOpen,
  Flame,
  Sparkles,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ActivityItem {
  id: string
  type: string
  description: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  maxItems?: number
  showViewAll?: boolean
  className?: string
}

const activityIcons: Record<string, React.ElementType> = {
  QUESTION_ANSWERED: CheckCircle,
  QUESTION_CORRECT: CheckCircle,
  STREAK_DAY: Flame,
  STREAK_MILESTONE: Flame,
  BADGE_EARNED: Trophy,
  ACHIEVEMENT_COMPLETED: Trophy,
  CHALLENGE_COMPLETED: Target,
  DAILY_CHALLENGE: Target,
  MASTERY_UPGRADE: Sparkles,
  BONUS: Sparkles,
  DEFAULT: BookOpen,
}

const activityColors: Record<string, string> = {
  QUESTION_ANSWERED: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
  QUESTION_CORRECT: "text-green-500 bg-green-100 dark:bg-green-900/30",
  STREAK_DAY: "text-orange-500 bg-orange-100 dark:bg-orange-900/30",
  STREAK_MILESTONE: "text-orange-500 bg-orange-100 dark:bg-orange-900/30",
  BADGE_EARNED: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30",
  ACHIEVEMENT_COMPLETED: "text-purple-500 bg-purple-100 dark:bg-purple-900/30",
  CHALLENGE_COMPLETED: "text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30",
  DAILY_CHALLENGE: "text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30",
  MASTERY_UPGRADE: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30",
  BONUS: "text-pink-500 bg-pink-100 dark:bg-pink-900/30",
  DEFAULT: "text-gray-500 bg-gray-100 dark:bg-gray-900/30",
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}

export function ActivityFeed({
  activities,
  maxItems = 5,
  showViewAll = true,
  className,
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems)

  if (displayActivities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No activity yet. Start learning to see your progress here!
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/learn">Start Learning</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Activity</CardTitle>
        {showViewAll && activities.length > maxItems && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/progress" className="text-xs">
              View All
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity) => {
            const Icon = activityIcons[activity.type] || activityIcons.DEFAULT
            const colorClass =
              activityColors[activity.type] || activityColors.DEFAULT

            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    colorClass
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(new Date(activity.timestamp))}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
