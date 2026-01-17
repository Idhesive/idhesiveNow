
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export default async function SubjectPage({ params }: { params: Promise<{ subjectId: string }> }) {
    const { subjectId } = await params;
    const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        include: {
            curriculum: true,
            gradeLevels: {
                orderBy: { grade: 'asc' },
                include: {
                    _count: {
                        select: { topics: true }
                    }
                }
            },
        },
    });

    if (!subject) {
        notFound();
    }

    return (
        <div className="container py-8">
            <nav className="flex items-center text-sm text-muted-foreground mb-6">
                <Link href="/curriculum" className="hover:text-foreground">Curriculum</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground">{subject.name}</span>
            </nav>

            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    {subject.icon && <span>{subject.icon}</span>}
                    {subject.name}
                </h1>
                <p className="text-muted-foreground mt-2">{subject.description}</p>
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-secondary text-sm">
                    {subject.curriculum.name} ({subject.curriculum.code})
                </div>
            </div>

            <div className="grid gap-4">
                <h2 className="text-xl font-semibold">Grade Levels</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subject.gradeLevels.map((grade) => (
                        <Link
                            key={grade.id}
                            href={`/curriculum/${subject.id}/${grade.id}`}
                            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                            <div>
                                <span className="font-medium">{grade.name}</span>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {grade._count.topics} Topics
                                </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
