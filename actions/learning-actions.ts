"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import type { TopicStatus } from "@/components/learning/topic-card"
import type { TopicTreeNode } from "@/components/learning/topic-tree"

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
 * Get user's current grade level from profile
 */
async function getUserGradeLevel(userId: string) {
  const profile = await prisma.learnerProfile.findUnique({
    where: { userId },
    select: { currentGrade: true },
  })
  return profile?.currentGrade || 4 // Default to grade 4
}

/**
 * Get all subjects with user progress
 */
export async function getSubjectsWithProgress() {
  const user = await getAuthenticatedUser()
  const userGrade = await getUserGradeLevel(user.id)

  // Get all subjects - we'll filter grade levels in the map
  const subjects = await prisma.subject.findMany({
    include: {
      gradeLevels: {
        orderBy: { grade: "asc" },
        include: {
          topics: {
            where: { parentId: null, isActive: true },
            select: { id: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  })

  // Get user's topic progress
  const knowledgeStates = await prisma.learnerKnowledgeState.findMany({
    where: { userId: user.id },
    select: {
      topicId: true,
      masteryLevel: true,
    },
  })

  const masteryMap = new Map(
    knowledgeStates.map((ks) => [ks.topicId, ks.masteryLevel])
  )

  // Get current learning path item per subject
  const activePaths = await prisma.learnerLearningPath.findMany({
    where: {
      userId: user.id,
      completedAt: null,
    },
    include: {
      learningPath: {
        include: {
          gradeLevel: {
            include: { subject: true },
          },
          items: {
            orderBy: { sortOrder: "asc" },
            include: { topic: true },
          },
        },
      },
    },
  })

  const currentTopicBySubject = new Map<string, string>()
  for (const lp of activePaths) {
    const subjectId = lp.learningPath.gradeLevel.subject.id
    // Find the current item based on itemsCompleted count
    const currentItem = lp.learningPath.items[lp.itemsCompleted]
    if (currentItem) {
      currentTopicBySubject.set(subjectId, currentItem.topic.name)
    }
  }

  return subjects.map((subject) => {
    // Find the grade level matching user's grade, or fall back to the first available
    const gradeLevel = subject.gradeLevels.find((gl) => gl.grade === userGrade)
      || subject.gradeLevels[0]
    const topicIds = gradeLevel?.topics.map((t) => t.id) || []
    const completedTopics = topicIds.filter(
      (id) => (masteryMap.get(id) || 0) >= 0.8
    ).length

    return {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      description: subject.description,
      color: subject.color,
      icon: subject.icon,
      topicsCount: topicIds.length,
      completedTopics,
      currentTopic: currentTopicBySubject.get(subject.id) || null,
    }
  })
}

/**
 * Get subject details with topics
 */
export async function getSubjectWithTopics(subjectId: string) {
  const user = await getAuthenticatedUser()
  const userGrade = await getUserGradeLevel(user.id)

  // First try to get subject with user's grade level
  let subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      gradeLevels: {
        where: { grade: userGrade },
        include: {
          topics: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            include: {
              children: {
                where: { isActive: true },
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
    },
  })

  // If no grade level found for user's grade, try to get any available grade level
  if (subject && subject.gradeLevels.length === 0) {
    subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        gradeLevels: {
          take: 1,
          orderBy: { grade: "asc" },
          include: {
            topics: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
              include: {
                children: {
                  where: { isActive: true },
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
        },
      },
    })
  }

  if (!subject) {
    return null
  }

  // Get user's knowledge states for all topics
  const knowledgeStates = await prisma.learnerKnowledgeState.findMany({
    where: { userId: user.id },
    select: {
      topicId: true,
      masteryLevel: true,
    },
  })

  const masteryMap = new Map(
    knowledgeStates.map((ks) => [ks.topicId, ks.masteryLevel])
  )

  // Get completed topics from responses
  const completedTopicIds = new Set(
    knowledgeStates
      .filter((ks) => ks.masteryLevel >= 0.8)
      .map((ks) => ks.topicId)
  )

  // Get in-progress topics (has some responses but not mastered)
  const inProgressTopicIds = new Set(
    knowledgeStates
      .filter((ks) => ks.masteryLevel > 0 && ks.masteryLevel < 0.8)
      .map((ks) => ks.topicId)
  )

  const gradeLevelData = subject.gradeLevels[0]
  const topics = gradeLevelData?.topics || []

  // Determine topic status
  function getTopicStatus(topicId: string, prerequisites: string[]): TopicStatus {
    if (completedTopicIds.has(topicId)) return "completed"
    if (inProgressTopicIds.has(topicId)) return "in_progress"

    // Check prerequisites
    if (prerequisites.length > 0) {
      const allPrereqsMet = prerequisites.every((prereq) => {
        const prereqTopic = topics.find((t) => t.code === prereq)
        return prereqTopic && completedTopicIds.has(prereqTopic.id)
      })
      if (!allPrereqsMet) return "locked"
    }

    return "available"
  }

  // Build topic tree with status
  function buildTopicTree(
    topicList: typeof topics,
    parentId: string | null = null
  ): TopicTreeNode[] {
    if (!topicList || topicList.length === 0) {
      return []
    }
    return topicList
      .filter((t) => t.parentId === parentId)
      .map((topic) => ({
        id: topic.id,
        name: topic.name,
        description: topic.description,
        status: getTopicStatus(topic.id, topic.prerequisites),
        progress: 0,
        masteryLevel: masteryMap.get(topic.id) || 0,
        children: topic.children && topic.children.length > 0
          ? buildTopicTree(topic.children as typeof topics, topic.id)
          : [],
      }))
  }

  // Flatten topics for list view
  const flatTopics = topics
    .filter((t) => !t.parentId)
    .map((topic) => ({
      id: topic.id,
      subjectId: subject.id,
      name: topic.name,
      description: topic.description,
      status: getTopicStatus(topic.id, topic.prerequisites),
      progress: 0,
      estimatedMinutes: topic.estimatedHours
        ? Math.round(topic.estimatedHours * 60)
        : undefined,
      masteryLevel: masteryMap.get(topic.id) || 0,
    }))

  return {
    subject: {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      description: subject.description,
      color: subject.color,
    },
    gradeLevelId: gradeLevelData?.id,
    gradeLevelName: gradeLevelData?.name,
    topicTree: buildTopicTree(topics),
    flatTopics,
    stats: {
      totalTopics: topics.length,
      completedTopics: completedTopicIds.size,
      inProgressTopics: inProgressTopicIds.size,
    },
  }
}

/**
 * Get topic details with content
 */
export async function getTopicDetails(topicId: string) {
  const user = await getAuthenticatedUser()

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      gradeLevel: {
        include: {
          subject: true,
        },
      },
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      tutorialContent: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      questionTopics: {
        include: {
          question: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  })

  if (!topic) {
    return null
  }

  // Get user's knowledge state for this topic
  const knowledgeState = await prisma.learnerKnowledgeState.findUnique({
    where: {
      userId_topicId: {
        userId: user.id,
        topicId,
      },
    },
  })

  // Get user's responses for questions in this topic
  const questionIds = topic.questionTopics.map((qt) => qt.question.id)
  const responses = await prisma.questionResponse.findMany({
    where: {
      userId: user.id,
      questionId: { in: questionIds },
    },
    orderBy: { submittedAt: "desc" },
    take: 50,
  })

  const totalQuestions = questionIds.length
  const answeredQuestions = new Set(responses.map((r) => r.questionId)).size
  const correctAnswers = responses.filter((r) => r.isCorrect).length

  return {
    topic: {
      id: topic.id,
      code: topic.code,
      name: topic.name,
      description: topic.description,
      learningGoals: topic.learningGoals,
      prerequisites: topic.prerequisites,
      estimatedHours: topic.estimatedHours,
    },
    subject: {
      id: topic.gradeLevel.subject.id,
      name: topic.gradeLevel.subject.name,
      color: topic.gradeLevel.subject.color,
    },
    gradeLevel: {
      id: topic.gradeLevel.id,
      name: topic.gradeLevel.name,
      grade: topic.gradeLevel.grade,
    },
    subtopics: topic.children.map((child) => ({
      id: child.id,
      name: child.name,
      description: child.description,
    })),
    tutorials: topic.tutorialContent.map((tc) => ({
      id: tc.id,
      title: tc.title,
      type: tc.type,
      estimatedMinutes: tc.duration,
    })),
    progress: {
      masteryLevel: knowledgeState?.masteryLevel || 0,
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      accuracy: answeredQuestions > 0 ? correctAnswers / answeredQuestions : 0,
    },
  }
}

/**
 * Get user's learning paths
 */
export async function getUserLearningPaths() {
  const user = await getAuthenticatedUser()

  const learnerPaths = await prisma.learnerLearningPath.findMany({
    where: { userId: user.id },
    include: {
      learningPath: {
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
            include: {
              topic: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
    orderBy: [{ completedAt: "asc" }, { startedAt: "desc" }],
  })

  return learnerPaths.map((lp) => {
    // Use itemsCompleted and totalItems from LearnerLearningPath
    const totalItems = lp.totalItems
    const completedItems = lp.itemsCompleted

    // Get current item by index (based on how many are completed)
    const currentItem = lp.learningPath.items[completedItems]

    // Estimate hours based on items
    const estimatedHours = lp.learningPath.items.reduce(
      (sum, item) => sum + (item.estimatedHours || 0.5),
      0
    )

    return {
      id: lp.learningPath.id,
      name: lp.learningPath.name,
      description: lp.learningPath.description,
      type: lp.learningPath.isDefault ? "CURRICULUM" : "CUSTOM" as "CURRICULUM" | "REMEDIAL" | "ENRICHMENT" | "CUSTOM",
      totalItems,
      completedItems,
      currentItem: currentItem
        ? {
            id: currentItem.id,
            topicId: currentItem.topicId,
            topicName: currentItem.topic.name,
            sortOrder: currentItem.sortOrder,
            isCompleted: false,
          }
        : null,
      estimatedHours,
      startedAt: lp.startedAt,
    }
  })
}

/**
 * Start or continue a topic (creates/updates knowledge state)
 */
export async function startTopic(topicId: string) {
  const user = await getAuthenticatedUser()

  const knowledgeState = await prisma.learnerKnowledgeState.upsert({
    where: {
      userId_topicId: {
        userId: user.id,
        topicId,
      },
    },
    update: {
      lastUpdatedAt: new Date(),
    },
    create: {
      userId: user.id,
      topicId,
      masteryLevel: 0,
      pKnown: 0.3, // Initial BKT probability
    },
  })

  return knowledgeState
}
