
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default async function AdminCurriculumPage() {
    const curricula = await prisma.curriculum.findMany({
        include: {
            country: true,
            _count: {
                select: { subjects: true }
            }
        }
    });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Curriculum Management</h1>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Curriculum
                </Button>
            </div>

            <div className="grid gap-6">
                {curricula.map(curriculum => (
                    <Card key={curriculum.id}>
                        <CardHeader>
                            <div className="flex justify-between">
                                <div>
                                    <CardTitle>{curriculum.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{curriculum.country.name} • {curriculum.code}</p>
                                </div>
                                <Button variant="outline" size="sm">Edit</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <div className="text-sm">
                                    <span className="font-semibold">{curriculum._count.subjects}</span> Subjects
                                </div>
                                <Link href={`/admin/curriculum/${curriculum.id}`} className="text-sm text-primary hover:underline">
                                    Manage Structure &rarr;
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {curricula.length === 0 && (
                    <div className="text-center py-12 border rounded-lg bg-muted/20">
                        <p>No curricula found. Create one to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
