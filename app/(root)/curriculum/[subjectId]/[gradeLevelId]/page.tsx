
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, BookOpen } from 'lucide-react';

export default async function GradeLevelPage({ params }: { params: Promise<{ subjectId: string; gradeLevelId: string }> }) {
    const { subjectId, gradeLevelId } = await params;

    const gradeLevel = await prisma.gradeLevel.findUnique({
        where: { id: gradeLevelId },
        include: {
            subject: true,
            topics: {
                where: { parentId: null }, // Only top-level topics
                orderBy: { sortOrder: 'asc' },
                include: {
                    children: {
                        orderBy: { sortOrder: 'asc' },
                        select: { id: true, name: true, code: true }
                    }
                }
            }
        }
    });

    if (!gradeLevel) {
        notFound();
    }

    return (
        <div className="container py-8">
            <nav className="flex items-center text-sm text-muted-foreground mb-6">
                <Link href="/curriculum" className="hover:text-foreground">Curriculum</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link href={`/curriculum/${subjectId}`} className="hover:text-foreground">{gradeLevel.subject.name}</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground">{gradeLevel.name}</span>
            </nav>

            <div className="mb-8">
                <h1 className="text-3xl font-bold">{gradeLevel.name} Topics</h1>
                <p className="text-muted-foreground mt-2">{gradeLevel.description || `Explore topics for ${gradeLevel.name}`}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {gradeLevel.topics.map((topic) => (
                    <div key={topic.id} className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                                    {topic.code}
                                </span>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Link
                                href={`/curriculum/${subjectId}/${gradeLevelId}/${topic.id}`}
                                className="text-xl font-semibold hover:underline block mb-2"
                            >
                                {topic.name}
                            </Link>
                            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                {topic.description || "No description available."}
                            </p>
                        </div>
                        {topic.children.length > 0 && (
                            <div className="px-6 pb-6 pt-0 mt-auto">
                                <div className="h-px bg-border mb-4" />
                                <p className="text-xs text-muted-foreground font-medium mb-2 uppercase">Includes:</p>
                                <ul className="text-sm space-y-1">
                                    {topic.children.slice(0, 3).map(sub => (
                                        <li key={sub.id} className="flex items-center">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mr-2" />
                                            {sub.name}
                                        </li>
                                    ))}
                                    {topic.children.length > 3 && (
                                        <li className="text-muted-foreground italic text-xs pl-3.5">
                                            + {topic.children.length - 3} more
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
