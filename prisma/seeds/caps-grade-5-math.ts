import { PrismaClient, QuestionType, QuestionSource, DifficultyLevel } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedGrade5Math() {
    console.log("📚 Seeding CAPS Grade 5 Mathematics...");

    // 1. Retrieve References (Country, Curriculum, Subject)
    const caps = await prisma.curriculum.findUniqueOrThrow({
        where: {
            code: "CAPS"
        }
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
    const contentAreas = [
        {
            code: "NUM-005",
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
                parentId: null,
            }
        });
    }
    console.log("   ✅ Content Areas created");

    // 4. Define Topics (Subtopics)
    const getParent = async (code: string) =>
        prisma.topic.findUniqueOrThrow({
            where: { gradeLevelId_code: { gradeLevelId: grade5.id, code } }
        });

    const subtopics = [
        {
            parentCode: "NUM-005",
            code: "NUM-005-01",
            name: "Whole Numbers: Counting, Ordering, Comparing",
            description: "Numbers up to at least 6 digits",
            estimatedHours: 4,
        },
        {
            parentCode: "NUM-005",
            code: "NUM-005-04",
            name: "Common Fractions",
            description: "Describing and ordering fractions, calculations with fractions",
            estimatedHours: 5,
        },
        {
            parentCode: "GEO-005",
            code: "GEO-005-01",
            name: "Properties of 2-D Shapes",
            description: "Range of shapes, similarities and differences, angles",
            estimatedHours: 4,
        },
        {
            parentCode: "MEA-005",
            code: "MEA-005-02",
            name: "Time",
            description: "Reading time and time instruments, reading calendars, calculating time intervals",
            estimatedHours: 6,
        },
        {
            parentCode: "DAT-005",
            code: "DAT-005-01",
            name: "Collect, Organize and Represent Data",
            description: "Collect data using tally marks, order data, draw bar graphs",
            estimatedHours: 9, // Often combined with interpreting
        }
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
                estimatedHours: topic.estimatedHours,
                parentId: parent.id
            },
            create: {
                gradeLevelId: grade5.id,
                code: topic.code,
                name: topic.name,
                description: topic.description,
                estimatedHours: topic.estimatedHours,
                parentId: parent.id,
                sortOrder: 1,
            }
        });
    }

    console.log(`   ✅ Created ${subtopics.length} subtopics`);

    // 5. Run Question Seeding
    await seedGrade5Questions(grade5.id);
}

