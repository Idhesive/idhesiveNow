
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, FileText, PlayCircle, Variable } from 'lucide-react';

export default async function TopicPage({
    params
}: {
    params: Promise<{ subjectId: string; gradeLevelId: string; topicId: string }>
}) {
    const { subjectId, gradeLevelId, topicId } = await params;

    const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        include: {
            gradeLevel: { include: { subject: true } },
            children: { // Subtopics
                orderBy: { sortOrder: 'asc' },
                include: {
                    _count: {
                        select: { tutorialContent: true, questionTopics: true }
                    }
                }
            },
            tutorialContent: { // Direct content
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' }
            }
        }
    });

    if (!topic) notFound();

    return (
        <div className="container py-8">
            <nav className="flex items-center text-sm text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap">
                <Link href="/curriculum" className="hover:text-foreground">Curriculum</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link href={`/curriculum/${subjectId}`} className="hover:text-foreground">{topic.gradeLevel.subject.name}</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link href={`/curriculum/${subjectId}/${gradeLevelId}`} className="hover:text-foreground">{topic.gradeLevel.name}</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground">{topic.name}</span>
            </nav>

            <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
                <div>
                    <header className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                                {topic.code}
                            </span>
                            <h1 className="text-3xl font-bold">{topic.name}</h1>
                        </div>
                        {topic.description && (
                            <p className="text-lg text-muted-foreground">{topic.description}</p>
                        )}
                    </header>

                    {/* Learning Goals */}
                    {topic.learningGoals.length > 0 && (
                        <section className="mb-8 bg-muted/30 p-6 rounded-lg border">
                            <h2 className="font-semibold mb-3 flex items-center">
                                <Variable className="h-4 w-4 mr-2" />
                                Learning Goals
                            </h2>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {topic.learningGoals.map((goal, i) => (
                                    <li key={i}>{goal}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Subtopics List */}
                    {topic.children.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Subtopics</h2>
                            <div className="grid gap-3">
                                {topic.children.map((subtopic) => (
                                    <Link
                                        key={subtopic.id}
                                        href={`/curriculum/${subjectId}/${gradeLevelId}/${topicId}/${subtopic.id}`}
                                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-all"
                                    >
                                        <div>
                                            <div className="font-medium">{subtopic.name}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {subtopic._count.tutorialContent} lessons • {subtopic._count.questionTopics} questions
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Direct Content (if any) */}
                    {topic.tutorialContent.length > 0 && (
                        <section>
                            <h2 className="text-xl font-semibold mb-4">Lessons</h2>
                            <div className="space-y-3">
                                {topic.tutorialContent.map((content) => (
                                    <div key={content.id} className="flex items-start p-4 rounded-lg border gap-4">
                                        <div className="mt-1">
                                            {content.type === 'VIDEO' ? <PlayCircle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{content.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{content.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Practice</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Test your knowledge on this topic with a quick quiz.
                        </p>
                        <Link
                            href={`/practice?topic=${topicId}`}
                            className="w-full inline-flex justify-center items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
                        >
                            Start Practice
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
