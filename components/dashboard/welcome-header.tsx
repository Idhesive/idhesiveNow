"use client"

import { TierBadge, type AcademicTier } from "@/components/gamification/tier-badge"
import { StreakDisplay } from "@/components/gamification/streak-display"

interface WelcomeHeaderProps {
  userName: string
  tier?: AcademicTier
  currentStreak?: number
  streakStatus?: "active" | "frozen" | "at_risk" | "broken"
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function WelcomeHeader({
  userName,
  tier = "SEED",
  currentStreak = 0,
  streakStatus = "active",
}: WelcomeHeaderProps) {
  const greeting = getGreeting()
  const firstName = userName.split(" ")[0]


  
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {greeting}, {firstName}!
        </h1>
        <p className="text-muted-foreground">
          Ready to continue your learning journey?
        </p>
      </div>
      <div className="flex items-center gap-3">
        <TierBadge tier={tier} showLabel size="md" />
        {currentStreak > 0 && (
          <StreakDisplay
            currentStreak={currentStreak}
            status={streakStatus}
            showLabel
            size="md"
          />
        )}
      </div>
    </div>
  )
}
