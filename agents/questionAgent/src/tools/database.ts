import { PrismaClient } from "@prisma/client";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const prisma = new PrismaClient();

// ============================================================================
// List Subjects Tool
// ============================================================================

export const listSubjectsTool = tool(
    async (input: string | undefined) => {
        const curriculumCode = input && input.toLowerCase() !== "all" && input.toLowerCase() !== "none" && input.trim() !== ""
            ? input.trim()
            : undefined;

        const subjects = await prisma.subject.findMany({
            where: curriculumCode
                ? { curriculum: { code: curriculumCode } }
                : undefined,
            include: {
                curriculum: {
                    include: {
                        country: true,
                    },
                },
                gradeLevels: {
                    select: {
                        id: true,
                        grade: true,
                        name: true,
                    },
                    orderBy: { grade: "asc" },
                },
            },
            orderBy: [
                { curriculum: { country: { name: "asc" } } },
                { curriculum: { code: "asc" } },
                { name: "asc" },
            ],
        });

        return JSON.stringify(
            subjects.map((s) => ({
                id: s.id,
                code: s.code,
                name: s.name,
                description: s.description,
                curriculum: {
                    code: s.curriculum.code,
                    name: s.curriculum.name,
                    country: s.curriculum.country.name,
                },
                gradeLevels: s.gradeLevels,
            })),
            null,
            2
        );
    },
    {
        name: "list_subjects",
        description: "List all subjects in the database. Input should be a curriculum code like 'CAPS' to filter, or 'all' to list all subjects.",
        schema: z.string().optional().describe("Curriculum code or 'all'"),
    }
);

// ============================================================================
// List Topics Tool
// ============================================================================

export const listTopicsTool = tool(
    async (input: string) => {
        const parts = input.split(",").map((p) => p.trim());
        const subjectId = parts[0];
        const gradeLevel = parts[1] ? parseInt(parts[1], 10) : undefined;

        if (!subjectId || subjectId.toLowerCase() === "none") {
            return JSON.stringify({ error: "subjectId is required" });
        }

        let gradeLevelId: string | undefined;
        if (gradeLevel !== undefined && !isNaN(gradeLevel)) {
            const gl = await prisma.gradeLevel.findFirst({
                where: {
                    subjectId,
                    grade: gradeLevel,
                },
            });
            if (!gl) {
                return JSON.stringify({
                    error: `Grade level ${gradeLevel} not found for subject ${subjectId}`,
                });
            }
            gradeLevelId = gl.id;
        }

        const topics = await prisma.topic.findMany({
            where: {
                gradeLevel: {
                    subjectId,
                    ...(gradeLevelId ? { id: gradeLevelId } : {}),
                },
                isActive: true,
            },
            include: {
                gradeLevel: {
                    select: {
                        grade: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        children: true,
                        questionTopics: true,
                    },
                },
            },
            orderBy: [
                { gradeLevel: { grade: "asc" } },
                { sortOrder: "asc" },
                { name: "asc" },
            ],
        });

        return JSON.stringify(
            topics.map((t) => ({
                id: t.id,
                code: t.code,
                name: t.name,
                description: t.description,
                gradeLevel: t.gradeLevel.grade,
                gradeName: t.gradeLevel.name,
                parentId: t.parentId,
                learningGoals: t.learningGoals,
                prerequisites: t.prerequisites,
                estimatedHours: t.estimatedHours,
                childTopicsCount: t._count.children,
                questionsCount: t._count.questionTopics,
            })),
            null,
            2
        );
    },
    {
        name: "list_topics",
        description: "List topics for a subject. Input should be a string in format: 'subjectId' or 'subjectId,gradeLevel' (e.g., 'abc123' or 'abc123,4').",
        schema: z.string().describe("subjectId or subjectId,gradeLevel"),
    }
);

// ============================================================================
// Get Topic Details Tool
// ============================================================================

export const getTopicDetailsTool = tool(
    async (topicId: string) => {
        if (!topicId || topicId.toLowerCase() === "none") {
            return JSON.stringify({ error: "topicId is required" });
        }

        const topic = await prisma.topic.findUnique({
            where: { id: topicId.trim() },
            include: {
                gradeLevel: {
                    include: {
                        subject: {
                            include: {
                                curriculum: {
                                    include: {
                                        country: true,
                                    },
                                },
                            },
                        },
                    },
                },
                parent: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                children: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        sortOrder: true,
                    },
                    orderBy: { sortOrder: "asc" },
                },
                _count: {
                    select: {
                        questionTopics: true,
                    },
                },
            },
        });

        if (!topic) {
            return JSON.stringify({ error: `Topic ${topicId} not found` });
        }

        return JSON.stringify(
            {
                id: topic.id,
                code: topic.code,
                name: topic.name,
                description: topic.description,
                learningGoals: topic.learningGoals,
                prerequisites: topic.prerequisites,
                estimatedHours: topic.estimatedHours,
                hierarchy: {
                    country: topic.gradeLevel.subject.curriculum.country.name,
                    curriculum: topic.gradeLevel.subject.curriculum.name,
                    subject: topic.gradeLevel.subject.name,
                    gradeLevel: topic.gradeLevel.grade,
                    gradeName: topic.gradeLevel.name,
                },
                parent: topic.parent,
                children: topic.children,
                questionsCount: topic._count.questionTopics,
            },
            null,
            2
        );
    },
    {
        name: "get_topic_details",
        description: "Get detailed information about a specific topic. Input should be the topicId string.",
        schema: z.string().describe("topicId"),
    }
);

