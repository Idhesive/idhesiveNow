"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import type { AssessmentType, SessionStatus, QuestionSelectionStrategy, TerminationCondition } from "@prisma/client"

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
 * Get practice dashboard data
 */
export async function getPracticeDashboardData() {
  const user = await getAuthenticatedUser()

  // Get learner profile for stats
  const profile = await prisma.learnerProfile.findUnique({
    where: { userId: user.id },
    select: {
      totalQuestionsAnswered: true,
      totalCorrect: true,
      totalTimeSpentSeconds: true,
      currentStreak: true,
    },
  })

  // Get learner streak for current streak info
  const streak = await prisma.learnerStreak.findUnique({
    where: { userId: user.id },
    select: {
      currentStreak: true,
      todayProgress: true,
      dailyGoalTarget: true,
      todayGoalMet: true,
    },
  })

  // Get available assessment templates
  const templates = await prisma.assessmentTemplate.findMany({
    where: {
      isActive: true,
      isPublic: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  // Get recent sessions
  const recentSessions = await prisma.assessmentSession.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: "desc" },
    take: 5,
    select: {
      id: true,
      assessmentType: true,
      status: true,
      topicIds: true,
      questionsAttempted: true,
      questionsCorrect: true,
      totalScore: true,
      maxPossibleScore: true,
      startedAt: true,
      endedAt: true,
    },
  })

  // Get topic names for sessions
  const topicIds = [...new Set(recentSessions.flatMap((s) => s.topicIds))]
  const topics = await prisma.topic.findMany({
    where: { id: { in: topicIds } },
    select: { id: true, name: true },
  })
  const topicMap = new Map(topics.map((t) => [t.id, t.name]))

  // Get today's daily challenge
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dailyChallenge = await prisma.dailyChallenge.findFirst({
    where: {
      challengeDate: today,
    },
  })

  // Check if user completed today's challenge
  let dailyChallengeAttempt = null
  if (dailyChallenge) {
    dailyChallengeAttempt = await prisma.dailyChallengeAttempt.findFirst({
      where: {
        userId: user.id,
        challengeDate: today,
        templateId: dailyChallenge.templateId,
      },
    })
  }

  // Get weak topics (low mastery, has questions)
  const weakTopics = await prisma.learnerKnowledgeState.findMany({
    where: {
      userId: user.id,
      masteryLevel: { lt: 0.5 },
    },
    orderBy: { masteryLevel: "asc" },
    take: 5,
    include: {
      topic: {
        select: {
          id: true,
          name: true,
          _count: {
            select: { questionTopics: true },
          },
        },
      },
    },
  })

  // Get questions user got wrong for review
  const wrongQuestions = await prisma.questionResponse.count({
    where: {
      userId: user.id,
      isCorrect: false,
    },
  })

  return {
    stats: {
      totalQuestionsAnswered: profile?.totalQuestionsAnswered || 0,
      totalCorrect: profile?.totalCorrect || 0,
      totalTimeSpentSeconds: profile?.totalTimeSpentSeconds || 0,
      currentStreak: streak?.currentStreak || profile?.currentStreak || 0,
    },
    streak: streak
      ? {
          currentStreak: streak.currentStreak,
          todayProgress: streak.todayProgress,
          dailyGoalTarget: streak.dailyGoalTarget,
          todayGoalMet: streak.todayGoalMet,
        }
      : null,
    templates: templates.map((t) => ({
      id: t.id,
      code: t.code,
      name: t.name,
      description: t.description,
      assessmentType: t.assessmentType,
      questionLimit: t.questionLimit,
      timeLimitSeconds: t.timeLimitSeconds,
      isRanked: t.isRanked,
    })),
    recentSessions: recentSessions.map((s) => ({
      id: s.id,
      assessmentType: s.assessmentType,
      status: s.status,
      topicNames: s.topicIds.map((id) => topicMap.get(id)).filter(Boolean) as string[],
      questionsAttempted: s.questionsAttempted,
      questionsCorrect: s.questionsCorrect,
      totalScore: s.totalScore,
      maxPossibleScore: s.maxPossibleScore,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
    })),
    dailyChallenge: dailyChallenge
      ? {
          id: dailyChallenge.id,
          questionCount: dailyChallenge.questionIds.length,
          totalParticipants: dailyChallenge.totalCompletions,
          hasCompleted: !!dailyChallengeAttempt,
          userScore: dailyChallengeAttempt?.score,
          userRank: dailyChallengeAttempt?.rank,
        }
      : null,
    recommendations: {
      weakTopicsCount: weakTopics.filter((w) => w.topic._count.questionTopics > 0).length,
      reviewCount: wrongQuestions,
      weakTopics: weakTopics.map((w) => ({
        topicId: w.topic.id,
        topicName: w.topic.name,
        masteryLevel: w.masteryLevel,
        questionCount: w.topic._count.questionTopics,
      })),
    },
  }
}

