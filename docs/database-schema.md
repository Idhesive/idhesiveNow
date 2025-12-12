# Database Schema Documentation

This document describes the database schema for the Idhesive Intelligent Tutoring System (ITS). The schema is designed to support:

- Multi-curriculum content management (CAPS, CCSS, IB, etc.)
- QTI 3.0 question storage with rich metadata
- Learner analytics with xAPI-inspired response tracking
- Adaptive learning with Glicko-2 rating system
- Extensible scoring algorithms (ELO, IRT, BKT, etc.)
- Machine learning feature extraction
- Flexible assessment types (fixed, adaptive, streaming, competitive)

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Curriculum Structure](#curriculum-structure)
3. [External Educational Standards](#external-educational-standards)
4. [Question Bank](#question-bank)
5. [Assessment Types](#assessment-types)
6. [Learner Tracking](#learner-tracking)
7. [Adaptive Learning & Ratings](#adaptive-learning--ratings)
8. [Scoring Systems](#scoring-systems)
9. [Common Queries](#common-queries)
10. [Extending the Schema](#extending-the-schema)

---

## Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CURRICULUM STRUCTURE                               │
│  Country → Curriculum → Subject → GradeLevel → Topic → Subtopic             │
│                                      ↓                                       │
│                            TermTopicMapping (Term/Week schedule)             │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             QUESTION BANK                                    │
│  Question (QTI XML + metadata) ←→ QuestionTopic (many-to-many)              │
│       ↓                                                                      │
│  QuestionRevision (audit trail)                                             │
│  QuestionRating (Glicko-2 difficulty per topic)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LEARNER TRACKING                                   │
│  User → LearnerProfile (preferences, aggregated stats)                      │
│    ↓                                                                         │
│  StudySession → QuestionResponse (rich xAPI data)                           │
│                        ↓                                                     │
│                 ResponseScore (multiple scoring algorithms)                  │
│                                                                              │
│  LearnerTopicRating (Glicko-2 ability per topic)                            │
│  LearnerKnowledgeState (BKT / neural model state)                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Model Count by Domain

| Domain | Models | Purpose |
|--------|--------|---------|
| Auth | 4 | User, Session, Account, Verification (BetterAuth) |
| Curriculum | 6 | Country, Curriculum, Subject, GradeLevel, Topic, TermTopicMapping |
| Standards | 3 | StandardFramework, ExternalStandard, StandardAlignment |
| Questions | 4 | Question, QuestionTopic, QuestionRevision, QuestionRating |
| Content | 1 | TutorialContent |
| Assessments | 5 | AssessmentTemplate, AssessmentSession, AssessmentQuestionOrder, DailyChallenge, DailyChallengeAttempt |
| Learner | 6 | LearnerProfile, QuestionResponse, ResponseScore, StudySession, LearnerTopicRating, LearnerKnowledgeState |
| Paths | 3 | LearningPath, LearningPathItem, LearnerLearningPath |

---

## Curriculum Structure

### Hierarchy

```
Country (e.g., South Africa)
  └── Curriculum (e.g., CAPS)
        └── Subject (e.g., Mathematics)
              └── GradeLevel (e.g., Grade 4)
                    └── Topic (e.g., Fractions)
                          └── Topic (subtopic: Adding fractions)
```

### Key Models

#### Country
```prisma
model Country {
  id        String   @id @default(uuid())
  code      String   @unique  // ISO 3166-1: "ZA", "US"
  name      String             // "South Africa"
  curricula Curriculum[]
}
```

#### Topic (Self-referencing for hierarchy)
```prisma
model Topic {
  id           String     @id
  gradeLevelId String
  parentId     String?    // For subtopics
  parent       Topic?     @relation("TopicHierarchy", ...)
  children     Topic[]    @relation("TopicHierarchy")

  code           String   // "FRAC-001"
  name           String   // "Fractions"
  learningGoals  String[] // Array of objectives
  prerequisites  String[] // Topic codes required first
  estimatedHours Float?
}
```

#### TermTopicMapping (Academic Calendar)

Maps topics to when they should be taught:

```prisma
model TermTopicMapping {
  gradeLevelId String
  topicId      String
  term         Int    // 1-4 for SA
  weekStart    Int    // Week 1-10
  weekEnd      Int?   // If spans multiple weeks
  year         Int?   // null = every year
}
```

### Example: Setting Up CAPS Grade 4 Math

```typescript
// 1. Create country and curriculum
const za = await prisma.country.create({
  data: { code: 'ZA', name: 'South Africa' }
});

const caps = await prisma.curriculum.create({
  data: {
    countryId: za.id,
    code: 'CAPS',
    name: 'Curriculum and Assessment Policy Statement',
    version: '2011'
  }
});

// 2. Create subject and grade
const math = await prisma.subject.create({
  data: {
    curriculumId: caps.id,
    code: 'MATH',
    name: 'Mathematics',
    color: '#3B82F6'
  }
});

const grade4Math = await prisma.gradeLevel.create({
  data: {
    subjectId: math.id,
    grade: 4,
    name: 'Grade 4'
  }
});

// 3. Create topics with hierarchy
const fractions = await prisma.topic.create({
  data: {
    gradeLevelId: grade4Math.id,
    code: 'FRAC-001',
    name: 'Fractions',
    learningGoals: [
      'Understand fraction notation',
      'Compare fractions with same denominator'
    ],
    estimatedHours: 8
  }
});

// Subtopic
const addingFractions = await prisma.topic.create({
  data: {
    gradeLevelId: grade4Math.id,
    parentId: fractions.id,
    code: 'FRAC-001-ADD',
    name: 'Adding Fractions',
    prerequisites: ['FRAC-001']
  }
});

// 4. Map to academic calendar
await prisma.termTopicMapping.create({
  data: {
    gradeLevelId: grade4Math.id,
    topicId: fractions.id,
    term: 2,
    weekStart: 3,
    weekEnd: 4
  }
});
```

---

## External Educational Standards

The schema supports mapping internal topics to external educational standards, enabling cross-curriculum alignment and international compatibility.

### Supported Standard Systems

```prisma
enum StandardSystem {
  // United States
  CCSS_MATH       // Common Core State Standards - Mathematics
  CCSS_ELA        // Common Core State Standards - English Language Arts
  NGSS            // Next Generation Science Standards

  // International
  IB_PYP          // International Baccalaureate - Primary Years Programme
  IB_MYP          // International Baccalaureate - Middle Years Programme
  IB_DP           // International Baccalaureate - Diploma Programme
  CAMBRIDGE_PRIMARY    // Cambridge International - Primary
  CAMBRIDGE_SECONDARY  // Cambridge International - Secondary
  CAMBRIDGE_IGCSE     // Cambridge International - IGCSE

  // Regional
  UK_NATIONAL     // UK National Curriculum
  AUSTRALIAN      // Australian Curriculum
  SINGAPORE       // Singapore Curriculum Framework

  // Technology/Digital Literacy
  ISTE            // International Society for Technology in Education
  CSTA            // Computer Science Teachers Association

  // Other
  CUSTOM          // User-defined standard system
}
```

### Key Models

#### StandardFramework

Defines a standards framework with versioning:

```prisma
model StandardFramework {
  id          String         @id @default(uuid())
  system      StandardSystem // CCSS_MATH, NGSS, etc.
  version     String         // "2024", "v1.1"
  name        String         // "Common Core State Standards for Mathematics"
  description String?
  publisher   String?        // "National Governors Association"
  sourceUrl   String?        // Official documentation URL
  country     String?        // ISO country code
  isActive    Boolean        @default(true)

  standards ExternalStandard[]

  @@unique([system, version])
}
```

#### ExternalStandard

Individual standard codes with hierarchical support:

```prisma
model ExternalStandard {
  id           String            @id
  frameworkId  String
  parentId     String?           // For hierarchical standards
  parent       ExternalStandard? @relation("StandardHierarchy")
  children     ExternalStandard[] @relation("StandardHierarchy")

  // Standard identifier
  code         String  // "CCSS.MATH.CONTENT.4.NF.A.1" or "4-PS3-1"
  shortCode    String? // "4.NF.A.1"

  // Human-readable content
  title        String  // "Add and subtract fractions with like denominators"
  description  String?

  // Classification
  domain       String? // "Number & Operations—Fractions"
  cluster      String? // "Extend understanding of fraction equivalence"
  gradeLevel   String? // "4", "K-2", "HS"
  category     String? // For further grouping

  alignments StandardAlignment[]

  @@unique([frameworkId, code])
}
```

#### StandardAlignment

Maps topics to external standards (many-to-many):

```prisma
enum AlignmentStrength {
  PRIMARY      // Direct alignment - the topic teaches this standard
  SECONDARY    // Secondary - the topic supports this standard
  PARTIAL      // Only some aspects covered
  PREREQUISITE // Topic is a prerequisite for the standard
  EXTENSION    // Topic extends beyond the standard
}

model StandardAlignment {
  id          String @id
  topicId     String
  standardId  String

  strength    AlignmentStrength @default(PRIMARY)
  coverage    Float?    // 0-1, percentage of standard covered
  notes       String?   // Explanation of alignment
  verifiedBy  String?   // User who verified
  verifiedAt  DateTime?

  @@unique([topicId, standardId])
}
```

### Standard Code Formats

Different standards use different coding schemes:

| Standard | Format | Example |
|----------|--------|---------|
| Common Core Math | `CCSS.MATH.CONTENT.{grade}.{domain}.{cluster}.{standard}` | `CCSS.MATH.CONTENT.4.NF.A.1` |
| Common Core ELA | `CCSS.ELA-LITERACY.{strand}.{grade}.{standard}` | `CCSS.ELA-LITERACY.RL.4.1` |
| NGSS | `{grade}-{discipline}{topic}-{number}` | `4-PS3-1` |
| ISTE | `{category}.{number}.{letter}` | `1.1.a` |
| Australian | `{subject}{year}{strand}{code}` | `ACMNA073` |
| UK National | `{subject}-{ks}{strand}-{code}` | `MA-KS2-NF-1` |

### Example: Setting Up Common Core Alignment

```typescript
// 1. Create the framework
const ccss = await prisma.standardFramework.create({
  data: {
    system: 'CCSS_MATH',
    version: '2010',
    name: 'Common Core State Standards for Mathematics',
    publisher: 'National Governors Association & CCSSO',
    sourceUrl: 'http://www.corestandards.org/Math/',
    country: 'US'
  }
});

// 2. Create domain (parent standard)
const nfDomain = await prisma.externalStandard.create({
  data: {
    frameworkId: ccss.id,
    code: 'CCSS.MATH.CONTENT.4.NF',
    title: 'Number & Operations—Fractions',
    gradeLevel: '4',
    domain: 'Number & Operations—Fractions'
  }
});

// 3. Create cluster (intermediate level)
const nfClusterA = await prisma.externalStandard.create({
  data: {
    frameworkId: ccss.id,
    parentId: nfDomain.id,
    code: 'CCSS.MATH.CONTENT.4.NF.A',
    shortCode: '4.NF.A',
    title: 'Extend understanding of fraction equivalence and ordering',
    gradeLevel: '4',
    domain: 'Number & Operations—Fractions',
    cluster: 'A'
  }
});

// 4. Create individual standards
const standard1 = await prisma.externalStandard.create({
  data: {
    frameworkId: ccss.id,
    parentId: nfClusterA.id,
    code: 'CCSS.MATH.CONTENT.4.NF.A.1',
    shortCode: '4.NF.A.1',
    title: 'Explain why a fraction a/b is equivalent to a fraction (n × a)/(n × b)',
    description: 'Explain why a fraction a/b is equivalent to a fraction (n × a)/(n × b) by using visual fraction models, with attention to how the number and size of the parts differ even though the two fractions themselves are the same size. Use this principle to recognize and generate equivalent fractions.',
    gradeLevel: '4',
    domain: 'Number & Operations—Fractions',
    cluster: 'A'
  }
});

// 5. Align CAPS topic to Common Core standard
await prisma.standardAlignment.create({
  data: {
    topicId: capsFractionsTopicId, // Your CAPS Grade 4 Fractions topic
    standardId: standard1.id,
    strength: 'PRIMARY',
    coverage: 0.9, // 90% coverage
    notes: 'CAPS covers equivalent fractions in Term 2, closely aligned with CCSS 4.NF.A.1',
    verifiedBy: 'curriculum_specialist@school.edu',
    verifiedAt: new Date()
  }
});
```

### Example: NGSS Science Standards

```typescript
// Create NGSS framework
const ngss = await prisma.standardFramework.create({
  data: {
    system: 'NGSS',
    version: '2013',
    name: 'Next Generation Science Standards',
    publisher: 'NGSS Lead States',
    sourceUrl: 'https://www.nextgenscience.org/',
    country: 'US'
  }
});

// Create a performance expectation
const pe = await prisma.externalStandard.create({
  data: {
    frameworkId: ngss.id,
    code: '4-PS3-1',
    title: 'Use evidence to construct an explanation relating speed to energy',
    description: 'Use evidence to construct an explanation relating the speed of an object to the energy of that object.',
    gradeLevel: '4',
    domain: 'Physical Sciences',
    category: 'Energy',
    metadata: {
      scienceAndEngineeringPractice: 'Constructing Explanations',
      disciplinaryCoreIdea: 'PS3.A: Definitions of Energy',
      crosscuttingConcept: 'Energy and Matter'
    }
  }
});
```

### Common Queries for Standards

#### Find All Standards Aligned to a Topic

```typescript
async function getTopicAlignments(topicId: string) {
  return prisma.standardAlignment.findMany({
    where: { topicId },
    include: {
      standard: {
        include: {
          framework: true,
          parent: true
        }
      }
    }
  });
}
```

#### Find Topics by Common Core Standard

```typescript
async function findTopicsByStandard(standardCode: string) {
  const standard = await prisma.externalStandard.findFirst({
    where: { code: standardCode },
    include: {
      alignments: {
        include: {
          topic: {
            include: {
              gradeLevel: {
                include: {
                  subject: {
                    include: { curriculum: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  return standard?.alignments.map(a => ({
    topic: a.topic,
    strength: a.strength,
    coverage: a.coverage,
    curriculum: a.topic.gradeLevel.subject.curriculum.name
  }));
}
```

#### Get Coverage Report for a Curriculum

```typescript
async function getCurriculumStandardsCoverage(
  curriculumId: string,
  standardSystem: StandardSystem
) {
  // Get all topics in the curriculum
  const topics = await prisma.topic.findMany({
    where: {
      gradeLevel: {
        subject: { curriculumId }
      }
    },
    include: {
      standardAlignments: {
        include: {
          standard: {
            include: { framework: true }
          }
        },
        where: {
          standard: {
            framework: { system: standardSystem }
          }
        }
      }
    }
  });

  // Get all standards in the framework
  const framework = await prisma.standardFramework.findFirst({
    where: { system: standardSystem, isActive: true },
    include: { standards: true }
  });

  const alignedStandardIds = new Set(
    topics.flatMap(t =>
      t.standardAlignments.map(a => a.standardId)
    )
  );

  const totalStandards = framework?.standards.length ?? 0;
  const coveredStandards = alignedStandardIds.size;

  return {
    curriculum: curriculumId,
    standardSystem,
    totalStandards,
    coveredStandards,
    coveragePercentage: (coveredStandards / totalStandards) * 100,
    uncoveredStandards: framework?.standards.filter(
      s => !alignedStandardIds.has(s.id)
    )
  };
}
```

#### Bulk Import Standards from JSON

```typescript
async function importStandardsFromJson(
  frameworkId: string,
  standards: Array<{
    code: string;
    title: string;
    description?: string;
    gradeLevel?: string;
    domain?: string;
    parentCode?: string;
  }>
) {
  // First pass: create all standards without parent links
  const standardMap = new Map<string, string>();

  for (const s of standards) {
    const created = await prisma.externalStandard.create({
      data: {
        frameworkId,
        code: s.code,
        title: s.title,
        description: s.description,
        gradeLevel: s.gradeLevel,
        domain: s.domain
      }
    });
    standardMap.set(s.code, created.id);
  }

  // Second pass: link parents
  for (const s of standards) {
    if (s.parentCode && standardMap.has(s.parentCode)) {
      await prisma.externalStandard.update({
        where: { id: standardMap.get(s.code)! },
        data: { parentId: standardMap.get(s.parentCode) }
      });
    }
  }

  return standardMap.size;
}
```

### Best Practices for Standards Alignment

1. **Start with primary alignments** - Focus on direct, primary alignments first
2. **Use coverage percentages** - Indicate how much of a standard is covered (0.0-1.0)
3. **Document partial alignments** - Use notes to explain what aspects are/aren't covered
4. **Verify alignments** - Track who verified alignments and when
5. **Link hierarchically** - Use parent-child relationships for standard codes
6. **Import official data** - Many standards bodies provide machine-readable formats

---

## Question Bank

### Question Model

Questions store QTI 3.0 XML as the canonical format, with extracted metadata for searching:

```prisma
model Question {
  // Identity
  id        String @id @default(uuid())
  publicId  String @unique @default(cuid())  // URL-safe

  // QTI Content
  qtiXml        String  // Full QTI 3.0 XML
  qtiVersion    String  @default("3.0")
  qtiIdentifier String? // From XML

  // Searchable Metadata (extracted from QTI)
  type           QuestionType    // CHOICE, TEXT_ENTRY, etc.
  title          String
  questionText   String          // Plain text for search
  correctAnswers Json?           // For auto-scoring
  maxScore       Float @default(1.0)

  // Classification
  source          QuestionSource  // OFFICIAL_PAPER, AI_GENERATED, etc.
  sourceRef       String?         // Paper code, URL
  difficultyLevel DifficultyLevel // FOUNDATIONAL → EXPERT
  estimatedTime   Int?            // Seconds

  // Tags & filtering
  tags       String[]  // ["algebra", "word-problem"]
  language   String    @default("en")
  hasImages  Boolean   @default(false)
  hasMath    Boolean   @default(false)

  // Relationships
  topics    QuestionTopic[]  // Many-to-many with topics
  responses QuestionResponse[]
  ratings   QuestionRating[]
}
```

### Question Types (QTI 3.0)

```prisma
enum QuestionType {
  CHOICE         // Single/Multiple choice (qti-choice-interaction)
  TEXT_ENTRY     // Free text (qti-text-entry-interaction)
  INLINE_CHOICE  // Dropdown (qti-inline-choice-interaction)
  GAP_MATCH      // Drag-drop matching
  MATCH          // Match items
  ORDER          // Order items
  HOTSPOT        // Click on image
  EXTENDED_TEXT  // Long form
  COMPOSITE      // Parent with sub-questions
}
```

### Cross-Grade Question Reuse

Questions can belong to multiple topics via `QuestionTopic`:

```prisma
model QuestionTopic {
  questionId String
  topicId    String
  isPrimary  Boolean @default(false)  // Primary topic
  relevance  Float   @default(1.0)    // 0-1 relevance score
}
```

### Example: Creating a Question

```typescript
// Create a multiple choice question
const question = await prisma.question.create({
  data: {
    qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                      identifier="frac-add-001"
                      title="Adding Fractions"
                      adaptive="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>B</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-item-body>
    <p>What is 1/4 + 2/4?</p>
    <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
      <qti-simple-choice identifier="A">2/4</qti-simple-choice>
      <qti-simple-choice identifier="B">3/4</qti-simple-choice>
      <qti-simple-choice identifier="C">3/8</qti-simple-choice>
      <qti-simple-choice identifier="D">1/2</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`,
    type: 'CHOICE',
    title: 'Adding Fractions with Same Denominator',
    questionText: 'What is 1/4 + 2/4?',
    correctAnswers: { RESPONSE: 'B' },
    source: 'TEACHER_CREATED',
    difficultyLevel: 'PROFICIENT',
    estimatedTime: 30,
    tags: ['fractions', 'addition', 'same-denominator'],
    hasMath: true,

    // Link to multiple topics (Grade 4 and Grade 5 fractions)
    topics: {
      create: [
        { topicId: grade4FractionsId, isPrimary: true, relevance: 1.0 },
        { topicId: grade5FractionsId, isPrimary: false, relevance: 0.8 }
      ]
    }
  }
});
```

---

## Assessment Types

The schema supports a flexible assessment system that can accommodate various learning modes, from traditional fixed tests to adaptive assessments and streaming puzzle modes.

### Assessment Type Categories

```prisma
enum AssessmentType {
  // Fixed question sets
  FIXED_ASSESSMENT      // Traditional test with predetermined questions
  PRACTICE_SET          // Practice mode with fixed questions, no time pressure
  QUIZ                  // Short quiz, typically 5-10 questions

  // Adaptive assessments
  ADAPTIVE_ASSESSMENT   // CAT-style adaptive testing
  DIAGNOSTIC            // Diagnostic assessment to identify gaps
  PLACEMENT             // Placement test to determine starting level

  // Streaming/Continuous modes
  PUZZLE_STREAK         // Lichess-style: increasingly difficult until X errors
  PUZZLE_STORM          // Time-based: as many as possible in time limit
  PUZZLE_RACER          // Race format: fixed questions, fastest time wins
  ENDLESS_PRACTICE      // Infinite practice, no end condition

  // Spaced repetition
  REVIEW_SESSION        // Spaced repetition review of due items
  FLASHCARD_DRILL       // Flashcard-style quick recall

  // Competitive/Social
  DUEL                  // 1v1 real-time competition
  TOURNAMENT            // Multi-round tournament format
  DAILY_CHALLENGE       // Daily puzzle/challenge (same for all users)

  // Learning-focused
  GUIDED_LESSON         // Tutorial with embedded questions
  MASTERY_CHECK         // Check if topic is mastered before advancing

  // Custom
  CUSTOM                // User-defined assessment type
}
```

### Question Selection Strategies

```prisma
enum QuestionSelectionStrategy {
  FIXED                 // Predetermined question set
  RANDOM_FROM_POOL      // Random selection from question pool
  ADAPTIVE_IRT          // IRT-based adaptive selection
  ADAPTIVE_GLICKO       // Glicko-2 rating-based selection
  ADAPTIVE_BKT          // BKT-based selection (target knowledge gaps)
  SPACED_REPETITION     // Due for review based on SR algorithm
  DIFFICULTY_LADDER     // Progressively harder questions
  SPIRAL                // Cycles through topics with increasing difficulty
  CUSTOM                // Custom selection logic
}
```

### Termination Conditions

```prisma
enum TerminationCondition {
  FIXED_COUNT           // After N questions
  TIME_LIMIT            // After X minutes
  ERROR_THRESHOLD       // After X errors (streak mode)
  MASTERY_ACHIEVED      // When mastery threshold reached
  CONFIDENCE_INTERVAL   // When ability estimate is precise enough (CAT)
  USER_QUIT             // User ended session
  ALL_QUESTIONS         // All questions in pool answered
  CUSTOM                // Custom termination logic
}
```

### Key Models

#### AssessmentTemplate

Reusable configurations for assessments:

```prisma
model AssessmentTemplate {
  id          String @id
  code        String @unique // "puzzle-streak-math"
  name        String         // "Math Puzzle Streak"

  // Core configuration
  assessmentType        AssessmentType
  selectionStrategy     QuestionSelectionStrategy
  terminationCondition  TerminationCondition

  // Question pool constraints
  topicIds              String[]
  difficultyRange       Json?           // { min: "DEVELOPING", max: "ADVANCED" }
  questionTypes         QuestionType[]
  tags                  String[]

  // Termination parameters
  questionLimit         Int?            // For FIXED_COUNT
  timeLimitSeconds      Int?            // For TIME_LIMIT
  errorThreshold        Int?            // For ERROR_THRESHOLD
  masteryThreshold      Float?          // For MASTERY_ACHIEVED

  // Difficulty progression (streaming modes)
  startingDifficulty    Float?
  difficultyIncrement   Float?          // Per correct answer
  difficultyDecrement   Float?          // Per wrong answer

  // Scoring
  basePointsPerQuestion Int @default(10)
  streakBonusMultiplier Float?
  timeBonusEnabled      Boolean @default(false)

  // UI/UX settings
  showFeedbackAfterEach Boolean @default(true)
  showCorrectAnswer     Boolean @default(true)
  allowSkip             Boolean @default(false)
  allowHints            Boolean @default(true)
  perQuestionTimeLimit  Int?            // Seconds per question

  // Lives system (streak modes)
  startingLives         Int?            // null = unlimited
  earnExtraLifeEvery    Int?            // Earn life every N correct

  // Competitive
  isRanked              Boolean @default(false)
  leaderboardEnabled    Boolean @default(false)
}
```

#### AssessmentSession

Individual session tracking:

```prisma
model AssessmentSession {
  id         String @id
  userId     String
  templateId String?

  // Configuration snapshot
  assessmentType        AssessmentType
  selectionStrategy     QuestionSelectionStrategy
  terminationCondition  TerminationCondition
  config                Json?

  // State
  status                SessionStatus @default(IN_PROGRESS)
  currentQuestionIndex  Int @default(0)

  // Timing
  startedAt             DateTime
  endedAt               DateTime?
  totalTimeMs           Int?
  pausedTimeMs          Int @default(0)

  // Results
  questionsAttempted    Int @default(0)
  questionsCorrect      Int @default(0)
  questionsSkipped      Int @default(0)
  totalScore            Float @default(0)

  // Streaks
  currentStreak         Int @default(0)
  longestStreak         Int @default(0)
  streakBonusEarned     Float @default(0)

  // Lives
  livesRemaining        Int?
  livesUsed             Int @default(0)

  // Adaptive tracking
  currentDifficulty     Float?
  estimatedAbility      Float?
  abilityStandardError  Float?

  // Termination
  terminationReason     String?

  // Ranking
  finalRank             Int?
  percentile            Float?
}

enum SessionStatus {
  NOT_STARTED
  IN_PROGRESS
  PAUSED
  COMPLETED
  ABANDONED
  TIMED_OUT
}
```

### Example: Creating Assessment Templates

#### Puzzle Streak (Lichess-style)

```typescript
const puzzleStreak = await prisma.assessmentTemplate.create({
  data: {
    code: 'puzzle-streak-math-fractions',
    name: 'Fractions Puzzle Streak',
    description: 'Answer increasingly difficult fraction problems until you make 3 mistakes',

    assessmentType: 'PUZZLE_STREAK',
    selectionStrategy: 'DIFFICULTY_LADDER',
    terminationCondition: 'ERROR_THRESHOLD',

    // Topic focus
    topicIds: [fractionsTopicId],
    difficultyRange: { min: 'FOUNDATIONAL', max: 'EXPERT' },

    // Termination: 3 lives
    errorThreshold: 3,
    startingLives: 3,
    earnExtraLifeEvery: 10, // Earn extra life every 10 correct

    // Difficulty progression
    startingDifficulty: 1200, // Glicko rating
    difficultyIncrement: 50,  // +50 per correct
    difficultyDecrement: 100, // -100 per wrong

    // Scoring
    basePointsPerQuestion: 10,
    streakBonusMultiplier: 1.5, // 1.5x bonus at 5+ streak

    // UX
    showFeedbackAfterEach: true,
    showCorrectAnswer: true,
    allowSkip: false,
    allowHints: false, // No hints in streak mode
    shuffleQuestions: true,

    // Competitive
    isRanked: true,
    leaderboardEnabled: true
  }
});
```

#### Timed Puzzle Storm

```typescript
const puzzleStorm = await prisma.assessmentTemplate.create({
  data: {
    code: 'puzzle-storm-5min',
    name: '5-Minute Puzzle Storm',
    description: 'Answer as many questions as possible in 5 minutes',

    assessmentType: 'PUZZLE_STORM',
    selectionStrategy: 'ADAPTIVE_GLICKO',
    terminationCondition: 'TIME_LIMIT',

    timeLimitSeconds: 300, // 5 minutes
    perQuestionTimeLimit: null, // No per-question limit

    // Adaptive selection around user's level
    startingDifficulty: null, // Use learner's current rating

    // Scoring
    basePointsPerQuestion: 10,
    timeBonusEnabled: true, // Faster = more points
    streakBonusMultiplier: 2.0,

    // UX
    showFeedbackAfterEach: false, // No feedback during storm
    showCorrectAnswer: false,
    showTimer: true,
    countdownWarning: 30, // Warn at 30 seconds

    isRanked: true,
    leaderboardEnabled: true
  }
});
```

#### Adaptive Placement Test

```typescript
const placementTest = await prisma.assessmentTemplate.create({
  data: {
    code: 'placement-math-grade4',
    name: 'Grade 4 Math Placement',
    description: 'Adaptive test to determine starting level',

    assessmentType: 'PLACEMENT',
    selectionStrategy: 'ADAPTIVE_IRT',
    terminationCondition: 'CONFIDENCE_INTERVAL',

    // Covers multiple topics
    topicIds: grade4TopicIds,

    // CAT parameters
    confidenceThreshold: 0.3, // Stop when SE < 0.3
    questionLimit: 30, // Max 30 questions

    // Start at grade level
    startingDifficulty: 0, // IRT scale centered at 0

    // UX
    showFeedbackAfterEach: false, // No feedback during placement
    showCorrectAnswer: false,
    allowSkip: false,
    allowHints: false,

    isRanked: false
  }
});
```

#### Daily Challenge

```typescript
const dailyChallenge = await prisma.assessmentTemplate.create({
  data: {
    code: 'daily-challenge-math',
    name: 'Daily Math Challenge',
    description: 'Same 10 questions for everyone - compete for the top spot!',

    assessmentType: 'DAILY_CHALLENGE',
    selectionStrategy: 'FIXED', // Pre-generated daily
    terminationCondition: 'FIXED_COUNT',

    questionLimit: 10,
    timeLimitSeconds: 600, // 10 minutes max

    // Scoring
    basePointsPerQuestion: 100,
    timeBonusEnabled: true,

    // UX
    showFeedbackAfterEach: false, // Show all at end
    showCorrectAnswer: true, // After completion
    allowSkip: false,

    // Reset daily
    dailyResetTime: '00:00', // Midnight UTC

    isRanked: true,
    leaderboardEnabled: true
  }
});
```

### Starting an Assessment Session

```typescript
async function startAssessment(userId: string, templateCode: string) {
  const template = await prisma.assessmentTemplate.findUnique({
    where: { code: templateCode }
  });

  if (!template) throw new Error('Template not found');

  // Create session with config snapshot
  const session = await prisma.assessmentSession.create({
    data: {
      userId,
      templateId: template.id,
      assessmentType: template.assessmentType,
      selectionStrategy: template.selectionStrategy,
      terminationCondition: template.terminationCondition,
      config: template, // Snapshot entire config
      topicIds: template.topicIds,
      livesRemaining: template.startingLives,
      currentDifficulty: template.startingDifficulty
    }
  });

  // Pre-select first question(s)
  const firstQuestion = await selectNextQuestion(session);
  await prisma.assessmentQuestionOrder.create({
    data: {
      sessionId: session.id,
      questionId: firstQuestion.id,
      position: 0,
      targetDifficulty: session.currentDifficulty
    }
  });

  return session;
}
```

### Recording a Response in Assessment

```typescript
async function recordAssessmentResponse(
  sessionId: string,
  questionId: string,
  response: any,
  isCorrect: boolean,
  durationMs: number
) {
  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId }
  });

  // Update session stats
  const newStreak = isCorrect ? session.currentStreak + 1 : 0;
  const livesRemaining = isCorrect
    ? session.livesRemaining
    : session.livesRemaining ? session.livesRemaining - 1 : null;

  // Check for earned extra life
  const config = session.config as any;
  const earnedLife = config.earnExtraLifeEvery &&
    newStreak > 0 &&
    newStreak % config.earnExtraLifeEvery === 0;

  await prisma.$transaction([
    // Update question order
    prisma.assessmentQuestionOrder.update({
      where: { sessionId_questionId: { sessionId, questionId } },
      data: {
        wasAnswered: true,
        wasCorrect: isCorrect,
        answeredAt: new Date(),
        timeSpentMs: durationMs
      }
    }),

    // Update session
    prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        questionsAttempted: { increment: 1 },
        questionsCorrect: isCorrect ? { increment: 1 } : undefined,
        currentStreak: newStreak,
        longestStreak: Math.max(session.longestStreak, newStreak),
        livesRemaining: earnedLife
          ? (livesRemaining ?? 0) + 1
          : livesRemaining,
        livesUsed: isCorrect ? undefined : { increment: 1 },
        currentQuestionIndex: { increment: 1 },
        // Update difficulty for adaptive modes
        currentDifficulty: session.selectionStrategy === 'DIFFICULTY_LADDER'
          ? session.currentDifficulty + (isCorrect
              ? config.difficultyIncrement ?? 50
              : -(config.difficultyDecrement ?? 100))
          : session.currentDifficulty
      }
    }),

    // Record full response
    prisma.questionResponse.create({
      data: {
        userId: session.userId,
        questionId,
        assessmentSessionId: sessionId,
        response,
        isCorrect,
        durationMs,
        // ... other xAPI fields
      }
    })
  ]);

  // Check termination
  return checkTermination(sessionId);
}
```

### Checking Termination Conditions

```typescript
async function checkTermination(sessionId: string): Promise<{
  shouldEnd: boolean;
  reason?: string;
}> {
  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId }
  });

  const config = session.config as any;

  switch (session.terminationCondition) {
    case 'FIXED_COUNT':
      if (session.questionsAttempted >= config.questionLimit) {
        return { shouldEnd: true, reason: 'Question limit reached' };
      }
      break;

    case 'TIME_LIMIT':
      const elapsed = Date.now() - session.startedAt.getTime() - session.pausedTimeMs;
      if (elapsed >= config.timeLimitSeconds * 1000) {
        return { shouldEnd: true, reason: 'Time limit reached' };
      }
      break;

    case 'ERROR_THRESHOLD':
      if (session.livesRemaining !== null && session.livesRemaining <= 0) {
        return { shouldEnd: true, reason: 'Out of lives' };
      }
      break;

    case 'MASTERY_ACHIEVED':
      // Calculate current mastery estimate
      const accuracy = session.questionsCorrect / session.questionsAttempted;
      if (accuracy >= config.masteryThreshold && session.questionsAttempted >= 5) {
        return { shouldEnd: true, reason: 'Mastery achieved' };
      }
      break;

    case 'CONFIDENCE_INTERVAL':
      if (session.abilityStandardError &&
          session.abilityStandardError < config.confidenceThreshold) {
        return { shouldEnd: true, reason: 'Sufficient precision' };
      }
      break;
  }

  return { shouldEnd: false };
}
```

### Daily Challenge System

```typescript
// Generate daily challenge (run via cron at midnight)
async function generateDailyChallenge(templateId: string, date: Date) {
  const template = await prisma.assessmentTemplate.findUnique({
    where: { id: templateId }
  });

  // Select questions for the day
  const questions = await prisma.question.findMany({
    where: {
      topics: { some: { topicId: { in: template.topicIds } } },
      isActive: true,
      isReviewed: true
    },
    take: template.questionLimit,
    orderBy: { updatedAt: 'desc' } // Or random selection
  });

  await prisma.dailyChallenge.create({
    data: {
      challengeDate: date,
      templateId,
      questionIds: questions.map(q => q.id)
    }
  });
}

