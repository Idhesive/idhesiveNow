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