/**
 * Get assessment session by ID
 */
export async function getAssessmentSession(sessionId: string) {
  const user = await getAuthenticatedUser()

  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
    include: {
      template: true,
      questionOrder: {
        orderBy: { position: "asc" },
        include: {
          question: {
            select: {
              id: true,
              publicId: true,
              qtiXml: true,
              type: true,
              title: true,
              difficultyLevel: true,
              maxScore: true,
            },
          },
        },
      },
      responses: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          questionId: true,
          isCorrect: true,
          score: true,
          submittedAt: true,
        },
      },
    },
  })

  if (!session || session.userId !== user.id) {
    return null
  }

  // Get topic names
  const topics = await prisma.topic.findMany({
    where: { id: { in: session.topicIds } },
    select: { id: true, name: true },
  })
  const topicMap = new Map(topics.map((t) => [t.id, t.name]))

  return {
    id: session.id,
    assessmentType: session.assessmentType,
    status: session.status,
    config: session.config,
    topicIds: session.topicIds,
    topicNames: session.topicIds.map((id) => topicMap.get(id)).filter(Boolean) as string[],
    currentQuestionIndex: session.currentQuestionIndex,
    questionsAttempted: session.questionsAttempted,
    questionsCorrect: session.questionsCorrect,
    totalScore: session.totalScore,
    maxPossibleScore: session.maxPossibleScore,
    currentStreak: session.currentStreak,
    longestStreak: session.longestStreak,
    livesRemaining: session.livesRemaining,
    livesUsed: session.livesUsed,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    totalTimeMs: session.totalTimeMs,
    template: session.template
      ? {
          id: session.template.id,
          name: session.template.name,
          showFeedbackAfterEach: session.template.showFeedbackAfterEach,
          showCorrectAnswer: session.template.showCorrectAnswer,
          allowSkip: session.template.allowSkip,
          allowHints: session.template.allowHints,
          perQuestionTimeLimit: session.template.perQuestionTimeLimit,
          showTimer: session.template.showTimer,
          startingLives: session.template.startingLives,
        }
      : null,
    questions: session.questionOrder.map((qo) => ({
      position: qo.position,
      questionId: qo.question.id,
      publicId: qo.question.publicId,
      qtiXml: qo.question.qtiXml,
      type: qo.question.type,
      title: qo.question.title,
      difficultyLevel: qo.question.difficultyLevel,
      maxScore: qo.question.maxScore,
      wasAnswered: qo.wasAnswered,
      wasSkipped: qo.wasSkipped,
      wasCorrect: qo.wasCorrect,
    })),
    responses: session.responses,
  }
}

/**
 * Get assessment session results
 */