// Record daily challenge attempt
async function completeDailyChallenge(
  userId: string,
  sessionId: string,
  templateId: string
) {
  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Record attempt
  const attempt = await prisma.dailyChallengeAttempt.create({
    data: {
      userId,
      challengeDate: today,
      templateId,
      sessionId,
      score: session.totalScore,
      timeMs: session.totalTimeMs ?? 0,
      questionsCorrect: session.questionsCorrect
    }
  });

  // Update leaderboard
  await updateDailyChallengeLeaderboard(templateId, today);

  return attempt;
}
```

### Assessment Type Quick Reference

| Type | Selection | Termination | Lives | Leaderboard |
|------|-----------|-------------|-------|-------------|
| FIXED_ASSESSMENT | FIXED | FIXED_COUNT | No | Optional |
| ADAPTIVE_ASSESSMENT | ADAPTIVE_IRT | CONFIDENCE_INTERVAL | No | No |
| PUZZLE_STREAK | DIFFICULTY_LADDER | ERROR_THRESHOLD | Yes | Yes |
| PUZZLE_STORM | ADAPTIVE_GLICKO | TIME_LIMIT | No | Yes |
| PUZZLE_RACER | FIXED | FIXED_COUNT + TIME | No | Yes |
| DAILY_CHALLENGE | FIXED | FIXED_COUNT | No | Yes |
| REVIEW_SESSION | SPACED_REPETITION | ALL_QUESTIONS | No | No |
| MASTERY_CHECK | ADAPTIVE_BKT | MASTERY_ACHIEVED | No | No |

---

## Learner Tracking

### QuestionResponse (xAPI-Inspired)

The `QuestionResponse` model captures rich interaction data for analytics and ML:

```prisma
model QuestionResponse {
  id         String @id
  userId     String
  questionId String
  topicId    String?  // Which topic context

  // Response Data
  response      Json     // QTI format response
  responseText  String?  // Plain text
  isCorrect     Boolean?
  score         Float?
  partialCredit Json?    // { "part1": 0.5, "part2": 1.0 }

  // Timing (Critical for ML)
  startedAt         DateTime
  submittedAt       DateTime?
  durationMs        Int?   // Total time
  timeToFirstAction Int?   // Thinking time
  activeTimeMs      Int?   // Excludes idle

  // Interaction Details
  attemptNumber    Int     @default(1)
  hintsUsed        Int     @default(0)
  hintsAvailable   Int     @default(0)
  wasSkipped       Boolean @default(false)
  wasRevealed      Boolean @default(false)
  wasTimedOut      Boolean @default(false)

  // Metacognition (Self-reported)
  confidenceLevel     Int?     // 1-5
  perceivedDifficulty Int?     // 1-5
  flaggedForReview    Boolean  @default(false)

  // Response Revision Tracking
  responseHistory Json?  // [{response, timestamp, action}]
  timesChanged    Int    @default(0)
  finalAnswerTime Int?   // Ms to final answer

  // Behavioral Events (for ML)
  interactionEvents Json?  // [{type, timestamp, data}]
  // Types: focus, blur, scroll, choice_select, text_input, hint_request

  // Prior Exposure (Spaced Repetition)
  previousAttemptId    String?
  daysSinceLastAttempt Int?
  totalPriorAttempts   Int @default(0)

  // Context
  deviceType      String?  // mobile, tablet, desktop
  screenSize      String?  // small, medium, large
  inputMethod     String?  // touch, mouse, keyboard
  localHour       Int?     // 0-23 (time of day)
  dayOfWeek       Int?     // 0-6
  sessionPosition Int?     // Question # in session (fatigue)

  // Rating Snapshots
  learnerRatingBefore  Float?
  learnerRatingAfter   Float?
  learnerRDBefore      Float?  // Rating deviation
  learnerRDAfter       Float?
  questionRatingBefore Float?
  questionRatingAfter  Float?

  // Multi-scoring
  scores ResponseScore[]
}
```

### Example: Recording a Response

```typescript
const response = await prisma.questionResponse.create({
  data: {
    userId: user.id,
    questionId: question.id,
    topicId: topic.id,
    studySessionId: session.id,

    // Response
    response: { RESPONSE: 'B' },
    responseText: 'B',
    isCorrect: true,
    score: 1.0,
    maxScore: 1.0,

    // Timing
    startedAt: new Date('2025-01-15T10:00:00Z'),
    submittedAt: new Date('2025-01-15T10:00:25Z'),
    durationMs: 25000,
    timeToFirstAction: 8000,  // 8s thinking
    activeTimeMs: 20000,

    // Interaction
    attemptNumber: 1,
    hintsUsed: 0,
    hintsAvailable: 2,

    // Metacognition
    confidenceLevel: 4,

    // Response changes
    responseHistory: [
      { response: { RESPONSE: 'A' }, timestamp: '2025-01-15T10:00:12Z', action: 'select' },
      { response: { RESPONSE: 'B' }, timestamp: '2025-01-15T10:00:20Z', action: 'change' }
    ],
    timesChanged: 1,
    finalAnswerTime: 20000,

    // Behavioral events
    interactionEvents: [
      { type: 'focus', timestamp: 0, data: {} },
      { type: 'choice_select', timestamp: 12000, data: { choice: 'A' } },
      { type: 'choice_deselect', timestamp: 18000, data: { choice: 'A' } },
      { type: 'choice_select', timestamp: 20000, data: { choice: 'B' } }
    ],

    // Context
    deviceType: 'tablet',
    inputMethod: 'touch',
    localHour: 10,
    dayOfWeek: 3,  // Wednesday
    sessionPosition: 5,

    // Prior exposure
    totalPriorAttempts: 0,

    // Rating snapshots
    learnerRatingBefore: 1450,
    learnerRDBefore: 120,
    questionRatingBefore: 1520,
  }
});
```

---

## Adaptive Learning & Ratings

### Glicko-2 System

We use Glicko-2 for both learner ability and question difficulty ratings:

**Parameters:**
- `rating`: Current rating (default 1500)
- `ratingDeviation` (RD): Uncertainty (default 350, decreases with more data)
- `volatility`: Rating consistency (default 0.06)

#### LearnerTopicRating

```prisma
model LearnerTopicRating {
  userId  String
  topicId String

  rating          Float @default(1500)
  ratingDeviation Float @default(350)
  volatility      Float @default(0.06)

  totalAttempts   Int @default(0)
  correctAttempts Int @default(0)
  lastAttemptAt   DateTime?

  ratingHistory   Json?  // [{rating, rd, timestamp}]
}
```

#### QuestionRating

```prisma
model QuestionRating {
  questionId String
  topicId    String  // Rating varies by topic context

  rating          Float @default(1500)
  ratingDeviation Float @default(350)
  volatility      Float @default(0.06)

  discriminationIndex Float?  // How well it differentiates ability
}
```

### Example: Updating Ratings After Response

```typescript
import { glicko2 } from './lib/rating';  // Your Glicko-2 implementation

