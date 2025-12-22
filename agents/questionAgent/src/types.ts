import { z } from "zod";

// ============================================================================
// Database Schema Types (matching Prisma)
// ============================================================================

export const QuestionTypeEnum = z.enum([
    "CHOICE",
    "TEXT_ENTRY",
    "INLINE_CHOICE",
    "GAP_MATCH",
    "MATCH",
    "ORDER",
    "HOTSPOT",
    "EXTENDED_TEXT",
    "COMPOSITE",
]);
export type QuestionType = z.infer<typeof QuestionTypeEnum>;

export const QuestionSourceEnum = z.enum([
    "OFFICIAL_PAPER",
    "TEXTBOOK",
    "AI_GENERATED",
    "SYNTHESIZED",
    "TEACHER_CREATED",
    "COMMUNITY",
    "IMPORTED",
]);
export type QuestionSource = z.infer<typeof QuestionSourceEnum>;

export const DifficultyLevelEnum = z.enum([
    "FOUNDATIONAL",
    "DEVELOPING",
    "PROFICIENT",
    "ADVANCED",
    "EXPERT",
]);
export type DifficultyLevel = z.infer<typeof DifficultyLevelEnum>;

// ============================================================================
// Curriculum Hierarchy Types
// ============================================================================

export interface Country {
    id: string;
    code: string;
    name: string;
}

export interface Curriculum {
    id: string;
    countryId: string;
    code: string;
    name: string;
    description: string | null;
}

export interface Subject {
    id: string;
    curriculumId: string;
    code: string;
    name: string;
    description: string | null;
    curriculum?: Curriculum;
}

export interface GradeLevel {
    id: string;
    subjectId: string;
    grade: number;
    name: string;
    description: string | null;
    subject?: Subject;
}

export interface Topic {
    id: string;
    gradeLevelId: string;
    parentId: string | null;
    code: string;
    name: string;
    description: string | null;
    learningGoals: string[];
    prerequisites: string[];
    estimatedHours: number | null;
    sortOrder: number;
    isActive: boolean;
    gradeLevel?: GradeLevel;
    parent?: Topic | null;
    children?: Topic[];
}

// ============================================================================
// Question Types
// ============================================================================

export interface QuestionInput {
    type: QuestionType;
    title: string;
    questionText: string;
    qtiXml: string;
    correctAnswers: unknown;
    maxScore?: number;
    source: QuestionSource;
    sourceRef?: string;
    difficultyLevel: DifficultyLevel;
    estimatedTime?: number;
    tags?: string[];
    language?: string;
    hasImages?: boolean;
    hasMath?: boolean;
    topicIds: string[];
    primaryTopicId?: string;
}

export interface QuestionTopicInput {
    topicId: string;
    isPrimary?: boolean;
    relevance?: number;
}

// ============================================================================
// Agent Tool Schemas
// ============================================================================

export const ListSubjectsSchema = z.object({
    curriculumCode: z.string().optional().describe("Filter by curriculum code (e.g., 'CAPS')"),
});

export const ListTopicsSchema = z.object({
    subjectId: z.string().describe("Subject ID to list topics for"),
    gradeLevel: z.number().optional().describe("Filter by grade level (1-12)"),
    parentId: z.string().optional().describe("Filter by parent topic ID for subtopics"),
});

export const GetTopicDetailsSchema = z.object({
    topicId: z.string().describe("Topic ID to get details for"),
});

export const GenerateQuestionSchema = z.object({
    topicId: z.string().describe("Primary topic ID for the question"),
    difficultyLevel: DifficultyLevelEnum.describe("Difficulty level for the question"),
    questionType: QuestionTypeEnum.default("CHOICE").describe("Type of question to generate"),
    context: z.string().optional().describe("Additional context or requirements for the question"),
});

export const InsertQuestionSchema = z.object({
    qtiXml: z.string().describe("Complete QTI 3.0 XML for the question"),
    topicId: z.string().describe("Primary topic ID"),
    additionalTopicIds: z.array(z.string()).optional().describe("Additional topic IDs"),
    difficultyLevel: DifficultyLevelEnum.describe("Difficulty level"),
    tags: z.array(z.string()).optional().describe("Tags for categorization"),
});