export async function getSessionResults(sessionId: string) {
  const user = await getAuthenticatedUser()

  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
    include: {
      template: {
        select: { name: true },
      },
      questionOrder: {
        orderBy: { position: "asc" },
        include: {
          question: {
            select: {
              id: true,
              title: true,
              qtiXml: true,
              type: true,
              difficultyLevel: true,
              maxScore: true,
              correctAnswers: true,
            },
          },
        },
      },
      responses: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          questionId: true,
          response: true,
          responseText: true,
          isCorrect: true,
          score: true,
          maxScore: true,
          durationMs: true,
          hintsUsed: true,
          confidenceLevel: true,
        },
      },
    },
  })

  if (!session || session.userId !== user.id) {
    return null
  }

  // Get topic names
  const topics = await prisma.topic.findMany({
    where: { id: { in: session.topicIds } },
    select: { id: true, name: true },
  })
  const topicMap = new Map(topics.map((t) => [t.id, t.name]))

  // Map responses by question ID
  const responseMap = new Map(
    session.responses.map((r) => [r.questionId, r])
  )

  const accuracy = session.questionsAttempted > 0
    ? session.questionsCorrect / session.questionsAttempted
    : 0

  return {
    id: session.id,
    assessmentType: session.assessmentType,
    status: session.status,
    templateName: session.template?.name,
    topicNames: session.topicIds.map((id) => topicMap.get(id)).filter(Boolean) as string[],
    questionsAttempted: session.questionsAttempted,
    questionsCorrect: session.questionsCorrect,
    questionsSkipped: session.questionsSkipped,
    totalScore: session.totalScore,
    maxPossibleScore: session.maxPossibleScore,
    accuracy,
    longestStreak: session.longestStreak,
    streakBonusEarned: session.streakBonusEarned,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    totalTimeMs: session.totalTimeMs,
    terminationReason: session.terminationReason,
    // Question-level details
    questions: session.questionOrder.map((qo) => {
      const response = responseMap.get(qo.question.id)
      return {
        position: qo.position,
        questionId: qo.question.id,
        title: qo.question.title,
        qtiXml: qo.question.qtiXml,
        type: qo.question.type,
        difficultyLevel: qo.question.difficultyLevel,
        maxScore: qo.question.maxScore,
        correctAnswers: qo.question.correctAnswers,
        wasAnswered: qo.wasAnswered,
        wasSkipped: qo.wasSkipped,
        wasCorrect: qo.wasCorrect,
        response: response
          ? {
              response: response.response,
              responseText: response.responseText,
              isCorrect: response.isCorrect,
              score: response.score,
              maxScore: response.maxScore,
              durationMs: response.durationMs,
              hintsUsed: response.hintsUsed,
            }
          : null,
      }
    }),
  }
}

/**
 * Get user's assessment history
 */