async function updateRatings(responseId: string) {
  const response = await prisma.questionResponse.findUnique({
    where: { id: responseId },
    include: { question: true }
  });

  // Get current ratings
  const learnerRating = await prisma.learnerTopicRating.findUnique({
    where: { userId_topicId: { userId: response.userId, topicId: response.topicId } }
  });

  const questionRating = await prisma.questionRating.findUnique({
    where: { questionId_topicId: { questionId: response.questionId, topicId: response.topicId } }
  });

  // Calculate new ratings
  const outcome = response.isCorrect ? 1 : 0;

  const newLearnerRating = glicko2.updateRating(
    { rating: learnerRating.rating, rd: learnerRating.ratingDeviation, vol: learnerRating.volatility },
    [{ rating: questionRating.rating, rd: questionRating.ratingDeviation, outcome }]
  );

  const newQuestionRating = glicko2.updateRating(
    { rating: questionRating.rating, rd: questionRating.ratingDeviation, vol: questionRating.volatility },
    [{ rating: learnerRating.rating, rd: learnerRating.ratingDeviation, outcome: 1 - outcome }]
  );

  // Update in transaction
  await prisma.$transaction([
    prisma.learnerTopicRating.update({
      where: { id: learnerRating.id },
      data: {
        rating: newLearnerRating.rating,
        ratingDeviation: newLearnerRating.rd,
        volatility: newLearnerRating.vol,
        totalAttempts: { increment: 1 },
        correctAttempts: response.isCorrect ? { increment: 1 } : undefined,
        lastAttemptAt: new Date(),
        ratingHistory: {
          push: { rating: newLearnerRating.rating, rd: newLearnerRating.rd, timestamp: new Date() }
        }
      }
    }),
    prisma.questionRating.update({
      where: { id: questionRating.id },
      data: {
        rating: newQuestionRating.rating,
        ratingDeviation: newQuestionRating.rd,
        totalAttempts: { increment: 1 },
        correctAttempts: response.isCorrect ? { increment: 1 } : undefined
      }
    }),
    prisma.questionResponse.update({
      where: { id: responseId },
      data: {
        learnerRatingAfter: newLearnerRating.rating,
        learnerRDAfter: newLearnerRating.rd,
        questionRatingAfter: newQuestionRating.rating
      }
    })
  ]);
}
```

### Adaptive Question Selection

```typescript
async function selectAdaptiveQuestion(userId: string, topicId: string) {
  // Get learner's current rating
  const learnerRating = await prisma.learnerTopicRating.findUnique({
    where: { userId_topicId: { userId, topicId } }
  });

  const targetRating = learnerRating?.rating ?? 1500;
  const tolerance = 200;  // Match within 200 rating points

  // Find questions near learner's ability
  const questions = await prisma.question.findMany({
    where: {
      topics: { some: { topicId } },
      isActive: true,
      ratings: {
        some: {
          topicId,
          rating: {
            gte: targetRating - tolerance,
            lte: targetRating + tolerance
          }
        }
      },
      // Exclude recently answered
      responses: {
        none: {
          userId,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }  // Last 24h
        }
      }
    },
    include: {
      ratings: { where: { topicId } }
    },
    take: 10
  });

  // Randomize from candidates
  return questions[Math.floor(Math.random() * questions.length)];
}
```

---

## Scoring Systems

### ResponseScore Model

Multiple scoring algorithms can be applied to each response:

```prisma
enum ScoringAlgorithm {
  SIMPLE          // Binary correct/incorrect
  PARTIAL_CREDIT  // Weighted partial credit
  GLICKO2         // Rating update
  ELO             // Traditional ELO
  IRT_1PL         // Item Response Theory 1-parameter (Rasch)
  IRT_2PL         // 2-parameter (discrimination + difficulty)
  IRT_3PL         // 3-parameter (+ guessing)
  BKT             // Bayesian Knowledge Tracing
  CUSTOM          // Custom algorithm
}

