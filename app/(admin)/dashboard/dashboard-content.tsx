"use client"

import { WelcomeHeader } from "@/components/dashboard/welcome-header"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { StatsOverview, ProgressOverview } from "@/components/dashboard/stats-overview"
import ProfileCard from "@/components/profile-card"
import type { DashboardData } from "@/lib/schemas/dashboard-schemas"
import type { AcademicTier } from "@/components/gamification/tier-badge"
import type { EngagementLevel } from "@/components/gamification/xp-progress-bar"

interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  image?: string | null
}

interface DashboardContentProps {
  user: User
  data: DashboardData
}

export function DashboardContent({ user, data }: DashboardContentProps) {
  const { progression, streak, recentActivity, stats } = data

  // Determine streak status
  const getStreakStatus = (): "active" | "frozen" | "at_risk" | "broken" => {
    if (!streak) return "active"
    if (streak.graceExpiresAt && new Date(streak.graceExpiresAt) > new Date()) {
      return "frozen"
    }
    if (!streak.todayGoalMet && streak.currentStreak > 0) {
      return "at_risk"
    }
    return "active"
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Welcome Header */}
      <WelcomeHeader
        userName={user.name}
        tier={(progression?.academicTier as AcademicTier) || "SEED"}
        currentStreak={streak?.currentStreak || 0}
        streakStatus={getStreakStatus()}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Overview */}
      <StatsOverview
        questionsToday={stats.questionsToday}
        accuracyToday={stats.accuracyToday}
        timeSpentToday={stats.timeSpentToday}
        topicsStudied={stats.topicsStudied}
      />

      {/* Progress Section */}
      <ProgressOverview
        totalXp={progression?.totalXp || 0}
        engagementLevel={(progression?.engagementLevel as EngagementLevel) || "NEWCOMER"}
        dailyGoalCurrent={streak?.todayProgress || 0}
        dailyGoalTarget={streak?.dailyGoalTarget || 10}
        dailyGoalType={(streak?.dailyGoalType as "QUESTIONS" | "MINUTES" | "SCORE") || "QUESTIONS"}
        dailyGoalMet={streak?.todayGoalMet || false}
      />

      {/* Activity and Profile Section */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <ActivityFeed
          activities={recentActivity}
          maxItems={5}
          showViewAll
        />
        <ProfileCard />
      </div>
    </div>
  )
}