export async function getAssessmentHistory(params?: {
  page?: number
  limit?: number
  assessmentType?: AssessmentType
  status?: SessionStatus
}) {
  const user = await getAuthenticatedUser()
  const page = params?.page || 0
  const limit = params?.limit || 20

  const where = {
    userId: user.id,
    ...(params?.assessmentType && { assessmentType: params.assessmentType }),
    ...(params?.status && { status: params.status }),
  }

  const [sessions, total] = await Promise.all([
    prisma.assessmentSession.findMany({
      where,
      orderBy: { startedAt: "desc" },
      skip: page * limit,
      take: limit,
      select: {
        id: true,
        assessmentType: true,
        status: true,
        topicIds: true,
        questionsAttempted: true,
        questionsCorrect: true,
        totalScore: true,
        maxPossibleScore: true,
        startedAt: true,
        endedAt: true,
        totalTimeMs: true,
      },
    }),
    prisma.assessmentSession.count({ where }),
  ])

  // Get topic names
  const topicIds = [...new Set(sessions.flatMap((s) => s.topicIds))]
  const topics = await prisma.topic.findMany({
    where: { id: { in: topicIds } },
    select: { id: true, name: true },
  })
  const topicMap = new Map(topics.map((t) => [t.id, t.name]))

  return {
    sessions: sessions.map((s) => ({
      id: s.id,
      assessmentType: s.assessmentType,
      status: s.status,
      topicNames: s.topicIds.map((id) => topicMap.get(id)).filter(Boolean) as string[],
      questionsAttempted: s.questionsAttempted,
      questionsCorrect: s.questionsCorrect,
      totalScore: s.totalScore,
      maxPossibleScore: s.maxPossibleScore,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      totalTimeMs: s.totalTimeMs,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Start a new practice session
 */
export async function startPracticeSession(params: {
  templateId?: string
  assessmentType?: AssessmentType
  topicIds?: string[]
  questionCount?: number
}) {
  const user = await getAuthenticatedUser()

  let config: {
    assessmentType: AssessmentType
    selectionStrategy: QuestionSelectionStrategy
    terminationCondition: TerminationCondition
    questionLimit: number | null
    timeLimitSeconds: number | null
    showFeedbackAfterEach: boolean
    showCorrectAnswer: boolean
    allowSkip: boolean
    allowHints: boolean
    startingLives: number | null
  } = {
    assessmentType: params.assessmentType || "PRACTICE_SET",
    selectionStrategy: "RANDOM_FROM_POOL" as QuestionSelectionStrategy,
    terminationCondition: "FIXED_COUNT" as TerminationCondition,
    questionLimit: params.questionCount || 10,
    timeLimitSeconds: null,
    showFeedbackAfterEach: true,
    showCorrectAnswer: true,
    allowSkip: true,
    allowHints: true,
    startingLives: null,
  }

  // If template provided, use its config
  if (params.templateId) {
    const template = await prisma.assessmentTemplate.findUnique({
      where: { id: params.templateId },
    })
    if (template) {
      config = {
        assessmentType: template.assessmentType,
        selectionStrategy: template.selectionStrategy,
        terminationCondition: template.terminationCondition,
        questionLimit: template.questionLimit,
        timeLimitSeconds: template.timeLimitSeconds,
        showFeedbackAfterEach: template.showFeedbackAfterEach,
        showCorrectAnswer: template.showCorrectAnswer,
        allowSkip: template.allowSkip,
        allowHints: template.allowHints,
        startingLives: template.startingLives,
      }
    }
  }

  // Get questions for the session
  const questionWhere = {
    isActive: true,
    isReviewed: true,
    ...(params.topicIds && params.topicIds.length > 0
      ? {
          topics: {
            some: {
              topicId: { in: params.topicIds },
            },
          },
        }
      : {}),
  }

  console.log("[startPracticeSession] Query where clause:", JSON.stringify(questionWhere, null, 2))
  console.log("[startPracticeSession] Topic IDs:", params.topicIds)

  const questions = await prisma.question.findMany({
    where: questionWhere,
    take: config.questionLimit || 10,
    orderBy: { createdAt: "desc" }, // Could be randomized
    select: { id: true },
  })

  console.log("[startPracticeSession] Found questions:", questions.length)

  if (questions.length === 0) {
    // Debug: check total questions and questions with topic links
    const totalQuestions = await prisma.question.count({
      where: { isActive: true, isReviewed: true }
    })
    console.log("[startPracticeSession] Total active/reviewed questions:", totalQuestions)

    if (params.topicIds && params.topicIds.length > 0) {
      const topicLinks = await prisma.questionTopic.count({
        where: { topicId: { in: params.topicIds } }
      })
      console.log("[startPracticeSession] QuestionTopic links for these topics:", topicLinks)
    }

    throw new Error(`No questions available for this practice session (topicIds: ${params.topicIds?.join(", ") || "none"})`)
  }

  // Create the session
  const session = await prisma.assessmentSession.create({
    data: {
      userId: user.id,
      templateId: params.templateId,
      assessmentType: config.assessmentType,
      selectionStrategy: config.selectionStrategy,
      terminationCondition: config.terminationCondition,
      config: config as object,
      topicIds: params.topicIds || [],
      status: "IN_PROGRESS",
      currentQuestionIndex: 0,
      livesRemaining: config.startingLives,
      questionOrder: {
        create: questions.map((q, index) => ({
          questionId: q.id,
          position: index,
        })),
      },
    },
  })

  return { sessionId: session.id }
}

/**
 * Submit a response for a question in a session
 */
export async function submitQuestionResponse(params: {
  sessionId: string
  questionId: string
  response: unknown
  responseText?: string
  startedAt: Date
  confidenceLevel?: number
}) {
  const user = await getAuthenticatedUser()

  // Get the session
  const session = await prisma.assessmentSession.findUnique({
    where: { id: params.sessionId },
    include: {
      questionOrder: {
        where: { questionId: params.questionId },
      },
    },
  })

  if (!session || session.userId !== user.id) {
    throw new Error("Session not found")
  }

  if (session.status !== "IN_PROGRESS") {
    throw new Error("Session is not active")
  }

  // Get the question to check correct answer
  const question = await prisma.question.findUnique({
    where: { id: params.questionId },
    select: { correctAnswers: true, maxScore: true },
  })

  if (!question) {
    throw new Error("Question not found")
  }

  // Simple scoring - compare response to correct answers
  // In a real implementation, this would be more sophisticated
  const isCorrect = checkAnswer(params.response, question.correctAnswers)
  const score = isCorrect ? (question.maxScore || 1) : 0

  const now = new Date()
  const durationMs = now.getTime() - params.startedAt.getTime()

  // Create the response
  const response = await prisma.questionResponse.create({
    data: {
      userId: user.id,
      questionId: params.questionId,
      assessmentSessionId: params.sessionId,
      response: params.response as object,
      responseText: params.responseText,
      isCorrect,
      score,
      maxScore: question.maxScore,
      startedAt: params.startedAt,
      submittedAt: now,
      durationMs,
      confidenceLevel: params.confidenceLevel,
    },
  })

  // Update session stats
  const newStreak = isCorrect ? session.currentStreak + 1 : 0
  const newLongestStreak = Math.max(session.longestStreak, newStreak)

  await prisma.$transaction([
    // Update session
    prisma.assessmentSession.update({
      where: { id: params.sessionId },
      data: {
        questionsAttempted: { increment: 1 },
        questionsCorrect: isCorrect ? { increment: 1 } : undefined,
        totalScore: { increment: score },
        maxPossibleScore: { increment: question.maxScore || 1 },
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        currentQuestionIndex: { increment: 1 },
        livesRemaining: !isCorrect && session.livesRemaining !== null
          ? { decrement: 1 }
          : undefined,
        livesUsed: !isCorrect && session.livesRemaining !== null
          ? { increment: 1 }
          : undefined,
      },
    }),
    // Update question order
    prisma.assessmentQuestionOrder.updateMany({
      where: {
        sessionId: params.sessionId,
        questionId: params.questionId,
      },
      data: {
        wasAnswered: true,
        wasCorrect: isCorrect,
        answeredAt: now,
        timeSpentMs: durationMs,
      },
    }),
    // Update learner profile stats
    prisma.learnerProfile.upsert({
      where: { userId: user.id },
      update: {
        totalQuestionsAnswered: { increment: 1 },
        totalCorrect: isCorrect ? { increment: 1 } : undefined,
        totalTimeSpentSeconds: { increment: Math.round(durationMs / 1000) },
      },
      create: {
        userId: user.id,
        totalQuestionsAnswered: 1,
        totalCorrect: isCorrect ? 1 : 0,
        totalTimeSpentSeconds: Math.round(durationMs / 1000),
      },
    }),
  ])

  return {
    responseId: response.id,
    isCorrect,
    score,
    maxScore: question.maxScore,
    correctAnswers: question.correctAnswers,
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
  }
}

/**
 * End a practice session
 */
export async function endPracticeSession(sessionId: string, reason?: string) {
  const user = await getAuthenticatedUser()

  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
  })

  if (!session || session.userId !== user.id) {
    throw new Error("Session not found")
  }

  const now = new Date()
  const totalTimeMs = now.getTime() - session.startedAt.getTime() - session.pausedTimeMs

  await prisma.assessmentSession.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      endedAt: now,
      totalTimeMs,
      terminationReason: reason || "USER_COMPLETED",
    },
  })

  return { success: true }
}

