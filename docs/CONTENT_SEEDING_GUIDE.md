# Content Seeding Guide

This guide explains how to add curriculum content (countries, curricula, subjects, topics) and questions to the IdhesiveNow database. Use this as context for AI agents or manual content population.

## Database Schema Overview

The content hierarchy follows this structure:

```
Country
  └── Curriculum (e.g., CAPS - South African curriculum)
        └── Subject (e.g., Mathematics)
              └── GradeLevel (e.g., Grade 4)
                    └── Topic (hierarchical, can have subtopics)
                          └── Questions (linked via QuestionTopic)
```

## Prerequisites

- Database must be running and migrated
- Prisma client must be generated (`bunx prisma generate`)
- Access to run TypeScript files (`bunx tsx <file>`)

## Seeding Workflow

All seeding is done in `prisma/seed.ts`. The seed file uses Prisma's `upsert` operations to be idempotent (safe to run multiple times).

### Step 1: Add a Country

```typescript
const country = await prisma.country.upsert({
  where: { code: "ZA" },
  update: {},
  create: {
    code: "ZA",           // ISO 3166-1 alpha-2 code
    name: "South Africa",
  },
})
```

### Step 2: Add a Curriculum

```typescript
const curriculum = await prisma.curriculum.upsert({
  where: {
    countryId_code: {
      countryId: country.id,
      code: "CAPS"
    }
  },
  update: {},
  create: {
    countryId: country.id,
    code: "CAPS",
    name: "Curriculum and Assessment Policy Statement",
    description: "South African national curriculum",
    startYear: 2012,
  },
})
```

### Step 3: Add a Subject

```typescript
const subject = await prisma.subject.upsert({
  where: {
    curriculumId_code: {
      curriculumId: curriculum.id,
      code: "MATH"
    }
  },
  update: {},
  create: {
    curriculumId: curriculum.id,
    code: "MATH",
    name: "Mathematics",
    description: "Mathematics for Grades R-12",
    color: "#3b82f6",  // Optional: hex color for UI
    icon: "calculator", // Optional: icon name for UI
  },
})
```

### Step 4: Add a Grade Level

```typescript
const gradeLevel = await prisma.gradeLevel.upsert({
  where: {
    subjectId_grade: {
      subjectId: subject.id,
      grade: 4
    }
  },
  update: {},
  create: {
    subjectId: subject.id,
    grade: 4,
    name: "Grade 4 Mathematics",
    description: "Foundation Phase to Intermediate Phase transition",
  },
})
```

### Step 5: Add Topics (Hierarchical)

Topics can be hierarchical. Create parent topics first, then subtopics.

```typescript
// Parent topic (content area)
const parentTopic = await prisma.topic.upsert({
  where: {
    gradeLevelId_code: {
      gradeLevelId: gradeLevel.id,
      code: "NUMBERS"
    }
  },
  update: {},
  create: {
    gradeLevelId: gradeLevel.id,
    code: "NUMBERS",
    name: "Numbers, Operations and Relationships",
    description: "Understanding numbers and their operations",
    sortOrder: 1,
    parentId: null,  // No parent = top-level topic
  },
})

// Child topic (specific skill)
const childTopic = await prisma.topic.upsert({
  where: {
    gradeLevelId_code: {
      gradeLevelId: gradeLevel.id,
      code: "COUNTING"
    }
  },
  update: {},
  create: {
    gradeLevelId: gradeLevel.id,
    code: "COUNTING",
    name: "Whole Numbers: Counting",
    description: "Counting forwards and backwards",
    sortOrder: 1,
    parentId: parentTopic.id,  // Links to parent topic
  },
})
```

### Step 6: Add Questions

Questions store their content in QTI 3.0 XML format. Each question must be linked to at least one topic via the `QuestionTopic` join table.

#### Question Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `publicId` | String | Yes | Unique URL-safe identifier (e.g., "COUNTING-Q1") |
| `qtiXml` | String | Yes | Full QTI 3.0 XML content |
| `qtiVersion` | String | No | Default: "3.0" |
| `type` | QuestionType | Yes | CHOICE, MULTIPLE_CHOICE, TEXT_ENTRY, etc. |
| `title` | String | Yes | Short descriptive title |
| `questionText` | String | Yes | Plain text for search |
| `correctAnswers` | Json | Yes | Correct answer(s) for scoring |
| `maxScore` | Float | No | Default: 1.0 |
| `source` | QuestionSource | Yes | ORIGINAL, PAST_PAPER, TEXTBOOK, etc. |
| `difficultyLevel` | DifficultyLevel | No | BEGINNING, DEVELOPING, PROFICIENT, ADVANCED |
| `isActive` | Boolean | No | Default: true |
| `isReviewed` | Boolean | No | Default: false (set to true for production) |

