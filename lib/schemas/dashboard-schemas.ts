import { z } from "zod"
import type {
  LearnerProfile as PrismaLearnerProfile,
  LearnerProgression as PrismaLearnerProgression,
  LearnerStreak as PrismaLearnerStreak,
} from "@prisma/client"

// Use Prisma types directly for data models
export type LearnerProfile = PrismaLearnerProfile
export type LearnerProgression = PrismaLearnerProgression
export type LearnerStreak = PrismaLearnerStreak

// Update schemas for mutations (validated at runtime)
export const updateStreakGoalSchema = z.object({
  dailyGoalType: z.enum(["QUESTIONS", "MINUTES", "SCORE"]),
  dailyGoalTarget: z.number().int().min(1).max(100),
})

export type UpdateStreakGoal = z.infer<typeof updateStreakGoalSchema>

// Activity item for recent activity feed
export interface ActivityItem {
  id: string
  type: string
  description: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

// Dashboard data aggregation type
export interface DashboardData {
  profile: LearnerProfile | null
  progression: LearnerProgression | null
  streak: LearnerStreak | null
  recentActivity: ActivityItem[]
  stats: {
    questionsToday: number
    accuracyToday: number
    timeSpentToday: number
    topicsStudied: number
  }
}
