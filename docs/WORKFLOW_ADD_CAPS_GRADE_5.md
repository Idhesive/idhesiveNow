# Workflow: Adding CAPS Grade 5 Mathematics Content

This guide outlines the step-by-step process for adding the South African CAPS (Curriculum and Assessment Policy Statement) Grade 5 Mathematics content to the database.

## 1. Preparation & Source Material

Before verifying code, ensure you have the correct source documents:

1.  **Locate the CAPS Document**: Download the *Curriculum and Assessment Policy Statement (CAPS) Grades 4-6 Mathematics* PDF from the [Department of Basic Education website](https://www.education.gov.za/).
2.  **Identify Content Areas**: In the Intermediate Phase (Grades 4-6), Mathematics is divided into 5 main content areas:
    *   Numbers, Operations and Relationships
    *   Patterns, Functions and Algebra
    *   Space and Shape (Geometry)
    *   Measurement
    *   Data Handling
3.  **Identify Weighting**: Note the time allocation for Grade 5 (usually ~6 hours/week, total hours per year).

## 2. Project Structure Setup

To keep `prisma/seed.ts` manageable, we will create a dedicated seed file for Grade 5.

1.  Create a new directory for seeds if it doesn't exist:
    ```bash
    mkdir -p prisma/seeds
    ```

2.  Create the file `prisma/seeds/caps-grade-5-math.ts`.

## 3. Implementation Steps

Copy the following template into `prisma/seeds/caps-grade-5-math.ts` and fill in the details extracted from the PDF.

### Template Skeleton

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedGrade5Math() {
  console.log("📚 Seeding CAPS Grade 5 Mathematics...");

  // 1. Retrieve References (Country, Curriculum, Subject)
  // We assume these already exist from the main seed
  const caps = await prisma.curriculum.findUniqueOrThrow({
    where: { code: "CAPS" }
  });

  const mathSubject = await prisma.subject.findUniqueOrThrow({
    where: {
      curriculumId_code: {
        curriculumId: caps.id,
        code: "MATH"
      }
    }
  });

  console.log("   ✅ References found: CAPS -> Mathematics");

  // 2. Create Grade Level
  const grade5 = await prisma.gradeLevel.upsert({
    where: {
      subjectId_grade: {
        subjectId: mathSubject.id,
        grade: 5
      }
    },
    update: {},
    create: {
      subjectId: mathSubject.id,
      grade: 5,
      name: "Grade 5",
      description: "Intermediate Phase - Second Year",
    }
  });
  console.log("   ✅ Grade Level created: Grade 5");

  // 3. Define Content Areas (Parent Topics)
  // Extract these from the CAPS document "Content Areas" section
  const contentAreas = [
    {
      code: "NUM-005", // Convention: AREA-Grade
      name: "Numbers, Operations and Relationships",
      description: "Whole numbers, addition, subtraction, multiplication, division, fractions",
      sortOrder: 1,
    },
    {
      code: "PAT-005",
      name: "Patterns, Functions and Algebra",
      description: "Numeric and geometric patterns, number sentences",
      sortOrder: 2,
    },
    {
      code: "GEO-005",
      name: "Space and Shape (Geometry)",
      description: "2D shapes, 3D objects, symmetry, viewing objects",
      sortOrder: 3,
    },
    {
      code: "MEA-005",
      name: "Measurement",
      description: "Length, mass, capacity, time, temperature, perimeter, area, volume",
      sortOrder: 4,
    },
    {
      code: "DAT-005",
      name: "Data Handling",
      description: "Collecting, organizing, representing, analyzing and interpreting data",
      sortOrder: 5,
    }
  ];

  for (const area of contentAreas) {
    await prisma.topic.upsert({
      where: {
        gradeLevelId_code: {
          gradeLevelId: grade5.id,
          code: area.code
        }
      },
      update: {
        name: area.name,
        description: area.description,
        sortOrder: area.sortOrder,
      },
      create: {
        gradeLevelId: grade5.id,
        code: area.code,
        name: area.name,
        description: area.description,
        sortOrder: area.sortOrder,
        parentId: null, // Top level
      }
    });
  }
  console.log("   ✅ Content Areas created");

  // 4. Define Topics (Subtopics) & Skills
  // This is where you map the PDF specifics.
  // Example: "Whole Numbers" -> "Counting, Ordering, Comparing"
  
  // Helper to find parent
  const getParent = async (code: string) => 
    prisma.topic.findUniqueOrThrow({
      where: { gradeLevelId_code: { gradeLevelId: grade5.id, code } }
    });

  const numParent = await getParent("NUM-005");

  const subtopics = [
    {
      parentCode: "NUM-005",
      code: "NUM-005-01",
      name: "Whole Numbers: Counting, Ordering, Comparing",
      description: "Numbers up to at least 6 digits",
      estimatedHours: 4,
      learningGoals: [
        "Count forwards and backwards in various intervals",
        "Order, compare and represent numbers to at least 6-digit numbers",
        "Represent odd and even numbers",
        "Recognize place value of digits to at least 6-digit numbers"
      ]
    },
    // Add more subtopics here based on the PDF...
  ];

  for (const topic of subtopics) {
    const parent = await getParent(topic.parentCode);
    
    await prisma.topic.upsert({
      where: {
        gradeLevelId_code: {
          gradeLevelId: grade5.id,
          code: topic.code
        }
      },
      update: {
        name: topic.name,
        description: topic.description,
        learningGoals: topic.learningGoals,
        estimatedHours: topic.estimatedHours,
        parentId: parent.id
      },
      create: {
        gradeLevelId: grade5.id,
        code: topic.code,
        name: topic.name,
        description: topic.description,
        learningGoals: topic.learningGoals,
        estimatedHours: topic.estimatedHours,
        parentId: parent.id,
        sortOrder: 1, // You should manage this index
      }
    });
  }
  
  console.log(`   ✅ Created ${subtopics.length} subtopics`);
}

// Allow running directly
if (require.main === module) {
  seedGrade5Math()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
```

## 4. Extracting Data from PDF

For each term in the CAPS document:

1.  **Look for "Content Area"**: Map this to one of the 5 parent topics.
2.  **Look for "Topic"**: Map this to a child `Topic` (e.g., "Whole Numbers").
3.  **Look for "Skills / Concepts"**: Map these to `learningGoals` (string array).
4.  **Look for "Time Allocation"**: Map this to `estimatedHours`.

**Example Mapping:**

| CAPS Document | Database Field |
| :--- | :--- |
| **Content Area:** Numbers, Operations... | `Topic` (Parent) |
| **Topic:** Common Fractions | `Topic` (Child, linked to Parent) |
| **Skills:** Describe and compare... | `learningGoals` (Array) |
| **Time:** 5 hours | `estimatedHours: 5` |

## 5. Adding Questions

Once topics are seeded, create questions linked to them.

Create a separate question definition array in the seed file:

```typescript
// ... inside seedGrade5Math function ...

// Find the topic to link to
const countingTopic = await prisma.topic.findUnique({
  where: { 
    gradeLevelId_code: { 
      gradeLevelId: grade5.id, 
      code: "NUM-005-01" 
    } 
  }
});

if (countingTopic) {
  await prisma.question.create({
    data: {
      publicId: "G5-NUM-001",
      title: "6-digit Place Value",
      questionText: "What is the value of the digit 6 in the number 462,591?",
      type: "CHOICE",
      source: "TEACHER_CREATED",
      difficultyLevel: "PROFICIENT",
      qtiXml: `...xml content...`,
      correctAnswers: ["60000"],
      topics: {
        create: {
          topicId: countingTopic.id,
          isPrimary: true
        }
      }
    }
  });
}
```

## 6. Execution

Run your specific seed file:

```bash
bunx tsx prisma/seeds/caps-grade-5-math.ts
```

## 7. Integration

Once verified, import and call this function in the main `prisma/seed.ts` file to ensure it runs during a full database reset.

```typescript
// prisma/seed.ts
import { seedGrade5Math } from "./seeds/caps-grade-5-math";

async function main() {
  // ... other seeds ...
  await seedGrade5Math();
  // ... users ...
}
```
