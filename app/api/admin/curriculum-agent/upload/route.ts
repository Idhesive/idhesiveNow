
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { pipelineOrchestrator } from '@/agents/curriculumAgent/src/pipeline/orchestrator'; // Wait, this might fail in Next.js build due to file extensions or paths

// Helper to save file locally for processing
async function saveFile(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public/uploads/curriculum');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, `${Date.now()}-${file.name}`);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const filePath = await saveFile(file);

        // 1. Create document record
        const doc = await prisma.curriculumDocument.create({
            data: {
                filename: file.name,
                fileUrl: filePath,
                mimeType: file.type,
                size: file.size,
                status: 'UPLOADED',
            }
        });

        // 2. Initialize steps (Note: orchestrator might need to be imported differently or triggered as a background job)
        // For now, we'll just create the steps here directly to avoid complex agent importing in Next.js 
        const steps = ['PARSE', 'SPLIT', 'DB_SYNC', 'GRAPH_SYNC', 'RAG_SYNC'];
        await prisma.documentProcessingStep.createMany({
            data: steps.map(step => ({
                documentId: doc.id,
                step: step as any,
                status: 'PENDING',
            }))
        });

        // 3. Trigger processing (TODO: Implement background worker or invoke agent)
        console.log(`[CurriculumAgent] Document ${doc.id} ready for processing at ${filePath}`);

        return NextResponse.json({ success: true, documentId: doc.id });
    } catch (error) {
        console.error('Upload API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