// ============================================================================
// Insert Question Tool
// ============================================================================

export const insertQuestionTool = tool(
    async (input: string) => {
        // Strip markdown code blocks from the input string if present
        const cleanInput = input.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

        let parsed;
        try {
            parsed = JSON.parse(cleanInput);
        } catch {
            return JSON.stringify({ error: "Invalid JSON input. Expected: {qtiXml, topicId, difficultyLevel}" });
        }

        const { qtiXml, topicId, difficultyLevel, tags, additionalTopicIds } = parsed;

        if (!qtiXml || !topicId || !difficultyLevel) {
            return JSON.stringify({ error: "Missing required fields: qtiXml, topicId, difficultyLevel" });
        }

        // Strip markdown from the qtiXml field itself, just in case
        const cleanQtiXml = qtiXml.replace(/^```xml\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

        // Validate the topic exists
        const topic = await prisma.topic.findUnique({
            where: { id: topicId },
            include: {
                gradeLevel: {
                    include: {
                        subject: true,
                    },
                },
            },
        });

        if (!topic) {
            return JSON.stringify({ error: `Topic ${topicId} not found` });
        }

        // Extract question text and title from QTI XML
        const titleMatch = cleanQtiXml.match(/title="([^"]+)"/);
        const title = titleMatch?.[1] || `Question for ${topic.name}`;

        const bodyMatch = cleanQtiXml.match(/<qti-item-body[^>]*>([\s\S]*?)<\/qti-item-body>/);
        let questionText = "";
        if (bodyMatch) {
            questionText = bodyMatch[1]
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        }

        // Detect question type
        let questionType: "CHOICE" | "TEXT_ENTRY" | "INLINE_CHOICE" = "CHOICE";
        if (cleanQtiXml.includes("qti-text-entry-interaction")) {
            questionType = "TEXT_ENTRY";
        } else if (cleanQtiXml.includes("qti-inline-choice-interaction")) {
            questionType = "INLINE_CHOICE";
        }

        const hasMath = cleanQtiXml.includes("<math") || cleanQtiXml.includes("\\(") || cleanQtiXml.includes("\\[");

        const correctAnswerMatch = cleanQtiXml.match(/<qti-correct-response>\s*<qti-value>([^<]+)<\/qti-value>\s*<\/qti-correct-response>/);
        const correctAnswers = correctAnswerMatch ? [correctAnswerMatch[1]] : undefined;

        const question = await prisma.question.create({
            data: {
                qtiXml: cleanQtiXml,
                qtiVersion: "3.0",
                type: questionType,
                title,
                questionText,
                correctAnswers,
                maxScore: 1.0,
                source: "AI_GENERATED",
                difficultyLevel,
                tags: tags || [],
                language: "en",
                hasMath,
                hasImages: cleanQtiXml.includes("<img") || cleanQtiXml.includes("<object"),
                isActive: true,
                isReviewed: false,
                topics: {
                    create: [
                        { topicId, isPrimary: true, relevance: 1.0 },
                        ...(additionalTopicIds || []).map((tid: string) => ({
                            topicId: tid,
                            isPrimary: false,
                            relevance: 0.8,
                        })),
                    ],
                },
            },
        });

        const createdTopics = await prisma.questionTopic.findMany({
            where: { questionId: question.id },
            include: {
                topic: {
                    select: { id: true, code: true, name: true },
                },
            },
        });

        return JSON.stringify(
            {
                success: true,
                questionId: question.id,
                publicId: question.publicId,
                title: question.title,
                type: question.type,
                difficultyLevel: question.difficultyLevel,
                topics: createdTopics.map((qt) => ({
                    topicId: qt.topic.id,
                    topicCode: qt.topic.code,
                    topicName: qt.topic.name,
                    isPrimary: qt.isPrimary,
                })),
            },
            null,
            2
        );
    },
    {
        name: "insert_question",
        description: "Insert a QTI question into the database. Input should be a valid JSON string containing: {qtiXml, topicId, difficultyLevel, tags?}",
        schema: z.string().describe("JSON string with question data"),
    }
);

// Export all tools as an array
export const databaseTools = [
    listSubjectsTool,
    listTopicsTool,
    getTopicDetailsTool,
    insertQuestionTool,
];
