"use client"

import { cn } from "@/lib/utils"
import { Flame, Snowflake, Shield } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type StreakStatus = "active" | "frozen" | "at_risk" | "broken"

interface StreakDisplayProps {
  currentStreak: number
  status?: StreakStatus
  showLabel?: boolean
  showTooltip?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  freezesRemaining?: number
  shieldsRemaining?: number
}

export function StreakDisplay({
  currentStreak,
  status = "active",
  showLabel = false,
  showTooltip = true,
  size = "md",
  className,
  freezesRemaining = 0,
  shieldsRemaining = 0,
}: StreakDisplayProps) {
  const sizeClasses = {
    sm: {
      container: "gap-1",
      icon: "h-4 w-4",
      text: "text-sm",
    },
    md: {
      container: "gap-1.5",
      icon: "h-5 w-5",
      text: "text-base",
    },
    lg: {
      container: "gap-2",
      icon: "h-6 w-6",
      text: "text-lg",
    },
  }

  const statusConfig = {
    active: {
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      label: "Active streak",
      animate: currentStreak >= 7,
    },
    frozen: {
      icon: Snowflake,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      label: "Streak frozen",
      animate: false,
    },
    at_risk: {
      icon: Flame,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      label: "Streak at risk!",
      animate: true,
    },
    broken: {
      icon: Flame,
      color: "text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-900/30",
      label: "Streak broken",
      animate: false,
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon
  const sizes = sizeClasses[size]

  const display = (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 font-medium",
        sizes.container,
        config.bgColor,
        config.color,
        config.animate && "animate-pulse",
        className
      )}
    >
      <Icon className={sizes.icon} />
      <span className={sizes.text}>{currentStreak}</span>
      {showLabel && <span className="text-xs ml-1">day{currentStreak !== 1 ? "s" : ""}</span>}
    </div>
  )

  if (!showTooltip) {
    return display
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{display}</TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2">
            <p className="font-semibold">{config.label}</p>
            <p className="text-sm">
              {currentStreak} day{currentStreak !== 1 ? "s" : ""} in a row!
            </p>
            {(freezesRemaining > 0 || shieldsRemaining > 0) && (
              <div className="flex items-center gap-3 pt-1 border-t">
                {freezesRemaining > 0 && (
                  <div className="flex items-center gap-1 text-xs text-blue-500">
                    <Snowflake className="h-3 w-3" />
                    <span>{freezesRemaining} freeze{freezesRemaining !== 1 ? "s" : ""}</span>
                  </div>
                )}
                {shieldsRemaining > 0 && (
                  <div className="flex items-center gap-1 text-xs text-purple-500">
                    <Shield className="h-3 w-3" />
                    <span>{shieldsRemaining} shield{shieldsRemaining !== 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface DailyGoalProgressProps {
  current: number
  target: number
  goalType: "QUESTIONS" | "MINUTES" | "SCORE"
  isComplete?: boolean
  className?: string
}

export function DailyGoalProgress({
  current,
  target,
  goalType,
  isComplete = false,
  className,
}: DailyGoalProgressProps) {
  const percentage = Math.min((current / target) * 100, 100)

  const goalLabels = {
    QUESTIONS: "questions",
    MINUTES: "minutes",
    SCORE: "points",
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Daily Goal</span>
        <span className={cn("font-medium", isComplete && "text-green-600 dark:text-green-400")}>
          {current} / {target} {goalLabels[goalType]}
        </span>
      </div>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
            isComplete
              ? "bg-green-500"
              : percentage >= 75
                ? "bg-yellow-500"
                : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isComplete && (
        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
          Goal complete! Great job!
        </p>
      )}
    </div>
  )
}
