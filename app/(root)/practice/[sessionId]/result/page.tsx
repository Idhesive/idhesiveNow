
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default async function ResultPage({
    params
}: {
    params: Promise<{ sessionId: string }>
}) {
    const { sessionId } = await params;

    const session = await prisma.assessmentSession.findUnique({
        where: { id: sessionId },
        include: {
            template: true // To know what kind of session it was
        }
    });

    if (!session) notFound();

    // In a real app we'd fetch responses and calculate score
    // For now showing placeholders
    const score = session.totalScore;
    const maxScore = session.maxPossibleScore || 100;
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    return (
        <div className="container py-12 max-w-3xl">
            <Card className="mb-8 border-t-8 border-t-primary">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-3xl font-bold">Session Complete!</CardTitle>
                    <p className="text-muted-foreground">{session.template?.name || "Practice Session"}</p>
                </CardHeader>
                <CardContent className="text-center pt-6">
                    <div className="flex justify-center items-center gap-8 mb-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary">{score}</div>
                            <div className="text-sm text-muted-foreground">Points</div>
                        </div>
                        <div className="w-px h-12 bg-border" />
                        <div className="text-center">
                            <div className="text-4xl font-bold text-foreground">{percentage}%</div>
                            <div className="text-sm text-muted-foreground">Accuracy</div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Link href="/practice">
                            <Button variant="outline">Back to Practice</Button>
                        </Link>
                        <Link href={`/practice/${sessionId}/review`}>
                            <Button>
                                Review Answers
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