#### QuestionType Enum Values

- `CHOICE` - Single choice (radio buttons)
- `MULTIPLE_CHOICE` - Multiple selection (checkboxes)
- `TEXT_ENTRY` - Short text input
- `EXTENDED_TEXT` - Long text/essay
- `NUMERIC` - Number input
- `INLINE_CHOICE` - Dropdown in text
- `MATCH` - Matching pairs
- `ORDER` - Ordering/sequencing
- `HOTSPOT` - Click on image
- `GRAPHIC_GAP_MATCH` - Drag to image
- `SLIDER` - Slider input
- `UPLOAD` - File upload
- `DRAWING` - Drawing canvas
- `COMPOSITE` - Multi-part question

#### QuestionSource Enum Values

- `ORIGINAL` - Created for this platform
- `PAST_PAPER` - From official past papers
- `TEXTBOOK` - Adapted from textbooks
- `AI_GENERATED` - Generated by AI
- `COMMUNITY` - User contributed
- `IMPORTED` - Imported from other systems

#### DifficultyLevel Enum Values

- `BEGINNING` - Introductory level
- `DEVELOPING` - Building understanding
- `PROFICIENT` - Grade-appropriate mastery
- `ADVANCED` - Above grade level

#### Example: Creating a Multiple Choice Question

```typescript
// Create the question
const question = await prisma.question.upsert({
  where: { publicId: "COUNTING-Q1" },
  update: {
    qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
  identifier="counting-q1"
  title="Count by 25s"
  adaptive="false"
  time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>B</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <p>What comes next in the sequence: 25, 50, 75, ___?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
      <qti-simple-choice identifier="A">90</qti-simple-choice>
      <qti-simple-choice identifier="B">100</qti-simple-choice>
      <qti-simple-choice identifier="C">80</qti-simple-choice>
      <qti-simple-choice identifier="D">125</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing template="http://www.imsglobal.org/question/qti_v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`,
    title: "Count by 25s",
    questionText: "What comes next in the sequence: 25, 50, 75, ___?",
    correctAnswers: ["B"],
    type: "CHOICE",
    source: "ORIGINAL",
    difficultyLevel: "DEVELOPING",
    isActive: true,
    isReviewed: true,
  },
  create: {
    publicId: "COUNTING-Q1",
    qtiXml: `...same XML as above...`,
    title: "Count by 25s",
    questionText: "What comes next in the sequence: 25, 50, 75, ___?",
    correctAnswers: ["B"],
    type: "CHOICE",
    source: "ORIGINAL",
    difficultyLevel: "DEVELOPING",
    maxScore: 1.0,
    isActive: true,
    isReviewed: true,  // IMPORTANT: Must be true for questions to appear
  },
})

// Link question to topic
await prisma.questionTopic.upsert({
  where: {
    questionId_topicId: {
      questionId: question.id,
      topicId: childTopic.id,
    },
  },
  update: { isPrimary: true },
  create: {
    questionId: question.id,
    topicId: childTopic.id,
    isPrimary: true,  // Primary topic for this question
    relevance: 1.0,   // How relevant (0-1)
  },
})
```

## QTI 3.0 XML Templates

### Single Choice Question

```xml
<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
  identifier="unique-id"
  title="Question Title"
  adaptive="false"
  time-dependent="false">

  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>B</qti-value>
    </qti-correct-response>
  </qti-response-declaration>

  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>

  <qti-item-body>
    <p>Question text goes here?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B (correct)</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
      <qti-simple-choice identifier="D">Option D</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>

  <qti-response-processing template="http://www.imsglobal.org/question/qti_v3p0/rptemplates/match_correct"/>
</qti-assessment-item>
```

### Multiple Choice Question (Multiple Correct)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
  identifier="unique-id"
  title="Question Title"
  adaptive="false"
  time-dependent="false">

  <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="identifier">
    <qti-correct-response>
      <qti-value>A</qti-value>
      <qti-value>C</qti-value>
    </qti-correct-response>
  </qti-response-declaration>

  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>

  <qti-item-body>
    <p>Select all that apply:</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="0">
      <qti-simple-choice identifier="A">Correct option 1</qti-simple-choice>
      <qti-simple-choice identifier="B">Incorrect option</qti-simple-choice>
      <qti-simple-choice identifier="C">Correct option 2</qti-simple-choice>
      <qti-simple-choice identifier="D">Incorrect option</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>

  <qti-response-processing template="http://www.imsglobal.org/question/qti_v3p0/rptemplates/match_correct"/>
</qti-assessment-item>
```