model ResponseScore {
  responseId String

  algorithm        ScoringAlgorithm
  algorithmVersion String @default("1.0")

  score           Float   // Computed score
  maxScore        Float?
  normalizedScore Float?  // 0-1

  parameters Json?  // Algorithm params used
  outputs    Json?  // Algorithm-specific outputs

  computedAt DateTime @default(now())
  isLatest   Boolean  @default(true)
}
```

### Example: Multiple Scores per Response

```typescript
// After recording a response, compute multiple scores
async function computeScores(responseId: string) {
  const response = await prisma.questionResponse.findUnique({
    where: { id: responseId },
    include: { question: true }
  });

  const scores = [];

  // 1. Simple binary score
  scores.push({
    responseId,
    algorithm: 'SIMPLE',
    score: response.isCorrect ? 1 : 0,
    maxScore: 1,
    normalizedScore: response.isCorrect ? 1 : 0
  });

  // 2. IRT 2PL probability
  const irt2pl = computeIRT2PL(response);
  scores.push({
    responseId,
    algorithm: 'IRT_2PL',
    algorithmVersion: '1.0',
    score: irt2pl.probability,
    parameters: { a: irt2pl.discrimination, b: irt2pl.difficulty },
    outputs: {
      probability: irt2pl.probability,
      information: irt2pl.information,
      standardError: irt2pl.se
    }
  });

  // 3. BKT update
  const bkt = computeBKT(response);
  scores.push({
    responseId,
    algorithm: 'BKT',
    algorithmVersion: '1.0',
    score: bkt.pKnownAfter,
    parameters: { pLearn: 0.1, pGuess: 0.25, pSlip: 0.1 },
    outputs: {
      pKnownBefore: bkt.pKnownBefore,
      pKnownAfter: bkt.pKnownAfter,
      learned: bkt.learned
    }
  });

  await prisma.responseScore.createMany({ data: scores });
}
```

### LearnerKnowledgeState (BKT)

For Bayesian Knowledge Tracing and neural models:

```prisma
model LearnerKnowledgeState {
  userId  String
  topicId String

  // BKT parameters
  pKnown Float @default(0.5)   // P(L) - probability of knowing
  pLearn Float @default(0.1)   // P(T) - learning rate
  pGuess Float @default(0.25)  // P(G) - guess probability
  pSlip  Float @default(0.1)   // P(S) - slip probability

  // Additional modeling
  masteryLevel    Float @default(0)     // 0-1 mastery
  masteryVariance Float @default(0.25)  // Uncertainty

  // For neural models (DKT)
  latentState Json?  // Embedding vector

  stateHistory Json?  // [{pKnown, timestamp, responseId}]
}
```

### Adding a New Scoring Algorithm

1. **Add to enum:**

```prisma
enum ScoringAlgorithm {
  // ... existing
  MY_NEW_ALGORITHM  // Description
}
```

2. **Implement the scorer:**

```typescript
// lib/scoring/my-new-algorithm.ts
import { QuestionResponse, Question } from '@prisma/client';

