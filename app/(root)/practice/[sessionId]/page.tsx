
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ClientAssessmentPlayer from '@/components/quiz/ClientAssessmentPlayer';
import type { QuestionData } from '@/lib/quiz/types';

export default async function SessionPage({
    params
}: {
    params: Promise<{ sessionId: string }>
}) {
    const { sessionId } = await params;

    const session = await prisma.assessmentSession.findUnique({
        where: { id: sessionId },
        include: {
            questionOrder: {
                orderBy: { position: 'asc' },
                include: {
                    question: true
                }
            }
        }
    });

    if (!session) notFound();

    // Map to QuestionData
    // Note: We need to handle mapping the QuestionType enum to the string union type
    const questions: QuestionData[] = session.questionOrder.map(order => {
        let type: QuestionData['type'] = 'choice'; // Default fallback

        // Simple mapping - can be expanded
        switch (order.question.type) {
            case 'CHOICE': type = 'choice'; break;
            case 'TEXT_ENTRY': type = 'textEntry'; break;
            case 'EXTENDED_TEXT': type = 'extendedText'; break;
            case 'GAP_MATCH': type = 'gapMatch'; break;
            default: type = 'choice';
        }

        return {
            id: order.question.id,
            type: type,
            title: order.question.title,
            xmlContent: order.question.qtiXml,
            points: order.question.maxScore
        };
    });

    return (
        <div className="min-h-screen bg-muted/10">
            <ClientAssessmentPlayer
                sessionId={sessionId}
                initialQuestions={questions}
            />
        </div>
    );
}
