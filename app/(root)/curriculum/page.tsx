
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function CurriculumPage() {
    const subjects = await prisma.subject.findMany({
        include: {
            curriculum: true,
            gradeLevels: true,
        },
        orderBy: {
            name: 'asc',
        },
    });

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-6">Curriculum</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                    <Link
                        key={subject.id}
                        href={`/curriculum/${subject.id}`}
                        className="block p-6 rounded-lg border hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">{subject.curriculum.code}</span>
                            {subject.icon && <span className="text-2xl">{subject.icon}</span>}
                        </div>
                        <h2 className="text-xl font-semibold mb-2">{subject.name}</h2>
                        <p className="text-muted-foreground line-clamp-2">{subject.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {subject.gradeLevels.map(grade => (
                                <span key={grade.id} className="text-xs bg-secondary px-2 py-1 rounded">
                                    {grade.name}
                                </span>
                            ))}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
