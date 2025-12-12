-- CreateEnum
CREATE TYPE "StandardSystem" AS ENUM ('CCSS_MATH', 'CCSS_ELA', 'NGSS', 'IB_PYP', 'IB_MYP', 'IB_DP', 'CAMBRIDGE_PRIMARY', 'CAMBRIDGE_SECONDARY', 'CAMBRIDGE_IGCSE', 'UK_NATIONAL', 'AUSTRALIAN', 'SINGAPORE', 'ISTE', 'CSTA', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AlignmentStrength" AS ENUM ('PRIMARY', 'SECONDARY', 'PARTIAL', 'PREREQUISITE', 'EXTENSION');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('CHOICE', 'TEXT_ENTRY', 'INLINE_CHOICE', 'GAP_MATCH', 'MATCH', 'ORDER', 'HOTSPOT', 'EXTENDED_TEXT', 'COMPOSITE');

-- CreateEnum
CREATE TYPE "QuestionSource" AS ENUM ('OFFICIAL_PAPER', 'TEXTBOOK', 'AI_GENERATED', 'SYNTHESIZED', 'TEACHER_CREATED', 'COMMUNITY', 'IMPORTED');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('FOUNDATIONAL', 'DEVELOPING', 'PROFICIENT', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('VIDEO', 'ARTICLE', 'INTERACTIVE', 'WORKED_EXAMPLE', 'PRACTICE_SET', 'ASSESSMENT', 'GAME');

-- CreateEnum
CREATE TYPE "ScoringAlgorithm" AS ENUM ('SIMPLE', 'PARTIAL_CREDIT', 'GLICKO2', 'ELO', 'IRT_1PL', 'IRT_2PL', 'IRT_3PL', 'BKT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('FIXED_ASSESSMENT', 'PRACTICE_SET', 'QUIZ', 'ADAPTIVE_ASSESSMENT', 'DIAGNOSTIC', 'PLACEMENT', 'PUZZLE_STREAK', 'PUZZLE_STORM', 'PUZZLE_RACER', 'ENDLESS_PRACTICE', 'REVIEW_SESSION', 'FLASHCARD_DRILL', 'DUEL', 'TOURNAMENT', 'DAILY_CHALLENGE', 'GUIDED_LESSON', 'MASTERY_CHECK', 'CUSTOM');

-- CreateEnum
CREATE TYPE "QuestionSelectionStrategy" AS ENUM ('FIXED', 'RANDOM_FROM_POOL', 'ADAPTIVE_IRT', 'ADAPTIVE_GLICKO', 'ADAPTIVE_BKT', 'SPACED_REPETITION', 'DIFFICULTY_LADDER', 'SPIRAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TerminationCondition" AS ENUM ('FIXED_COUNT', 'TIME_LIMIT', 'ERROR_THRESHOLD', 'MASTERY_ACHIEVED', 'CONFIDENCE_INTERVAL', 'USER_QUIT', 'ALL_QUESTIONS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ABANDONED', 'TIMED_OUT');

-- CreateEnum
CREATE TYPE "AcademicTier" AS ENUM ('SEED', 'SPROUT', 'SAPLING', 'TREE', 'GROVE', 'FOREST', 'ANCIENT_FOREST');

-- CreateEnum
CREATE TYPE "EngagementLevel" AS ENUM ('NEWCOMER', 'LEARNER', 'SCHOLAR', 'DEDICATED', 'DEVOTED', 'EXPERT', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "DailyGoalType" AS ENUM ('QUESTIONS', 'MINUTES', 'SCORE');

-- CreateEnum
CREATE TYPE "StreakAction" AS ENUM ('ACTIVE', 'FREEZE_USED', 'SHIELD_USED', 'GRACE_RESTORED', 'GRACE_EXPIRED', 'STREAK_BROKEN', 'MILESTONE');

-- CreateEnum
CREATE TYPE "BadgeCategory" AS ENUM ('MASTERY', 'PROGRESS', 'STREAK', 'CHALLENGE', 'EXPLORATION', 'COMMUNITY', 'SPECIAL');

-- CreateEnum
CREATE TYPE "BadgeTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

-- CreateEnum
CREATE TYPE "BadgeRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('ACADEMIC', 'CHALLENGE', 'MILESTONE', 'COMMUNITY', 'SPECIAL');

-- CreateEnum
CREATE TYPE "AchievementDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "CosmeticType" AS ENUM ('BANNER', 'ICON', 'TITLE', 'PROFILE_FRAME', 'EFFECT');

-- CreateEnum
CREATE TYPE "CosmeticRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "UnlockMethod" AS ENUM ('TIER', 'BADGE', 'ACHIEVEMENT', 'XP', 'STREAK', 'SPECIAL', 'DEFAULT');

-- CreateEnum
CREATE TYPE "XpSource" AS ENUM ('QUESTION_ANSWERED', 'QUESTION_CORRECT', 'STREAK_DAY', 'STREAK_MILESTONE', 'BADGE_EARNED', 'ACHIEVEMENT_COMPLETED', 'CHALLENGE_COMPLETED', 'DAILY_CHALLENGE', 'MASTERY_UPGRADE', 'BONUS');

-- AlterTable
ALTER TABLE "account" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "verification" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "country" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject" (
    "id" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_level" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic" (
    "id" TEXT NOT NULL,
    "gradeLevelId" TEXT NOT NULL,
    "parentId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "learningGoals" TEXT[],
    "prerequisites" TEXT[],
    "estimatedHours" DOUBLE PRECISION,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "term_topic_mapping" (
    "id" TEXT NOT NULL,
    "gradeLevelId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "term" INTEGER NOT NULL,
    "weekStart" INTEGER NOT NULL,
    "weekEnd" INTEGER,
    "year" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "term_topic_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standard_framework" (
    "id" TEXT NOT NULL,
    "system" "StandardSystem" NOT NULL,
    "version" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "publisher" TEXT,
    "sourceUrl" TEXT,
    "country" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "standard_framework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_standard" (
    "id" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "parentId" TEXT,
    "code" TEXT NOT NULL,
    "shortCode" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "domain" TEXT,
    "cluster" TEXT,
    "gradeLevel" TEXT,
    "category" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_standard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standard_alignment" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "strength" "AlignmentStrength" NOT NULL DEFAULT 'PRIMARY',
    "coverage" DOUBLE PRECISION,
    "notes" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "standard_alignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "qtiXml" TEXT NOT NULL,
    "qtiVersion" TEXT NOT NULL DEFAULT '3.0',
    "qtiIdentifier" TEXT,
    "type" "QuestionType" NOT NULL,
    "title" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "correctAnswers" JSONB,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "source" "QuestionSource" NOT NULL,
    "sourceRef" TEXT,
    "difficultyLevel" "DifficultyLevel" NOT NULL DEFAULT 'PROFICIENT',
    "estimatedTime" INTEGER,
    "tags" TEXT[],
    "language" TEXT NOT NULL DEFAULT 'en',
    "hasImages" BOOLEAN NOT NULL DEFAULT false,
    "hasMath" BOOLEAN NOT NULL DEFAULT false,
    "hasAudio" BOOLEAN NOT NULL DEFAULT false,
    "accessibilityNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isReviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "parentQuestionId" TEXT,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_topic" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "relevance" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_revision" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "qtiXml" TEXT NOT NULL,
    "changedBy" TEXT,
    "changeNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutorial_content" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" JSONB NOT NULL,
    "duration" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutorial_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentGrade" INTEGER,
    "schoolId" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "dailyGoalMinutes" INTEGER NOT NULL DEFAULT 30,
    "totalQuestionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "totalCorrect" INTEGER NOT NULL DEFAULT 0,
    "totalTimeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learner_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_response" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "topicId" TEXT,
    "studySessionId" TEXT,
    "assessmentSessionId" TEXT,
    "response" JSONB NOT NULL,
    "responseText" TEXT,
    "isCorrect" BOOLEAN,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "partialCredit" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "timeToFirstAction" INTEGER,
    "activeTimeMs" INTEGER,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "hintsAvailable" INTEGER NOT NULL DEFAULT 0,
    "wasSkipped" BOOLEAN NOT NULL DEFAULT false,
    "wasRevealed" BOOLEAN NOT NULL DEFAULT false,
    "wasTimedOut" BOOLEAN NOT NULL DEFAULT false,
    "confidenceLevel" INTEGER,
    "perceivedDifficulty" INTEGER,
    "flaggedForReview" BOOLEAN NOT NULL DEFAULT false,
    "responseHistory" JSONB,
    "timesChanged" INTEGER NOT NULL DEFAULT 0,
    "finalAnswerTime" INTEGER,
    "interactionEvents" JSONB,
    "previousAttemptId" TEXT,
    "daysSinceLastAttempt" INTEGER,
    "totalPriorAttempts" INTEGER NOT NULL DEFAULT 0,
    "deviceType" TEXT,
    "screenSize" TEXT,
    "inputMethod" TEXT,
    "appVersion" TEXT,
    "browserInfo" TEXT,
    "localHour" INTEGER,
    "dayOfWeek" INTEGER,
    "sessionPosition" INTEGER,
    "learnerRatingBefore" DOUBLE PRECISION,
    "learnerRatingAfter" DOUBLE PRECISION,
    "learnerRDBefore" DOUBLE PRECISION,
    "learnerRDAfter" DOUBLE PRECISION,
    "questionRatingBefore" DOUBLE PRECISION,
    "questionRatingAfter" DOUBLE PRECISION,
    "questionRDBefore" DOUBLE PRECISION,
    "questionRDAfter" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response_score" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "algorithm" "ScoringAlgorithm" NOT NULL,
    "algorithmVersion" TEXT NOT NULL DEFAULT '1.0',
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION,
    "normalizedScore" DOUBLE PRECISION,
    "parameters" JSONB,
    "outputs" JSONB,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "response_score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_knowledge_state" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "pKnown" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "pLearn" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "pGuess" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "pSlip" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "masteryLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "masteryVariance" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "latentState" JSONB,
    "stateHistory" JSONB,
    "lastResponseId" TEXT,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learner_knowledge_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_template" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "assessmentType" "AssessmentType" NOT NULL,
    "selectionStrategy" "QuestionSelectionStrategy" NOT NULL,
    "terminationCondition" "TerminationCondition" NOT NULL,
    "topicIds" TEXT[],
    "difficultyRange" JSONB,
    "questionTypes" "QuestionType"[],
    "tags" TEXT[],
    "questionLimit" INTEGER,
    "timeLimitSeconds" INTEGER,
    "errorThreshold" INTEGER,
    "masteryThreshold" DOUBLE PRECISION,
    "confidenceThreshold" DOUBLE PRECISION,
    "startingDifficulty" DOUBLE PRECISION,
    "difficultyIncrement" DOUBLE PRECISION,
    "difficultyDecrement" DOUBLE PRECISION,
    "basePointsPerQuestion" INTEGER NOT NULL DEFAULT 10,
    "streakBonusMultiplier" DOUBLE PRECISION,
    "timeBonusEnabled" BOOLEAN NOT NULL DEFAULT false,
    "partialCreditEnabled" BOOLEAN NOT NULL DEFAULT true,
    "showFeedbackAfterEach" BOOLEAN NOT NULL DEFAULT true,
    "showCorrectAnswer" BOOLEAN NOT NULL DEFAULT true,
    "allowSkip" BOOLEAN NOT NULL DEFAULT false,
    "allowHints" BOOLEAN NOT NULL DEFAULT true,
    "shuffleQuestions" BOOLEAN NOT NULL DEFAULT true,
    "shuffleChoices" BOOLEAN NOT NULL DEFAULT true,
    "perQuestionTimeLimit" INTEGER,
    "showTimer" BOOLEAN NOT NULL DEFAULT true,
    "countdownWarning" INTEGER,
    "startingLives" INTEGER,
    "earnExtraLifeEvery" INTEGER,
    "isRanked" BOOLEAN NOT NULL DEFAULT false,
    "leaderboardEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dailyResetTime" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT,
    "assessmentType" "AssessmentType" NOT NULL,
    "selectionStrategy" "QuestionSelectionStrategy" NOT NULL,
    "terminationCondition" "TerminationCondition" NOT NULL,
    "config" JSONB,
    "topicIds" TEXT[],
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "totalTimeMs" INTEGER,
    "pausedTimeMs" INTEGER NOT NULL DEFAULT 0,
    "questionsAttempted" INTEGER NOT NULL DEFAULT 0,
    "questionsCorrect" INTEGER NOT NULL DEFAULT 0,
    "questionsSkipped" INTEGER NOT NULL DEFAULT 0,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxPossibleScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "streakBonusEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "livesRemaining" INTEGER,
    "livesUsed" INTEGER NOT NULL DEFAULT 0,
    "currentDifficulty" DOUBLE PRECISION,
    "difficultyHistory" JSONB,
    "estimatedAbility" DOUBLE PRECISION,
    "abilityStandardError" DOUBLE PRECISION,
    "terminationReason" TEXT,
    "finalRank" INTEGER,
    "percentile" DOUBLE PRECISION,
    "deviceType" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_question_order" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "targetDifficulty" DOUBLE PRECISION,
    "selectionReason" TEXT,
    "presentedAt" TIMESTAMP(3),
    "answeredAt" TIMESTAMP(3),
    "timeSpentMs" INTEGER,
    "wasAnswered" BOOLEAN NOT NULL DEFAULT false,
    "wasSkipped" BOOLEAN NOT NULL DEFAULT false,
    "wasCorrect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_question_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_challenge" (
    "id" TEXT NOT NULL,
    "challengeDate" DATE NOT NULL,
    "templateId" TEXT NOT NULL,
    "questionIds" TEXT[],
    "topScores" JSONB,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "totalCompletions" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_challenge_attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeDate" DATE NOT NULL,
    "templateId" TEXT NOT NULL,
    "sessionId" TEXT,
    "score" DOUBLE PRECISION NOT NULL,
    "timeMs" INTEGER NOT NULL,
    "questionsCorrect" INTEGER NOT NULL,
    "rank" INTEGER,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_challenge_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "topicIds" TEXT[],
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "totalTimeMs" INTEGER,
    "questionsAttempted" INTEGER NOT NULL DEFAULT 0,
    "questionsCorrect" INTEGER NOT NULL DEFAULT 0,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxPossibleScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "bonusPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deviceType" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "study_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_topic_rating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "ratingDeviation" DOUBLE PRECISION NOT NULL DEFAULT 350,
    "volatility" DOUBLE PRECISION NOT NULL DEFAULT 0.06,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "correctAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "ratingHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learner_topic_rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_rating" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "ratingDeviation" DOUBLE PRECISION NOT NULL DEFAULT 350,
    "volatility" DOUBLE PRECISION NOT NULL DEFAULT 0.06,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "correctAttempts" INTEGER NOT NULL DEFAULT 0,
    "discriminationIndex" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_path" (
    "id" TEXT NOT NULL,
    "gradeLevelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_path_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_path_item" (
    "id" TEXT NOT NULL,
    "learningPathId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "estimatedHours" DOUBLE PRECISION,
    "requiredMastery" DOUBLE PRECISION NOT NULL DEFAULT 0.7,

    CONSTRAINT "learning_path_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_learning_path" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "learningPathId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "currentItemId" TEXT,
    "itemsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalItems" INTEGER NOT NULL,

    CONSTRAINT "learner_learning_path_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_progression" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "academicTier" "AcademicTier" NOT NULL DEFAULT 'SEED',
    "academicRating" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "academicRatingHistory" JSONB,
    "engagementLevel" "EngagementLevel" NOT NULL DEFAULT 'NEWCOMER',
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "xpHistory" JSONB,
    "equippedBannerId" TEXT,
    "equippedIconId" TEXT,
    "equippedTitleId" TEXT,
    "featuredBadgeIds" TEXT[],
    "totalBadgesEarned" INTEGER NOT NULL DEFAULT 0,
    "totalAchievements" INTEGER NOT NULL DEFAULT 0,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learner_progression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_streak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "streakStartDate" TIMESTAMP(3),
    "lastActiveDate" TIMESTAMP(3),
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreakStart" TIMESTAMP(3),
    "longestStreakEnd" TIMESTAMP(3),
    "totalActiveDays" INTEGER NOT NULL DEFAULT 0,
    "streakFreezes" INTEGER NOT NULL DEFAULT 2,
    "streakShields" INTEGER NOT NULL DEFAULT 0,
    "graceExpiresAt" TIMESTAMP(3),
    "lastFreezeUsed" TIMESTAMP(3),
    "lastShieldEarned" TIMESTAMP(3),
    "dailyGoalType" "DailyGoalType" NOT NULL DEFAULT 'QUESTIONS',
    "dailyGoalTarget" INTEGER NOT NULL DEFAULT 10,
    "todayProgress" INTEGER NOT NULL DEFAULT 0,
    "todayGoalMet" BOOLEAN NOT NULL DEFAULT false,
    "todayDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learner_streak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streak_history_entry" (
    "id" TEXT NOT NULL,
    "streakId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "wasActive" BOOLEAN NOT NULL,
    "streakCount" INTEGER NOT NULL,
    "action" "StreakAction" NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "streak_history_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badge_definition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "category" "BadgeCategory" NOT NULL,
    "tier" "BadgeTier" NOT NULL,
    "rarity" "BadgeRarity" NOT NULL,
    "criteria" JSONB NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "unlocksTitle" TEXT,
    "unlocksBanner" TEXT,
    "unlocksIcon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badge_definition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_badge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contextData" JSONB,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "learner_badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_definition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "category" "AchievementCategory" NOT NULL,
    "difficulty" "AchievementDifficulty" NOT NULL,
    "criteria" JSONB NOT NULL,
    "hasProgress" BOOLEAN NOT NULL DEFAULT true,
    "progressMax" INTEGER,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "badgeReward" TEXT,
    "titleReward" TEXT,
    "bannerReward" TEXT,
    "iconReward" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievement_definition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_achievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "currentProgress" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "contextData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learner_achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cosmetic_item" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "previewUrl" TEXT,
    "assetUrl" TEXT,
    "type" "CosmeticType" NOT NULL,
    "rarity" "CosmeticRarity" NOT NULL,
    "unlockMethod" "UnlockMethod" NOT NULL,
    "unlockCriteria" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cosmetic_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_cosmetic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cosmeticId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "learner_cosmetic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" "XpSource" NOT NULL,
    "sourceId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "country_code_key" ON "country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_code_key" ON "curriculum"("code");

-- CreateIndex
CREATE UNIQUE INDEX "subject_curriculumId_code_key" ON "subject"("curriculumId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "grade_level_subjectId_grade_key" ON "grade_level"("subjectId", "grade");

-- CreateIndex
CREATE INDEX "topic_parentId_idx" ON "topic"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "topic_gradeLevelId_code_key" ON "topic"("gradeLevelId", "code");

-- CreateIndex
CREATE INDEX "term_topic_mapping_term_weekStart_idx" ON "term_topic_mapping"("term", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "term_topic_mapping_gradeLevelId_topicId_term_year_key" ON "term_topic_mapping"("gradeLevelId", "topicId", "term", "year");

-- CreateIndex
CREATE UNIQUE INDEX "standard_framework_system_version_key" ON "standard_framework"("system", "version");

-- CreateIndex
CREATE INDEX "external_standard_parentId_idx" ON "external_standard"("parentId");

-- CreateIndex
CREATE INDEX "external_standard_frameworkId_gradeLevel_idx" ON "external_standard"("frameworkId", "gradeLevel");

-- CreateIndex
CREATE INDEX "external_standard_code_idx" ON "external_standard"("code");

-- CreateIndex
CREATE UNIQUE INDEX "external_standard_frameworkId_code_key" ON "external_standard"("frameworkId", "code");

-- CreateIndex
CREATE INDEX "standard_alignment_standardId_idx" ON "standard_alignment"("standardId");

-- CreateIndex
CREATE INDEX "standard_alignment_topicId_idx" ON "standard_alignment"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "standard_alignment_topicId_standardId_key" ON "standard_alignment"("topicId", "standardId");

-- CreateIndex
CREATE UNIQUE INDEX "question_publicId_key" ON "question"("publicId");

-- CreateIndex
CREATE INDEX "question_type_idx" ON "question"("type");

-- CreateIndex
CREATE INDEX "question_source_idx" ON "question"("source");

-- CreateIndex
CREATE INDEX "question_difficultyLevel_idx" ON "question"("difficultyLevel");

-- CreateIndex
CREATE INDEX "question_isActive_isReviewed_idx" ON "question"("isActive", "isReviewed");

-- CreateIndex
CREATE INDEX "question_topic_topicId_idx" ON "question_topic"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "question_topic_questionId_topicId_key" ON "question_topic"("questionId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "question_revision_questionId_version_key" ON "question_revision"("questionId", "version");

-- CreateIndex
CREATE INDEX "tutorial_content_topicId_type_idx" ON "tutorial_content"("topicId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "learner_profile_userId_key" ON "learner_profile"("userId");

-- CreateIndex
CREATE INDEX "question_response_userId_questionId_idx" ON "question_response"("userId", "questionId");

-- CreateIndex
CREATE INDEX "question_response_userId_topicId_idx" ON "question_response"("userId", "topicId");

-- CreateIndex
CREATE INDEX "question_response_userId_createdAt_idx" ON "question_response"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "question_response_questionId_isCorrect_idx" ON "question_response"("questionId", "isCorrect");

-- CreateIndex
CREATE INDEX "question_response_studySessionId_idx" ON "question_response"("studySessionId");

-- CreateIndex
CREATE INDEX "question_response_assessmentSessionId_idx" ON "question_response"("assessmentSessionId");

-- CreateIndex
CREATE INDEX "question_response_topicId_createdAt_idx" ON "question_response"("topicId", "createdAt");

-- CreateIndex
CREATE INDEX "response_score_responseId_algorithm_idx" ON "response_score"("responseId", "algorithm");

-- CreateIndex
CREATE INDEX "response_score_algorithm_computedAt_idx" ON "response_score"("algorithm", "computedAt");

-- CreateIndex
CREATE UNIQUE INDEX "response_score_responseId_algorithm_algorithmVersion_isLate_key" ON "response_score"("responseId", "algorithm", "algorithmVersion", "isLatest");

-- CreateIndex
CREATE INDEX "learner_knowledge_state_topicId_masteryLevel_idx" ON "learner_knowledge_state"("topicId", "masteryLevel");

-- CreateIndex
CREATE UNIQUE INDEX "learner_knowledge_state_userId_topicId_key" ON "learner_knowledge_state"("userId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_template_code_key" ON "assessment_template"("code");

-- CreateIndex
CREATE INDEX "assessment_template_assessmentType_idx" ON "assessment_template"("assessmentType");

-- CreateIndex
CREATE INDEX "assessment_template_isActive_isPublic_idx" ON "assessment_template"("isActive", "isPublic");

-- CreateIndex
CREATE INDEX "assessment_session_userId_startedAt_idx" ON "assessment_session"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "assessment_session_userId_assessmentType_idx" ON "assessment_session"("userId", "assessmentType");

-- CreateIndex
CREATE INDEX "assessment_session_templateId_startedAt_idx" ON "assessment_session"("templateId", "startedAt");

-- CreateIndex
CREATE INDEX "assessment_session_status_idx" ON "assessment_session"("status");

-- CreateIndex
CREATE INDEX "assessment_question_order_questionId_idx" ON "assessment_question_order"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_question_order_sessionId_position_key" ON "assessment_question_order"("sessionId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_question_order_sessionId_questionId_key" ON "assessment_question_order"("sessionId", "questionId");

-- CreateIndex
CREATE INDEX "daily_challenge_challengeDate_idx" ON "daily_challenge"("challengeDate");

-- CreateIndex
CREATE UNIQUE INDEX "daily_challenge_challengeDate_templateId_key" ON "daily_challenge"("challengeDate", "templateId");

-- CreateIndex
CREATE INDEX "daily_challenge_attempt_challengeDate_score_idx" ON "daily_challenge_attempt"("challengeDate", "score");

-- CreateIndex
CREATE UNIQUE INDEX "daily_challenge_attempt_userId_challengeDate_templateId_key" ON "daily_challenge_attempt"("userId", "challengeDate", "templateId");

-- CreateIndex
CREATE INDEX "study_session_userId_startedAt_idx" ON "study_session"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "learner_topic_rating_topicId_rating_idx" ON "learner_topic_rating"("topicId", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "learner_topic_rating_userId_topicId_key" ON "learner_topic_rating"("userId", "topicId");

-- CreateIndex
CREATE INDEX "question_rating_topicId_rating_idx" ON "question_rating"("topicId", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "question_rating_questionId_topicId_key" ON "question_rating"("questionId", "topicId");

-- CreateIndex
CREATE INDEX "learning_path_item_learningPathId_sortOrder_idx" ON "learning_path_item"("learningPathId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "learning_path_item_learningPathId_topicId_key" ON "learning_path_item"("learningPathId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "learner_learning_path_userId_learningPathId_key" ON "learner_learning_path"("userId", "learningPathId");

-- CreateIndex
CREATE UNIQUE INDEX "learner_progression_userId_key" ON "learner_progression"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "learner_streak_userId_key" ON "learner_streak"("userId");

-- CreateIndex
CREATE INDEX "streak_history_entry_date_idx" ON "streak_history_entry"("date");

-- CreateIndex
CREATE UNIQUE INDEX "streak_history_entry_streakId_date_key" ON "streak_history_entry"("streakId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "badge_definition_code_key" ON "badge_definition"("code");

-- CreateIndex
CREATE INDEX "badge_definition_category_idx" ON "badge_definition"("category");

-- CreateIndex
CREATE INDEX "badge_definition_tier_idx" ON "badge_definition"("tier");

-- CreateIndex
CREATE INDEX "badge_definition_isActive_idx" ON "badge_definition"("isActive");

-- CreateIndex
CREATE INDEX "learner_badge_userId_earnedAt_idx" ON "learner_badge"("userId", "earnedAt");

-- CreateIndex
CREATE INDEX "learner_badge_badgeId_idx" ON "learner_badge"("badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "learner_badge_userId_badgeId_key" ON "learner_badge"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_definition_code_key" ON "achievement_definition"("code");

-- CreateIndex
CREATE INDEX "achievement_definition_category_idx" ON "achievement_definition"("category");

-- CreateIndex
CREATE INDEX "achievement_definition_isActive_idx" ON "achievement_definition"("isActive");

-- CreateIndex
CREATE INDEX "learner_achievement_userId_isCompleted_idx" ON "learner_achievement"("userId", "isCompleted");

-- CreateIndex
CREATE INDEX "learner_achievement_achievementId_idx" ON "learner_achievement"("achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "learner_achievement_userId_achievementId_key" ON "learner_achievement"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "cosmetic_item_code_key" ON "cosmetic_item"("code");

-- CreateIndex
CREATE INDEX "cosmetic_item_type_idx" ON "cosmetic_item"("type");

-- CreateIndex
CREATE INDEX "cosmetic_item_unlockMethod_idx" ON "cosmetic_item"("unlockMethod");

-- CreateIndex
CREATE INDEX "cosmetic_item_isActive_idx" ON "cosmetic_item"("isActive");

-- CreateIndex
CREATE INDEX "learner_cosmetic_userId_isEquipped_idx" ON "learner_cosmetic"("userId", "isEquipped");

-- CreateIndex
CREATE UNIQUE INDEX "learner_cosmetic_userId_cosmeticId_key" ON "learner_cosmetic"("userId", "cosmeticId");

-- CreateIndex
CREATE INDEX "xp_transaction_userId_createdAt_idx" ON "xp_transaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "xp_transaction_source_idx" ON "xp_transaction"("source");

-- AddForeignKey
ALTER TABLE "curriculum" ADD CONSTRAINT "curriculum_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject" ADD CONSTRAINT "subject_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "curriculum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_level" ADD CONSTRAINT "grade_level_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic" ADD CONSTRAINT "topic_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "grade_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic" ADD CONSTRAINT "topic_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "term_topic_mapping" ADD CONSTRAINT "term_topic_mapping_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "grade_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "term_topic_mapping" ADD CONSTRAINT "term_topic_mapping_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_standard" ADD CONSTRAINT "external_standard_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "standard_framework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_standard" ADD CONSTRAINT "external_standard_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "external_standard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standard_alignment" ADD CONSTRAINT "standard_alignment_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standard_alignment" ADD CONSTRAINT "standard_alignment_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "external_standard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_parentQuestionId_fkey" FOREIGN KEY ("parentQuestionId") REFERENCES "question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_topic" ADD CONSTRAINT "question_topic_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_topic" ADD CONSTRAINT "question_topic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_revision" ADD CONSTRAINT "question_revision_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorial_content" ADD CONSTRAINT "tutorial_content_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_profile" ADD CONSTRAINT "learner_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_response" ADD CONSTRAINT "question_response_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_response" ADD CONSTRAINT "question_response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_response" ADD CONSTRAINT "question_response_studySessionId_fkey" FOREIGN KEY ("studySessionId") REFERENCES "study_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_response" ADD CONSTRAINT "question_response_assessmentSessionId_fkey" FOREIGN KEY ("assessmentSessionId") REFERENCES "assessment_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_score" ADD CONSTRAINT "response_score_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "question_response"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_knowledge_state" ADD CONSTRAINT "learner_knowledge_state_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_session" ADD CONSTRAINT "assessment_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_session" ADD CONSTRAINT "assessment_session_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "assessment_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_question_order" ADD CONSTRAINT "assessment_question_order_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "assessment_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_question_order" ADD CONSTRAINT "assessment_question_order_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_session" ADD CONSTRAINT "study_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_topic_rating" ADD CONSTRAINT "learner_topic_rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_topic_rating" ADD CONSTRAINT "learner_topic_rating_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_rating" ADD CONSTRAINT "question_rating_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_path" ADD CONSTRAINT "learning_path_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "grade_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_path_item" ADD CONSTRAINT "learning_path_item_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "learning_path"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_path_item" ADD CONSTRAINT "learning_path_item_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_learning_path" ADD CONSTRAINT "learner_learning_path_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_learning_path" ADD CONSTRAINT "learner_learning_path_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "learning_path"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_progression" ADD CONSTRAINT "learner_progression_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_streak" ADD CONSTRAINT "learner_streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streak_history_entry" ADD CONSTRAINT "streak_history_entry_streakId_fkey" FOREIGN KEY ("streakId") REFERENCES "learner_streak"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_badge" ADD CONSTRAINT "learner_badge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_badge" ADD CONSTRAINT "learner_badge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badge_definition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_achievement" ADD CONSTRAINT "learner_achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_achievement" ADD CONSTRAINT "learner_achievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievement_definition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_cosmetic" ADD CONSTRAINT "learner_cosmetic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_cosmetic" ADD CONSTRAINT "learner_cosmetic_cosmeticId_fkey" FOREIGN KEY ("cosmeticId") REFERENCES "cosmetic_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_transaction" ADD CONSTRAINT "xp_transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
