
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus, Search } from 'lucide-react';

export default async function AdminQuestionsPage({
    searchParams
}: {
    searchParams: Promise<{ q: string }>
}) {
    const { q } = await searchParams;

    const questions = await prisma.question.findMany({
        where: {
            title: {
                contains: q || '',
                mode: 'insensitive' // Requires pg_trgm but usually works with standard index for contains
            }
        },
        take: 20,
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Question Bank</h1>
                <Link href="/admin/questions/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Question
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <form className="relative max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        name="q"
                        placeholder="Search questions..."
                        className="pl-8"
                        defaultValue={q}
                    />
                </form>
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {questions.length > 0 ? (
                            questions.map(question => (
                                <TableRow key={question.id}>
                                    <TableCell className="font-medium">{question.title}</TableCell>
                                    <TableCell>{question.type}</TableCell>
                                    <TableCell>{question.difficultyLevel}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${question.isActive ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/10'}`}>
                                            {question.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/questions/${question.id}`}>
                                            <Button variant="ghost" size="sm">Edit</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No questions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
