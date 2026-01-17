
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default async function AdminAssessmentsPage() {
    const templates = await prisma.assessmentTemplate.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Assessment Templates</h1>
                <Link href="/admin/assessments/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Template
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map(template => (
                    <Card key={template.id}>
                        <CardContent className="pt-6">
                            <h3 className="font-semibold text-lg">{template.name}</h3>
                            <div className="text-xs font-mono text-muted-foreground mb-2">{template.code}</div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                {template.description || "No description"}
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="w-full">Edit</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {templates.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No templates defined.
                    </div>
                )}
            </div>
        </div>
    );
}