/**
 * Helper function to check if an answer is correct
 * This is a simplified version - real implementation would handle different question types
 */
function checkAnswer(response: unknown, correctAnswers: unknown): boolean {
  if (!correctAnswers) return false

  // Handle simple string comparison
  if (typeof response === "string" && typeof correctAnswers === "string") {
    return response.trim().toLowerCase() === correctAnswers.trim().toLowerCase()
  }

  // Handle array of correct answers
  if (typeof response === "string" && Array.isArray(correctAnswers)) {
    return correctAnswers.some(
      (ca) =>
        typeof ca === "string" &&
        response.trim().toLowerCase() === ca.trim().toLowerCase()
    )
  }

  // Handle object comparison (for multiple choice, etc.)
  if (typeof response === "object" && typeof correctAnswers === "object") {
    return JSON.stringify(response) === JSON.stringify(correctAnswers)
  }

  return false
}

/**
 * Get daily challenge data for a specific date
 */
export async function getDailyChallengeData(date?: Date) {
  const user = await getAuthenticatedUser()

  // Use provided date or today (user's local date will be passed from client)
  const challengeDate = date || new Date()
  challengeDate.setHours(0, 0, 0, 0)

  // Get the daily challenge
  const challenge = await prisma.dailyChallenge.findFirst({
    where: { challengeDate },
  })

  if (!challenge) {
    return {
      challenge: null,
      userAttempts: [],
      bestAttempt: null,
      leaderboard: [],
      userRank: null,
    }
  }

  // Get the template separately
  const template = await prisma.assessmentTemplate.findUnique({
    where: { id: challenge.templateId },
    select: {
      id: true,
      name: true,
      description: true,
      assessmentType: true,
    },
  })

  // Get all user's attempts for this challenge (supports retries)
  const userAttempts = await prisma.dailyChallengeAttempt.findMany({
    where: {
      userId: user.id,
      challengeDate,
      templateId: challenge.templateId,
    },
    orderBy: { completedAt: "desc" },
  })

  // Get user's best attempt (highest score, then fastest time)
  const bestAttempt = userAttempts.length > 0
    ? userAttempts.reduce((best, current) => {
        if (current.score > best.score) return current
        if (current.score === best.score && current.timeMs < best.timeMs) return current
        return best
      })
    : null

  // Get leaderboard - top 10 users by best attempt
  // Emphasize participation: show attempts count, consistency indicators
  const leaderboard = await prisma.dailyChallengeAttempt.findMany({
    where: {
      challengeDate,
      templateId: challenge.templateId,
    },
    orderBy: [
      { score: "desc" },
      { timeMs: "asc" },
    ],
  })

  // Get user details for leaderboard
  const userIds = [...new Set(leaderboard.map(a => a.userId))]
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      image: true,
    },
  })
  const userMap = new Map(users.map(u => [u.id, u]))

  // Group by user and keep only best attempt per user
  const userBestAttempts = new Map<string, typeof leaderboard[0]>()
  for (const attempt of leaderboard) {
    const existing = userBestAttempts.get(attempt.userId)
    if (!existing ||
        attempt.score > existing.score ||
        (attempt.score === existing.score && attempt.timeMs < existing.timeMs)) {
      userBestAttempts.set(attempt.userId, attempt)
    }
  }

  const topAttempts = Array.from(userBestAttempts.values())
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.timeMs - b.timeMs
    })
    .slice(0, 10)

  // Calculate user's rank (only among users with attempts)
  let userRank: number | null = null
  if (bestAttempt) {
    const allBestAttempts = Array.from(userBestAttempts.values())
    userRank = allBestAttempts.findIndex(a => a.userId === user.id) + 1
    if (userRank === 0) userRank = null
  }

  return {
    challenge: {
      id: challenge.id,
      challengeDate: challenge.challengeDate,
      templateId: challenge.templateId,
      questionCount: challenge.questionIds.length,
      totalParticipants: userBestAttempts.size,
      averageScore: challenge.averageScore,
      template,
    },
    userAttempts: userAttempts.map(a => ({
      id: a.id,
      score: a.score,
      timeMs: a.timeMs,
      questionsCorrect: a.questionsCorrect,
      completedAt: a.completedAt,
      sessionId: a.sessionId,
    })),
    bestAttempt: bestAttempt ? {
      id: bestAttempt.id,
      score: bestAttempt.score,
      timeMs: bestAttempt.timeMs,
      questionsCorrect: bestAttempt.questionsCorrect,
      completedAt: bestAttempt.completedAt,
    } : null,
    leaderboard: topAttempts.map((attempt, index) => {
      const userData = userMap.get(attempt.userId)
      return {
        rank: index + 1,
        userId: attempt.userId,
        userName: userData?.name || "Anonymous",
        userImage: userData?.image || null,
        score: attempt.score,
        timeMs: attempt.timeMs,
        questionsCorrect: attempt.questionsCorrect,
        completedAt: attempt.completedAt,
      }
    }),
    userRank,
  }
}

