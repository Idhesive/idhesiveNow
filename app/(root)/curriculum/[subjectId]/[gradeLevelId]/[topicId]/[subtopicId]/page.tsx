
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, FileText, PlayCircle } from 'lucide-react';

export default async function SubtopicPage({
    params
}: {
    params: Promise<{ subjectId: string; gradeLevelId: string; topicId: string; subtopicId: string }>
}) {
    const { subjectId, gradeLevelId, topicId, subtopicId } = await params;

    const subtopic = await prisma.topic.findUnique({
        where: { id: subtopicId },
        include: {
            parent: {
                include: {
                    gradeLevel: { include: { subject: true } }
                }
            },
            tutorialContent: {
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' }
            }
        }
    });

    if (!subtopic || !subtopic.parent) notFound();

    const parentTopic = subtopic.parent;
    const gradeLevel = parentTopic.gradeLevel;
    const subject = gradeLevel.subject;

    return (
        <div className="container py-8">
            <nav className="flex items-center text-sm text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap">
                <Link href="/curriculum" className="hover:text-foreground">Curriculum</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link href={`/curriculum/${subjectId}`} className="hover:text-foreground">{subject.name}</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link href={`/curriculum/${subjectId}/${gradeLevelId}`} className="hover:text-foreground">{gradeLevel.name}</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link href={`/curriculum/${subjectId}/${gradeLevelId}/${topicId}`} className="hover:text-foreground">{parentTopic.name}</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground">{subtopic.name}</span>
            </nav>

            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                            {subtopic.code}
                        </span>
                        <h1 className="text-3xl font-bold">{subtopic.name}</h1>
                    </div>
                    <p className="text-lg text-muted-foreground">{subtopic.description}</p>
                </header>

                {subtopic.tutorialContent.length > 0 ? (
                    <div className="grid gap-6">
                        {subtopic.tutorialContent.map((content) => (
                            <div key={content.id} className="border rounded-xl p-6 bg-card">
                                <div className="flex items-center gap-3 mb-3">
                                    {content.type === 'VIDEO' ? <PlayCircle className="text-primary" /> : <FileText className="text-primary" />}
                                    <h3 className="text-xl font-semibold">{content.title}</h3>
                                </div>
                                <div className="prose dark:prose-invert max-w-none">
                                    {content.description}
                                    {/* Actual content rendering would go here depending on content format */}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border border-dashed rounded-lg">
                        <p className="text-muted-foreground">No content available for this subtopic yet.</p>
                    </div>
                )}

                <div className="mt-8 flex justify-end">
                    <Link
                        href={`/practice?topic=${subtopicId}`}
                        className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
                    >
                        Practice This Subtopic
                    </Link>
                </div>
            </div>
        </div>
    );
}