### Text Entry Question

```xml
<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
  identifier="unique-id"
  title="Question Title"
  adaptive="false"
  time-dependent="false">

  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string">
    <qti-correct-response>
      <qti-value>42</qti-value>
    </qti-correct-response>
  </qti-response-declaration>

  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>

  <qti-item-body>
    <p>What is 6 × 7?</p>
    <qti-text-entry-interaction response-identifier="RESPONSE" expected-length="10"/>
  </qti-item-body>

  <qti-response-processing template="http://www.imsglobal.org/question/qti_v3p0/rptemplates/match_correct"/>
</qti-assessment-item>
```

## Running the Seed

After updating `prisma/seed.ts`:

```bash
# Run the seed script
bun run db:seed

# Or directly
bunx tsx prisma/seed.ts
```

## Important Notes

### For Questions to Appear in Practice

1. `isActive` must be `true`
2. `isReviewed` must be `true`
3. Question must be linked to at least one topic via `QuestionTopic`
4. The topic must exist in the hierarchy

### Answer Scoring

The `correctAnswers` field is used for automatic scoring:

- **Single choice**: `["B"]` - array with single correct identifier
- **Multiple choice**: `["A", "C"]` - array with all correct identifiers
- **Text entry**: `["42"]` or `["forty-two", "42"]` - array of acceptable answers
- **Numeric**: `[42]` - numeric value

### Topic Hierarchy Best Practices

1. Create broad content areas as parent topics (e.g., "Numbers, Operations and Relationships")
2. Create specific skills as child topics (e.g., "Whole Numbers: Counting")
3. Link questions to the most specific applicable topic
4. Use `isPrimary: true` for the main topic if a question spans multiple topics

### Unique Constraints

The following must be unique:
- `country.code`
- `curriculum.countryId + code`
- `subject.curriculumId + code`
- `gradeLevel.subjectId + grade`
- `topic.gradeLevelId + code`
- `question.publicId`
- `questionTopic.questionId + topicId`

## Example: Complete Topic + Questions Seed

```typescript
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function seedFractions(gradeLevelId: string, parentTopicId: string) {
  // Create the topic
  const fractionsTopic = await prisma.topic.upsert({
    where: {
      gradeLevelId_code: {
        gradeLevelId,
        code: "FRACTIONS",
      },
    },
    update: {},
    create: {
      gradeLevelId,
      code: "FRACTIONS",
      name: "Common Fractions",
      description: "Understanding and working with fractions",
      sortOrder: 3,
      parentId: parentTopicId,
    },
  })

  // Question 1: Identify a fraction
  const q1 = await prisma.question.upsert({
    where: { publicId: "FRACTIONS-Q1" },
    update: {},
    create: {
      publicId: "FRACTIONS-Q1",
      qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
  identifier="fractions-q1" title="Identify a fraction" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>C</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value><qti-value>0</qti-value></qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <p>Which fraction represents "three quarters"?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
      <qti-simple-choice identifier="A">1/3</qti-simple-choice>
      <qti-simple-choice identifier="B">3/3</qti-simple-choice>
      <qti-simple-choice identifier="C">3/4</qti-simple-choice>
      <qti-simple-choice identifier="D">4/3</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing template="http://www.imsglobal.org/question/qti_v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`,
      title: "Identify a fraction",
      questionText: "Which fraction represents 'three quarters'?",
      correctAnswers: ["C"],
      type: "CHOICE",
      source: "ORIGINAL",
      difficultyLevel: "DEVELOPING",
      maxScore: 1.0,
      isActive: true,
      isReviewed: true,
    },
  })

  // Link question to topic
  await prisma.questionTopic.upsert({
    where: {
      questionId_topicId: {
        questionId: q1.id,
        topicId: fractionsTopic.id,
      },
    },
    update: { isPrimary: true },
    create: {
      questionId: q1.id,
      topicId: fractionsTopic.id,
      isPrimary: true,
    },
  })

  console.log(`Created topic: ${fractionsTopic.name} with 1 question`)
}

// Run with: bunx tsx prisma/seed-fractions.ts
seedFractions("grade-level-id", "parent-topic-id")
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

## Verification Queries

After seeding, verify your data:

```typescript
// Count questions per topic
const topicsWithCounts = await prisma.topic.findMany({
  select: {
    name: true,
    _count: { select: { questionTopics: true } }
  }
})

// Check active/reviewed questions
const activeQuestions = await prisma.question.count({
  where: { isActive: true, isReviewed: true }
})

// List questions without topics (orphaned)
const orphanedQuestions = await prisma.question.findMany({
  where: { topics: { none: {} } },
  select: { publicId: true, title: true }
})
```