/**
 * Start a daily challenge session
 */
export async function startDailyChallenge(params: {
  challengeId: string
  challengeDate: Date
}) {
  const user = await getAuthenticatedUser()

  // Get the daily challenge
  const challenge = await prisma.dailyChallenge.findUnique({
    where: { id: params.challengeId },
  })

  if (!challenge) {
    throw new Error("Daily challenge not found")
  }

  // Get the template
  const template = await prisma.assessmentTemplate.findUnique({
    where: { id: challenge.templateId },
  })

  if (!template) {
    throw new Error("Challenge template not found")
  }

  // Create an assessment session with the fixed question set
  const session = await prisma.assessmentSession.create({
    data: {
      userId: user.id,
      templateId: challenge.templateId,
      assessmentType: template.assessmentType,
      selectionStrategy: template.selectionStrategy,
      terminationCondition: template.terminationCondition,
      config: {
        ...template,
        isDailyChallenge: true,
        challengeId: challenge.id,
        challengeDate: params.challengeDate,
      } as object,
      topicIds: [],
      status: "IN_PROGRESS",
      currentQuestionIndex: 0,
      livesRemaining: template.startingLives,
      questionOrder: {
        create: challenge.questionIds.map((qId, index) => ({
          questionId: qId,
          position: index,
        })),
      },
    },
  })

  return { sessionId: session.id }
}

