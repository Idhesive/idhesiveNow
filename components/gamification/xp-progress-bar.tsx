"use client"

import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Sparkles } from "lucide-react"

type EngagementLevel =
  | "NEWCOMER"
  | "LEARNER"
  | "SCHOLAR"
  | "DEDICATED"
  | "DEVOTED"
  | "EXPERT"
  | "LEGENDARY"

interface LevelConfig {
  label: string
  minXp: number
  maxXp: number
  color: string
}

const levelConfigs: Record<EngagementLevel, LevelConfig> = {
  NEWCOMER: { label: "Newcomer", minXp: 0, maxXp: 500, color: "bg-slate-500" },
  LEARNER: { label: "Learner", minXp: 500, maxXp: 2000, color: "bg-blue-500" },
  SCHOLAR: { label: "Scholar", minXp: 2000, maxXp: 5000, color: "bg-green-500" },
  DEDICATED: { label: "Dedicated", minXp: 5000, maxXp: 10000, color: "bg-yellow-500" },
  DEVOTED: { label: "Devoted", minXp: 10000, maxXp: 25000, color: "bg-orange-500" },
  EXPERT: { label: "Expert", minXp: 25000, maxXp: 50000, color: "bg-red-500" },
  LEGENDARY: { label: "Legendary", minXp: 50000, maxXp: Infinity, color: "bg-purple-500" },
}

function getEngagementLevel(xp: number): EngagementLevel {
  if (xp >= 50000) return "LEGENDARY"
  if (xp >= 25000) return "EXPERT"
  if (xp >= 10000) return "DEVOTED"
  if (xp >= 5000) return "DEDICATED"
  if (xp >= 2000) return "SCHOLAR"
  if (xp >= 500) return "LEARNER"
  return "NEWCOMER"
}

function getNextLevel(level: EngagementLevel): EngagementLevel | null {
  const levels: EngagementLevel[] = [
    "NEWCOMER",
    "LEARNER",
    "SCHOLAR",
    "DEDICATED",
    "DEVOTED",
    "EXPERT",
    "LEGENDARY",
  ]
  const index = levels.indexOf(level)
  return index < levels.length - 1 ? levels[index + 1] : null
}

interface XpProgressBarProps {
  currentXp: number
  level?: EngagementLevel
  showLabel?: boolean
  showXpValues?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function XpProgressBar({
  currentXp,
  level,
  showLabel = true,
  showXpValues = true,
  size = "md",
  className,
}: XpProgressBarProps) {
  const currentLevel = level || getEngagementLevel(currentXp)
  const config = levelConfigs[currentLevel]
  const nextLevel = getNextLevel(currentLevel)
  const nextConfig = nextLevel ? levelConfigs[nextLevel] : null

  // Calculate progress within current level
  const levelProgress = currentXp - config.minXp
  const levelRange = config.maxXp - config.minXp
  const progressPercent = nextConfig
    ? Math.min((levelProgress / levelRange) * 100, 100)
    : 100

  const xpToNextLevel = nextConfig ? config.maxXp - currentXp : 0

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{config.label}</span>
          </div>
          {nextConfig && (
            <span className="text-muted-foreground">
              {xpToNextLevel.toLocaleString()} XP to {nextConfig.label}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <Progress
          value={progressPercent}
          className={cn(sizeClasses[size], "bg-muted")}
        />
        <div
          className={cn(
            "absolute inset-0 rounded-full transition-all",
            sizeClasses[size]
          )}
          style={{
            width: `${progressPercent}%`,
            background: `linear-gradient(90deg, ${config.color.replace("bg-", "var(--")}), ${nextConfig?.color.replace("bg-", "var(--") || config.color.replace("bg-", "var(--")})`,
          }}
        />
      </div>

      {showXpValues && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{currentXp.toLocaleString()} XP</span>
          {nextConfig && <span>{config.maxXp.toLocaleString()} XP</span>}
        </div>
      )}
    </div>
  )
}

export { levelConfigs, getEngagementLevel, type EngagementLevel }