interface MyAlgorithmParams {
  param1: number;
  param2: string;
}

interface MyAlgorithmOutput {
  score: number;
  confidence: number;
  // ... other outputs
}

export function computeMyAlgorithm(
  response: QuestionResponse & { question: Question },
  params: MyAlgorithmParams
): MyAlgorithmOutput {
  // Your algorithm logic
  const score = /* ... */;

  return {
    score,
    confidence: /* ... */
  };
}
```

3. **Register in scoring service:**

```typescript
// lib/scoring/index.ts
import { computeMyAlgorithm } from './my-new-algorithm';

const scorers = {
  SIMPLE: computeSimpleScore,
  IRT_2PL: computeIRT2PL,
  BKT: computeBKT,
  MY_NEW_ALGORITHM: computeMyAlgorithm,  // Add here
};

export async function computeAllScores(responseId: string) {
  const response = await prisma.questionResponse.findUnique({...});

  const scores = [];
  for (const [algorithm, scorer] of Object.entries(scorers)) {
    const result = scorer(response, getDefaultParams(algorithm));
    scores.push({
      responseId,
      algorithm,
      score: result.score,
      outputs: result,
      // ...
    });
  }

  await prisma.responseScore.createMany({ data: scores });
}
```

4. **Run migration:**

```bash
bunx prisma migrate dev --name add_my_new_algorithm
```

---

## Common Queries

### 1. Get Topics for Current Week

```typescript
async function getCurrentTopics(gradeLevelId: string, term: number, week: number) {
  return prisma.topic.findMany({
    where: {
      termMappings: {
        some: {
          gradeLevelId,
          term,
          weekStart: { lte: week },
          OR: [
            { weekEnd: { gte: week } },
            { weekEnd: null }
          ]
        }
      }
    },
    include: {
      children: true,  // Include subtopics
      termMappings: { where: { gradeLevelId, term } }
    }
  });
}
```

### 2. Get Learner Performance by Topic

```typescript
async function getLearnerTopicPerformance(userId: string, topicId: string) {
  const [rating, responses, knowledgeState] = await Promise.all([
    prisma.learnerTopicRating.findUnique({
      where: { userId_topicId: { userId, topicId } }
    }),
    prisma.questionResponse.findMany({
      where: { userId, topicId },
      orderBy: { createdAt: 'desc' },
      take: 50
    }),
    prisma.learnerKnowledgeState.findUnique({
      where: { userId_topicId: { userId, topicId } }
    })
  ]);

  const correctCount = responses.filter(r => r.isCorrect).length;
  const avgTime = responses.reduce((sum, r) => sum + (r.durationMs ?? 0), 0) / responses.length;

  return {
    rating: rating?.rating ?? 1500,
    ratingDeviation: rating?.ratingDeviation ?? 350,
    masteryLevel: knowledgeState?.masteryLevel ?? 0,
    pKnown: knowledgeState?.pKnown ?? 0.5,
    totalAttempts: responses.length,
    accuracy: correctCount / responses.length,
    averageTimeMs: avgTime,
    recentResponses: responses.slice(0, 10)
  };
}
```

### 3. Find Questions by Difficulty Range

```typescript
async function findQuestionsByDifficulty(
  topicId: string,
  minRating: number,
  maxRating: number,
  limit = 10
) {
  return prisma.question.findMany({
    where: {
      isActive: true,
      topics: { some: { topicId } },
      ratings: {
        some: {
          topicId,
          rating: { gte: minRating, lte: maxRating }
        }
      }
    },
    include: {
      ratings: { where: { topicId } }
    },
    take: limit,
    orderBy: { updatedAt: 'desc' }
  });
}
```

### 4. Get Spaced Repetition Candidates

```typescript
async function getSpacedRepetitionQuestions(userId: string, topicId: string) {
  // Find questions due for review based on forgetting curve
  const daysSinceReview = [1, 3, 7, 14, 30, 90];  // Review intervals

  return prisma.question.findMany({
    where: {
      topics: { some: { topicId } },
      responses: {
        some: {
          userId,
          isCorrect: true,
          createdAt: {
            // Last correct answer was at a review interval
            in: daysSinceReview.map(d =>
              new Date(Date.now() - d * 24 * 60 * 60 * 1000)
            )
          }
        }
      }
    },
    take: 5
  });
}
```

### 5. Analyze Response Patterns for ML

```typescript
async function getMLFeatures(userId: string, topicId: string) {
  const responses = await prisma.questionResponse.findMany({
    where: { userId, topicId },
    orderBy: { createdAt: 'asc' },
    select: {
      isCorrect: true,
      durationMs: true,
      timeToFirstAction: true,
      timesChanged: true,
      confidenceLevel: true,
      sessionPosition: true,
      localHour: true,
      dayOfWeek: true,
      totalPriorAttempts: true,
      daysSinceLastAttempt: true,
      scores: {
        where: { algorithm: 'IRT_2PL', isLatest: true }
      }
    }
  });

  // Extract features for ML model
  return responses.map(r => ({
    correct: r.isCorrect ? 1 : 0,
    responseTime: r.durationMs,
    thinkingTime: r.timeToFirstAction,
    answerChanges: r.timesChanged,
    confidence: r.confidenceLevel,
    sessionFatigue: r.sessionPosition,
    timeOfDay: r.localHour,
    dayOfWeek: r.dayOfWeek,
    priorAttempts: r.totalPriorAttempts,
    daysSinceReview: r.daysSinceLastAttempt,
    irtProbability: r.scores[0]?.outputs?.probability
  }));
}
```

### 6. Get Study Session Summary

```typescript
async function getSessionSummary(sessionId: string) {
  const session = await prisma.studySession.findUnique({
    where: { id: sessionId },
    include: {
      responses: {
        include: {
          question: { select: { title: true, type: true } },
          scores: { where: { isLatest: true } }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  const byTopic = {};
  for (const r of session.responses) {
    const tid = r.topicId ?? 'unknown';
    if (!byTopic[tid]) byTopic[tid] = { correct: 0, total: 0, timeMs: 0 };
    byTopic[tid].total++;
    if (r.isCorrect) byTopic[tid].correct++;
    byTopic[tid].timeMs += r.durationMs ?? 0;
  }

  return {
    mode: session.mode,
    duration: session.totalTimeMs,
    questionsAttempted: session.questionsAttempted,
    accuracy: session.questionsCorrect / session.questionsAttempted,
    longestStreak: session.longestStreak,
    byTopic,
    responses: session.responses
  };
}
```

---

## Extending the Schema

### Adding a New Model

1. **Define in schema.prisma:**

```prisma
model MyNewModel {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Fields
  name String

  // Relations
  userId String
  user   User @relation(fields: [userId], references: [id])

  @@map("my_new_model")
}
```

2. **Add relation to existing model:**

```prisma
model User {
  // ... existing fields
  myNewModels MyNewModel[]
}
```

3. **Run migration:**

```bash
bunx prisma migrate dev --name add_my_new_model
bunx prisma generate
```

### Adding Fields to QuestionResponse

When adding new tracking fields:

1. **Consider storage impact** - JSON fields are flexible but harder to query
2. **Add indexes** for frequently queried fields
3. **Keep backwards compatibility** - use optional fields with defaults

```prisma
model QuestionResponse {
  // ... existing

  // New field
  newMetric Float?  // Optional to maintain compatibility

  @@index([newMetric])  // If frequently queried
}
```

### Performance Considerations

1. **Partition large tables** - Consider partitioning `QuestionResponse` by date
2. **Archive old data** - Move old responses to archive table
3. **Materialized views** - For complex aggregations (learner dashboards)
4. **Read replicas** - For analytics queries

```sql
-- Example: Create materialized view for learner stats
CREATE MATERIALIZED VIEW learner_topic_stats AS
SELECT
  user_id,
  topic_id,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_count,
  AVG(duration_ms) as avg_duration,
  MAX(created_at) as last_attempt
FROM question_response
GROUP BY user_id, topic_id;

-- Refresh periodically
REFRESH MATERIALIZED VIEW learner_topic_stats;
```

---

## Migration Checklist

When modifying the schema:

- [ ] Update `schema.prisma`
- [ ] Run `bunx prisma validate`
- [ ] Run `bunx prisma migrate dev --name descriptive_name`
- [ ] Run `bunx prisma generate`
- [ ] Update TypeScript types if needed
- [ ] Update documentation
- [ ] Add seed data if new tables
- [ ] Test with existing data
- [ ] Plan data migration for production
