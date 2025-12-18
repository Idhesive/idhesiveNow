import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Complete QTI 3.0 structure with proper response declarations
const createQtiXml = (question: string, choices: { id: string; text: string; correct: boolean }[]) => {
  const correctId = choices.find(c => c.correct)?.id || 'A'

  return `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item
  xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
  identifier="item-${Date.now()}"
  time-dependent="false"
  adaptive="false"
  xml:lang="en-US">

  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>${correctId}</qti-value>
    </qti-correct-response>
  </qti-response-declaration>

  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>

  <qti-item-body>
    <p>${question}</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
      ${choices.map(choice => `<qti-simple-choice identifier="${choice.id}">${choice.text}</qti-simple-choice>`).join('\n      ')}
    </qti-choice-interaction>
  </qti-item-body>

  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`
}

async function main() {
  console.log('Fixing QTI questions...')

  const sampleQuestions = [
    {
      title: 'What is 2 + 2?',
      question: 'What is 2 + 2?',
      choices: [
        { id: 'ChoiceA', text: '3', correct: false },
        { id: 'ChoiceB', text: '4', correct: true },
        { id: 'ChoiceC', text: '5', correct: false },
        { id: 'ChoiceD', text: '6', correct: false },
      ],
    },
    {
      title: 'What is 5 × 3?',
      question: 'What is 5 × 3?',
      choices: [
        { id: 'ChoiceA', text: '12', correct: false },
        { id: 'ChoiceB', text: '13', correct: false },
        { id: 'ChoiceC', text: '15', correct: true },
        { id: 'ChoiceD', text: '18', correct: false },
      ],
    },
    {
      title: 'What is 10 - 7?',
      question: 'What is 10 - 7?',
      choices: [
        { id: 'ChoiceA', text: '2', correct: false },
        { id: 'ChoiceB', text: '3', correct: true },
        { id: 'ChoiceC', text: '4', correct: false },
        { id: 'ChoiceD', text: '5', correct: false },
      ],
    },
    {
      title: 'What is 8 ÷ 2?',
      question: 'What is 8 ÷ 2?',
      choices: [
        { id: 'ChoiceA', text: '2', correct: false },
        { id: 'ChoiceB', text: '3', correct: false },
        { id: 'ChoiceC', text: '4', correct: true },
        { id: 'ChoiceD', text: '6', correct: false },
      ],
    },
    {
      title: 'What is 7 + 8?',
      question: 'What is 7 + 8?',
      choices: [
        { id: 'ChoiceA', text: '13', correct: false },
        { id: 'ChoiceB', text: '14', correct: false },
        { id: 'ChoiceC', text: '15', correct: true },
        { id: 'ChoiceD', text: '16', correct: false },
      ],
    },
    {
      title: 'What is 6 × 4?',
      question: 'What is 6 × 4?',
      choices: [
        { id: 'ChoiceA', text: '20', correct: false },
        { id: 'ChoiceB', text: '22', correct: false },
        { id: 'ChoiceC', text: '24', correct: true },
        { id: 'ChoiceD', text: '26', correct: false },
      ],
    },
    {
      title: 'What is 15 - 9?',
      question: 'What is 15 - 9?',
      choices: [
        { id: 'ChoiceA', text: '5', correct: false },
        { id: 'ChoiceB', text: '6', correct: true },
        { id: 'ChoiceC', text: '7', correct: false },
        { id: 'ChoiceD', text: '8', correct: false },
      ],
    },
    {
      title: 'What is 12 ÷ 3?',
      question: 'What is 12 ÷ 3?',
      choices: [
        { id: 'ChoiceA', text: '3', correct: false },
        { id: 'ChoiceB', text: '4', correct: true },
        { id: 'ChoiceC', text: '5', correct: false },
        { id: 'ChoiceD', text: '6', correct: false },
      ],
    },
    {
      title: 'What is 9 + 6?',
      question: 'What is 9 + 6?',
      choices: [
        { id: 'ChoiceA', text: '13', correct: false },
        { id: 'ChoiceB', text: '14', correct: false },
        { id: 'ChoiceC', text: '15', correct: true },
        { id: 'ChoiceD', text: '16', correct: false },
      ],
    },
    {
      title: 'What is 7 × 7?',
      question: 'What is 7 × 7?',
      choices: [
        { id: 'ChoiceA', text: '42', correct: false },
        { id: 'ChoiceB', text: '45', correct: false },
        { id: 'ChoiceC', text: '48', correct: false },
        { id: 'ChoiceD', text: '49', correct: true },
      ],
    },
  ]

  // Find and update questions
  for (const sq of sampleQuestions) {
    const questions = await prisma.question.findMany({
      where: {
        title: sq.title,
        isActive: true,
      },
      take: 1,
    })

    if (questions.length > 0) {
      const question = questions[0]
      const correctChoice = sq.choices.find(c => c.correct)

      await prisma.question.update({
        where: { id: question.id },
        data: {
          qtiXml: createQtiXml(sq.question, sq.choices),
          correctAnswers: { identifier: correctChoice?.id || 'B' } as any,
        },
      })

      console.log(`✓ Updated: ${sq.title}`)
    }
  }

  console.log('\n✅ All questions updated with proper QTI 3.0 format!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
