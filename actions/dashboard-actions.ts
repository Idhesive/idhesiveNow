"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { DashboardData, UpdateStreakGoal } from "@/lib/schemas/dashboard-schemas"

/**
 * Get the current authenticated user's session
 */
async function getAuthenticatedUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session.user
}

/**
 * Get or create learner profile for user
 */
export async function getOrCreateLearnerProfile(userId: string) {
  let profile = await prisma.learnerProfile.findUnique({
    where: { userId },
  })

  if (!profile) {
    profile = await prisma.learnerProfile.create({
      data: { userId },
    })
  }

  return profile
}

/**
 * Get or create learner progression for user
 */
export async function getOrCreateLearnerProgression(userId: string) {
  let progression = await prisma.learnerProgression.findUnique({
    where: { userId },
  })

  if (!progression) {
    progression = await prisma.learnerProgression.create({
      data: { userId },
    })
  }

  return progression
}

/**
 * Get or create learner streak for user
 */
export async function getOrCreateLearnerStreak(userId: string) {
  let streak = await prisma.learnerStreak.findUnique({
    where: { userId },
  })

  if (!streak) {
    streak = await prisma.learnerStreak.create({
      data: { userId },
    })
  }

  return streak
}

/**
 * Get complete dashboard data for the current user
 */
export async function getDashboardData(): Promise<DashboardData> {
  const user = await getAuthenticatedUser()

  const [profile, progression, streak] = await Promise.all([
    getOrCreateLearnerProfile(user.id),
    getOrCreateLearnerProgression(user.id),
    getOrCreateLearnerStreak(user.id),
  ])

  // Get today's stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayResponses = await prisma.questionResponse.findMany({
    where: {
      userId: user.id,
      submittedAt: {
        gte: today,
      },
    },
    select: {
      isCorrect: true,
      durationMs: true,
    },
  })

  const questionsToday = todayResponses.length
  const correctToday = todayResponses.filter((r) => r.isCorrect).length
  const accuracyToday = questionsToday > 0 ? correctToday / questionsToday : 0
  const timeSpentToday = todayResponses.reduce((sum, r) => sum + (r.durationMs || 0), 0)

  // Get recent activity (XP transactions)
  const recentXpTransactions = await prisma.xpTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      source: true,
      description: true,
      createdAt: true,
      amount: true,
      metadata: true,
    },
  })

  const recentActivity = recentXpTransactions.map((tx) => ({
    id: tx.id,
    type: tx.source,
    description: tx.description || `Earned ${tx.amount} XP`,
    timestamp: tx.createdAt,
    metadata: tx.metadata as Record<string, unknown> | undefined,
  }))

  // Get topics studied count
  const topicsStudied = await prisma.learnerKnowledgeState.count({
    where: { userId: user.id },
  })

  return {
    profile,
    progression,
    streak,
    recentActivity,
    stats: {
      questionsToday,
      accuracyToday,
      timeSpentToday,
      topicsStudied,
    },
  }
}

/**
 * Update daily goal settings
 */
export async function updateDailyGoal(data: UpdateStreakGoal) {
  const user = await getAuthenticatedUser()

  const streak = await prisma.learnerStreak.update({
    where: { userId: user.id },
    data: {
      dailyGoalType: data.dailyGoalType,
      dailyGoalTarget: data.dailyGoalTarget,
    },
  })

  revalidatePath("/dashboard")
  return streak
}

/**
 * Record daily login and update streak if necessary
 */
export async function recordDailyLogin() {
  const user = await getAuthenticatedUser()

  const streak = await getOrCreateLearnerStreak(user.id)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastActiveDate = streak.lastActiveDate
    ? new Date(streak.lastActiveDate)
    : null

  if (lastActiveDate) {
    lastActiveDate.setHours(0, 0, 0, 0)
  }

  // Check if already logged in today
  if (lastActiveDate && lastActiveDate.getTime() === today.getTime()) {
    return { alreadyLoggedIn: true, streak }
  }

  // Check if streak should continue, be frozen, or reset
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let newStreakCount = streak.currentStreak
  let action: "ACTIVE" | "STREAK_BROKEN" | "FREEZE_USED" = "ACTIVE"

  if (!lastActiveDate || lastActiveDate.getTime() < yesterday.getTime()) {
    // Missed more than one day - check for grace period or freeze
    if (streak.graceExpiresAt && new Date(streak.graceExpiresAt) > today) {
      // Grace period active, continue streak
      action = "ACTIVE"
    } else if (streak.streakFreezes > 0) {
      // Use a freeze
      await prisma.learnerStreak.update({
        where: { id: streak.id },
        data: { streakFreezes: { decrement: 1 } },
      })
      action = "FREEZE_USED"
    } else {
      // Streak broken
      newStreakCount = 1
      action = "STREAK_BROKEN"
    }
  } else {
    // Continue streak
    newStreakCount = streak.currentStreak + 1
  }

  const updatedStreak = await prisma.learnerStreak.update({
    where: { id: streak.id },
    data: {
      currentStreak: newStreakCount,
      lastActiveDate: today,
      longestStreak: Math.max(streak.longestStreak, newStreakCount),
      todayProgress: 0,
      todayGoalMet: false,
    },
  })

  revalidatePath("/dashboard")
  return { alreadyLoggedIn: false, streak: updatedStreak, action }
}

/**
 * Use a streak freeze
 */
export async function useStreakFreeze() {
  const user = await getAuthenticatedUser()

  const streak = await getOrCreateLearnerStreak(user.id)

  if (streak.streakFreezes <= 0) {
    throw new Error("No streak freezes available")
  }

  // Set grace period for 24 hours
  const graceExpires = new Date()
  graceExpires.setHours(graceExpires.getHours() + 24)

  const updatedStreak = await prisma.learnerStreak.update({
    where: { id: streak.id },
    data: {
      streakFreezes: { decrement: 1 },
      graceExpiresAt: graceExpires,
    },
  })

  revalidatePath("/dashboard")
  return updatedStreak
}

/**
 * Update today's progress
 */
export async function updateTodayProgress(progressIncrement: number) {
  const user = await getAuthenticatedUser()

  const streak = await getOrCreateLearnerStreak(user.id)
  const newProgress = streak.todayProgress + progressIncrement
  const goalMet = newProgress >= streak.dailyGoalTarget

  const updatedStreak = await prisma.learnerStreak.update({
    where: { id: streak.id },
    data: {
      todayProgress: newProgress,
      todayGoalMet: goalMet,
    },
  })

  revalidatePath("/dashboard")
  return updatedStreak
}

/**
 * Get recent badges earned by user
 */
export async function getRecentBadges(limit = 5) {
  const user = await getAuthenticatedUser()

  const badges = await prisma.learnerBadge.findMany({
    where: { userId: user.id },
    orderBy: { earnedAt: "desc" },
    take: limit,
    include: {
      badge: true,
    },
  })

  return badges
}

/**
 * Get user's active learning paths
 */
export async function getActiveLearningPaths() {
  const user = await getAuthenticatedUser()

  const paths = await prisma.learnerLearningPath.findMany({
    where: {
      userId: user.id,
      completedAt: null,
    },
    include: {
      learningPath: {
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
            take: 5,
          },
        },
      },
    },
    orderBy: { startedAt: "desc" },
    take: 3,
  })

  return paths
}
