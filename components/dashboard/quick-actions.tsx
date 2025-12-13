"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  PlayCircle,
  Target,
  BookOpen,
  RotateCcw,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickAction {
  title: string
  description: string
  href: string
  icon: React.ElementType
  color: string
  bgColor: string
}

const defaultActions: QuickAction[] = [
  {
    title: "Continue Learning",
    description: "Pick up where you left off",
    href: "/dashboard/learn",
    icon: PlayCircle,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "Daily Challenge",
    description: "Complete today's challenge",
    href: "/dashboard/practice/daily",
    icon: Target,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    title: "Quick Practice",
    description: "Sharpen your skills",
    href: "/dashboard/practice",
    icon: BookOpen,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    title: "Review Topics",
    description: "Revisit past learning",
    href: "/dashboard/progress",
    icon: RotateCcw,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
]

interface QuickActionsProps {
  actions?: QuickAction[]
  className?: string
}

export function QuickActions({
  actions = defaultActions,
  className,
}: QuickActionsProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Card key={action.href} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <Link href={action.href} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      action.bgColor
                    )}
                  >
                    <Icon className={cn("h-5 w-5", action.color)} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </div>
                <div>
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

interface ContinueLearningCardProps {
  topicName?: string
  subjectName?: string
  progress?: number
  href?: string
  className?: string
}

export function ContinueLearningCard({
  topicName = "No active topic",
  subjectName,
  progress = 0,
  href = "/dashboard/learn",
  className,
}: ContinueLearningCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Continue Learning</p>
              <h3 className="font-semibold">{topicName}</h3>
              {subjectName && (
                <p className="text-xs text-muted-foreground">{subjectName}</p>
              )}
            </div>
            <Button asChild>
              <Link href={href}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Resume
              </Link>
            </Button>
          </div>
          {progress > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