/**
 * Complete a daily challenge and record the attempt
 */
export async function completeDailyChallenge(params: {
  sessionId: string
  challengeId: string
  challengeDate: Date
}) {
  const user = await getAuthenticatedUser()

  // Get the completed session
  const session = await prisma.assessmentSession.findUnique({
    where: { id: params.sessionId },
  })

  if (!session || session.userId !== user.id) {
    throw new Error("Session not found")
  }

  if (session.status !== "COMPLETED") {
    throw new Error("Session is not completed")
  }

  // Get the challenge
  const challenge = await prisma.dailyChallenge.findUnique({
    where: { id: params.challengeId },
  })

  if (!challenge) {
    throw new Error("Challenge not found")
  }

  // Create the attempt record
  const attempt = await prisma.dailyChallengeAttempt.create({
    data: {
      userId: user.id,
      challengeDate: params.challengeDate,
      templateId: challenge.templateId,
      sessionId: session.id,
      score: session.totalScore,
      timeMs: session.totalTimeMs || 0,
      questionsCorrect: session.questionsCorrect,
    },
  })

  // Update challenge aggregate stats
  const allAttempts = await prisma.dailyChallengeAttempt.findMany({
    where: {
      challengeDate: params.challengeDate,
      templateId: challenge.templateId,
    },
  })

  const totalScore = allAttempts.reduce((sum, a) => sum + a.score, 0)
  const averageScore = allAttempts.length > 0 ? totalScore / allAttempts.length : 0

  // Count unique users who completed
  const uniqueUsers = new Set(allAttempts.map(a => a.userId))

  await prisma.dailyChallenge.update({
    where: { id: params.challengeId },
    data: {
      totalAttempts: allAttempts.length,
      totalCompletions: uniqueUsers.size,
      averageScore,
    },
  })

  // Calculate user's rank (best attempt per user)
  const userBestAttempts = new Map<string, typeof allAttempts[0]>()
  for (const att of allAttempts) {
    const existing = userBestAttempts.get(att.userId)
    if (!existing ||
        att.score > existing.score ||
        (att.score === existing.score && att.timeMs < existing.timeMs)) {
      userBestAttempts.set(att.userId, att)
    }
  }

  const sortedBestAttempts = Array.from(userBestAttempts.values())
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.timeMs - b.timeMs
    })

  const userBest = userBestAttempts.get(user.id)
  const rank = userBest ? sortedBestAttempts.findIndex(a => a.userId === user.id) + 1 : null

  // Update the rank on the attempt
  if (rank) {
    await prisma.dailyChallengeAttempt.update({
      where: { id: attempt.id },
      data: { rank },
    })
  }

  return {
    attemptId: attempt.id,
    rank,
    score: attempt.score,
    isNewBest: !userBest || attempt.score > userBest.score ||
      (attempt.score === userBest.score && attempt.timeMs < userBest.timeMs),
  }
}

