
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const documents = await prisma.curriculumDocument.findMany({
            include: {
                steps: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(documents);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