async function seedGrade5Questions(gradeLevelId: string) {
    console.log("📝 Seeding Grade 5 Practice Questions...");

    const questionData = [
        {
            publicId: "G5-NUM-02",
            topicCode: "NUM-005-01",
            title: "Rounding to Nearest 100",
            text: "Round 4,582 to the nearest 100.",
            type: QuestionType.CHOICE,
            difficulty: DifficultyLevel.DEVELOPING,
            answers: ["B"],
            xml: `
        <qti-assessment-item identifier="g5-num-02" title="Rounding to Nearest 100">
          <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
            <qti-correct-response><qti-value>B</qti-value></qti-correct-response>
          </qti-response-declaration>
          <qti-item-body>
            <p>Round 4,582 to the nearest 100.</p>
            <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
              <qti-simple-choice identifier="A">4,500</qti-simple-choice>
              <qti-simple-choice identifier="B">4,600</qti-simple-choice>
              <qti-simple-choice identifier="C">4,580</qti-simple-choice>
              <qti-simple-choice identifier="D">5,000</qti-simple-choice>
            </qti-choice-interaction>
          </qti-item-body>
        </qti-assessment-item>`
        },
        {
            publicId: "G5-FRAC-01",
            topicCode: "NUM-005-04",
            title: "Adding Fractions",
            text: "What is 3/8 + 2/8?",
            type: QuestionType.CHOICE,
            difficulty: DifficultyLevel.PROFICIENT,
            answers: ["C"],
            xml: `
        <qti-assessment-item identifier="g5-frac-01" title="Adding Fractions">
          <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
            <qti-correct-response><qti-value>C</qti-value></qti-correct-response>
          </qti-response-declaration>
          <qti-item-body>
            <p>What is <math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>3</mn><mn>8</mn></mfrac></math> + <math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>2</mn><mn>8</mn></mfrac></math>?</p>
            <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
              <qti-simple-choice identifier="A"><math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>5</mn><mn>16</mn></mfrac></math></qti-simple-choice>
              <qti-simple-choice identifier="B"><math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>1</mn><mn>8</mn></mfrac></math></qti-simple-choice>
              <qti-simple-choice identifier="C"><math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>5</mn><mn>8</mn></mfrac></math></qti-simple-choice>
              <qti-simple-choice identifier="D"><math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>6</mn><mn>8</mn></mfrac></math></qti-simple-choice>
            </qti-choice-interaction>
          </qti-item-body>
        </qti-assessment-item>`
        },
        {
            publicId: "G5-GEO-01",
            topicCode: "GEO-005-01",
            title: "Identifying Angles",
            text: "Which angle is smaller than a right angle?",
            type: QuestionType.CHOICE,
            difficulty: DifficultyLevel.DEVELOPING,
            answers: ["A"],
            xml: `
        <qti-assessment-item identifier="g5-geo-01" title="Identifying Angles">
          <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
            <qti-correct-response><qti-value>A</qti-value></qti-correct-response>
          </qti-response-declaration>
          <qti-item-body>
            <p>Which angle is smaller than a right angle?</p>
            <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
              <qti-simple-choice identifier="A">Acute angle</qti-simple-choice>
              <qti-simple-choice identifier="B">Obtuse angle</qti-simple-choice>
              <qti-simple-choice identifier="C">Straight angle</qti-simple-choice>
              <qti-simple-choice identifier="D">Reflex angle</qti-simple-choice>
            </qti-choice-interaction>
          </qti-item-body>
        </qti-assessment-item>`
        },
        {
            publicId: "G5-MEA-01",
            topicCode: "MEA-005-02",
            title: "Time Interval",
            text: "A movie starts at 14:15 and ends at 16:30. How long was the movie?",
            type: QuestionType.CHOICE,
            difficulty: DifficultyLevel.PROFICIENT,
            answers: ["D"],
            xml: `
        <qti-assessment-item identifier="g5-mea-01" title="Time Interval">
          <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
            <qti-correct-response><qti-value>D</qti-value></qti-correct-response>
          </qti-response-declaration>
          <qti-item-body>
            <p>A movie starts at 14:15 and ends at 16:30. How long was the movie?</p>
            <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
              <qti-simple-choice identifier="A">1 hour 15 minutes</qti-simple-choice>
              <qti-simple-choice identifier="B">2 hours 45 minutes</qti-simple-choice>
              <qti-simple-choice identifier="C">2 hours 30 minutes</qti-simple-choice>
              <qti-simple-choice identifier="D">2 hours 15 minutes</qti-simple-choice>
            </qti-choice-interaction>
          </qti-item-body>
        </qti-assessment-item>`
        },
        {
            publicId: "G5-DAT-01",
            topicCode: "DAT-005-01",
            title: "Finding the Mode",
            text: "Find the mode of this data set: 5, 8, 5, 12, 5, 8, 10",
            type: QuestionType.CHOICE,
            difficulty: DifficultyLevel.DEVELOPING,
            answers: ["B"],
            xml: `
        <qti-assessment-item identifier="g5-dat-01" title="Finding the Mode">
          <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
            <qti-correct-response><qti-value>B</qti-value></qti-correct-response>
          </qti-response-declaration>
          <qti-item-body>
            <p>Find the mode of this data set: 5, 8, 5, 12, 5, 8, 10</p>
            <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
              <qti-simple-choice identifier="A">8</qti-simple-choice>
              <qti-simple-choice identifier="B">5</qti-simple-choice>
              <qti-simple-choice identifier="C">12</qti-simple-choice>
              <qti-simple-choice identifier="D">10</qti-simple-choice>
            </qti-choice-interaction>
          </qti-item-body>
        </qti-assessment-item>`
        }
    ];

    for (const q of questionData) {
        const topic = await prisma.topic.findUnique({
            where: {
                gradeLevelId_code: {
                    gradeLevelId: gradeLevelId,
                    code: q.topicCode
                }
            }
        });

        if (!topic) {
            console.warn(`   ⚠️  Topic not found: ${q.topicCode} for question ${q.publicId}`);
            continue;
        }

        await prisma.question.upsert({
            where: { publicId: q.publicId },
            update: {
                qtiXml: q.xml,
                title: q.title,
                questionText: q.text,
                correctAnswers: q.answers,
                type: q.type,
                difficultyLevel: q.difficulty,
                isActive: true,
                isReviewed: true
            },
            create: {
                publicId: q.publicId,
                qtiXml: q.xml,
                title: q.title,
                questionText: q.text,
                correctAnswers: q.answers,
                type: q.type,
                source: QuestionSource.TEACHER_CREATED,
                difficultyLevel: q.difficulty,
                isActive: true,
                isReviewed: true,
                topics: {
                    create: {
                        topicId: topic.id,
                        isPrimary: true
                    }
                }
            }
        });
    }

    console.log(`   ✅ Seeded ${questionData.length} questions.`);
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