/**
 * Get list of available past challenges
 */
export async function getPastChallenges(params?: {
  page?: number
  limit?: number
}) {
  const user = await getAuthenticatedUser()
  const page = params?.page || 0
  const limit = params?.limit || 20

  const [challenges, total] = await Promise.all([
    prisma.dailyChallenge.findMany({
      orderBy: { challengeDate: "desc" },
      skip: page * limit,
      take: limit,
    }),
    prisma.dailyChallenge.count(),
  ])

  // Get templates for these challenges
  const templateIds = [...new Set(challenges.map(c => c.templateId))]
  const templates = await prisma.assessmentTemplate.findMany({
    where: { id: { in: templateIds } },
    select: {
      id: true,
      name: true,
      description: true,
    },
  })
  const templateMap = new Map(templates.map(t => [t.id, t]))

  // Get user's attempts for these challenges
  const challengeDates = challenges.map(c => c.challengeDate)
  const userAttempts = await prisma.dailyChallengeAttempt.findMany({
    where: {
      userId: user.id,
      challengeDate: { in: challengeDates },
    },
  })

  const attemptsByDate = new Map(
    userAttempts.map(a => [a.challengeDate.toISOString(), a])
  )

  return {
    challenges: challenges.map(c => {
      const template = templateMap.get(c.templateId)
      return {
        id: c.id,
        challengeDate: c.challengeDate,
        questionCount: c.questionIds.length,
        totalParticipants: c.totalCompletions,
        averageScore: c.averageScore,
        templateName: template?.name || null,
        templateDescription: template?.description || null,
        userCompleted: attemptsByDate.has(c.challengeDate.toISOString()),
        userScore: attemptsByDate.get(c.challengeDate.toISOString())?.score,
      }
    }),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}
