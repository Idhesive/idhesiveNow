import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating daily challenge...')

  // First, ensure we have an assessment template
  let template = await prisma.assessmentTemplate.findFirst({
    where: { code: 'DAILY_CHALLENGE' },
  })

  if (!template) {
    console.log('Creating assessment template...')
    template = await prisma.assessmentTemplate.create({
      data: {
        code: 'DAILY_CHALLENGE',
        name: 'Daily Challenge',
        description: 'Complete today\'s challenge and compete with friends!',
        assessmentType: 'PRACTICE_SET',
        selectionStrategy: 'RANDOM_FROM_POOL',
        terminationCondition: 'FIXED_COUNT',
        questionLimit: 10,
        timeLimitSeconds: null,
        showFeedbackAfterEach: true,
        showCorrectAnswer: true,
        allowSkip: false,
        allowHints: false,
        showTimer: true,
        isPublic: true,
        isActive: true,
        isRanked: true,
      },
    })
    console.log(`Created template: ${template.name}`)
  }

  // Get or create some questions
  const questionCount = await prisma.question.count({
    where: { isActive: true, isReviewed: true },
  })

  console.log(`Found ${questionCount} active questions in database`)

  let questionIds: string[] = []

  if (questionCount >= 10) {
    // Use existing questions
    const questions = await prisma.question.findMany({
      where: { isActive: true, isReviewed: true },
      take: 10,
      select: { id: true },
    })
    questionIds = questions.map(q => q.id)
  } else {
    // Create sample questions
    console.log('Creating sample questions...')

    const sampleQuestions = [
      {
        title: 'What is 2 + 2?',
        qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">
  <itemBody>
    <p>What is 2 + 2?</p>
    <choiceInteraction responseIdentifier="RESPONSE">
      <simpleChoice identifier="A">3</simpleChoice>
      <simpleChoice identifier="B">4</simpleChoice>
      <simpleChoice identifier="C">5</simpleChoice>
      <simpleChoice identifier="D">6</simpleChoice>
    </choiceInteraction>
  </itemBody>
</assessmentItem>`,
        type: 'MULTIPLE_CHOICE',
        difficultyLevel: 'EASY',
        maxScore: 1,
        correctAnswers: { identifier: 'B' },
      },
      {
        title: 'What is 5 × 3?',
        qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">
  <itemBody>
    <p>What is 5 × 3?</p>
    <choiceInteraction responseIdentifier="RESPONSE">
      <simpleChoice identifier="A">12</simpleChoice>
      <simpleChoice identifier="B">13</simpleChoice>
      <simpleChoice identifier="C">15</simpleChoice>
      <simpleChoice identifier="D">18</simpleChoice>
    </choiceInteraction>
  </itemBody>
</assessmentItem>`,
        type: 'MULTIPLE_CHOICE',
        difficultyLevel: 'EASY',
        maxScore: 1,
        correctAnswers: { identifier: 'C' },
      },
      {
        title: 'What is 10 - 7?',
        qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">
  <itemBody>
    <p>What is 10 - 7?</p>
    <choiceInteraction responseIdentifier="RESPONSE">
      <simpleChoice identifier="A">2</simpleChoice>
      <simpleChoice identifier="B">3</simpleChoice>
      <simpleChoice identifier="C">4</simpleChoice>
      <simpleChoice identifier="D">5</simpleChoice>
    </choiceInteraction>
  </itemBody>
</assessmentItem>`,
        type: 'MULTIPLE_CHOICE',
        difficultyLevel: 'EASY',
        maxScore: 1,
        correctAnswers: { identifier: 'B' },
      },
      {
        title: 'What is 8 ÷ 2?',
        qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">
  <itemBody>
    <p>What is 8 ÷ 2?</p>
    <choiceInteraction responseIdentifier="RESPONSE">
      <simpleChoice identifier="A">2</simpleChoice>
      <simpleChoice identifier="B">3</simpleChoice>
      <simpleChoice identifier="C">4</simpleChoice>
      <simpleChoice identifier="D">6</simpleChoice>
    </choiceInteraction>
  </itemBody>
</assessmentItem>`,
        type: 'MULTIPLE_CHOICE',
        difficultyLevel: 'EASY',
        maxScore: 1,
        correctAnswers: { identifier: 'C' },
      },
      {
        title: 'What is 7 + 8?',
        qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">
  <itemBody>
    <p>What is 7 + 8?</p>
    <choiceInteraction responseIdentifier="RESPONSE">
      <simpleChoice identifier="A">13</simpleChoice>
      <simpleChoice identifier="B">14</simpleChoice>
      <simpleChoice identifier="C">15</simpleChoice>
      <simpleChoice identifier="D">16</simpleChoice>
    </choiceInteraction>
  </itemBody>
</assessmentItem>`,
        type: 'MULTIPLE_CHOICE',
        difficultyLevel: 'EASY',
        maxScore: 1,
        correctAnswers: { identifier: 'C' },
      },
      {
        title: 'What is 6 × 4?',
        qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">
  <itemBody>
    <p>What is 6 × 4?</p>
    <choiceInteraction responseIdentifier="RESPONSE">
      <simpleChoice identifier="A">20</simpleChoice>
      <simpleChoice identifier="B">22</simpleChoice>
      <simpleChoice identifier="C">24</simpleChoice>
      <simpleChoice identifier="D">26</simpleChoice>
    </choiceInteraction>
  </itemBody>
</assessmentItem>`,
        type: 'MULTIPLE_CHOICE',
        difficultyLevel: 'MEDIUM',
        maxScore: 1,
        correctAnswers: { identifier: 'C' },
      },
      {
        title: 'What is 15 - 9?',
        qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">
  <itemBody>
    <p>What is 15 - 9?</p>
    <choiceInteraction responseIdentifier="RESPONSE">
      <simpleChoice identifier="A">5</simpleChoice>
      <simpleChoice identifier="B">6</simpleChoice>
      <simpleChoice identifier="C">7</simpleChoice>
      <simpleChoice identifier="D">8</simpleChoice>
    </choiceInteraction>
  </itemBody>
</assessmentItem>`,
        type: 'MULTIPLE_CHOICE',
        difficultyLevel: 'EASY',
        maxScore: 1,
        correctAnswers: { identifier: 'B' },
      },
      {
        title: 'What is 12 ÷ 3?',
        qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">
  <itemBody>
    <p>What is 12 ÷ 3?</p>
    <choiceInteraction responseIdentifier="RESPONSE">
      <simpleChoice identifier="A">3</simpleChoice>
      <simpleChoice identifier="B">4</simpleChoice>
      <simpleChoice identifier="C">5</simpleChoice>
      <simpleChoice identifier="D">6</simpleChoice>
    </choiceInteraction>
  </itemBody>
</assessmentItem>`,
        type: 'MULTIPLE_CHOICE',
        difficultyLevel: 'EASY',
        maxScore: 1,
        correctAnswers: { identifier: 'B' },
      },
      {
        title: 'What is 9 + 6?',
        qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">
  <itemBody>
    <p>What is 9 + 6?</p>
    <choiceInteraction responseIdentifier="RESPONSE">
      <simpleChoice identifier="A">13</simpleChoice>
      <simpleChoice identifier="B">14</simpleChoice>
      <simpleChoice identifier="C">15</simpleChoice>
      <simpleChoice identifier="D">16</simpleChoice>
    </choiceInteraction>
  </itemBody>
</assessmentItem>`,
        type: 'MULTIPLE_CHOICE',
        difficultyLevel: 'EASY',
        maxScore: 1,
        correctAnswers: { identifier: 'C' },
      },
      {
        title: 'What is 7 × 7?',
        qtiXml: `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">
  <itemBody>
    <p>What is 7 × 7?</p>
    <choiceInteraction responseIdentifier="RESPONSE">
      <simpleChoice identifier="A">42</simpleChoice>
      <simpleChoice identifier="B">45</simpleChoice>
      <simpleChoice identifier="C">48</simpleChoice>
      <simpleChoice identifier="D">49</simpleChoice>
    </choiceInteraction>
  </itemBody>
</assessmentItem>`,
        type: 'MULTIPLE_CHOICE',
        difficultyLevel: 'MEDIUM',
        maxScore: 1,
        correctAnswers: { identifier: 'D' },
      },
    ]

    for (const q of sampleQuestions) {
      const question = await prisma.question.create({
        data: {
          publicId: `Q${Date.now()}-${Math.random().toString(36).substring(7)}`,
          title: q.title,
          qtiXml: q.qtiXml,
          type: q.type as any,
          difficultyLevel: q.difficultyLevel as any,
          maxScore: q.maxScore,
          correctAnswers: q.correctAnswers as any,
          isActive: true,
          isReviewed: true,
        },
      })
      questionIds.push(question.id)
      console.log(`Created question: ${question.title}`)
    }
  }

  // Check if today's challenge already exists
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existing = await prisma.dailyChallenge.findFirst({
    where: {
      challengeDate: today,
      templateId: template.id,
    },
  })

  if (existing) {
    console.log(`Daily challenge already exists for today (ID: ${existing.id})`)
    console.log(`Question count: ${existing.questionIds.length}`)
    return
  }

  // Create today's daily challenge
  const challenge = await prisma.dailyChallenge.create({
    data: {
      challengeDate: today,
      templateId: template.id,
      questionIds: questionIds,
      totalAttempts: 0,
      totalCompletions: 0,
    },
  })

  console.log('\n✅ Daily challenge created successfully!')
  console.log(`Challenge ID: ${challenge.id}`)
  console.log(`Date: ${challenge.challengeDate.toDateString()}`)
  console.log(`Questions: ${challenge.questionIds.length}`)
  console.log(`Template: ${template.name}`)
  console.log('\nYou can now access it at: http://localhost:3000/dashboard/practice/daily')
}

main()
  .catch((e) => {
    console.error('Error creating daily challenge:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
