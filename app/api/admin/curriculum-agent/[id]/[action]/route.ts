
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { pipelineOrchestrator } from '@/agents/curriculumAgent/src/pipeline/orchestrator';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string, action: string } }
) {
    const { id, action } = params;

    try {
        if (action === 'reset') {
            await pipelineOrchestrator.resetPipeline(id);
            return NextResponse.json({ success: true });
        }

        if (action === 'rerun') {
            await pipelineOrchestrator.resetPipeline(id);
            // Trigger background processing
            // In a real app, this would be a message queue or a long-running process
            // For now, we'll just log it. The user will need to run the agent manually or we'll trigger via spawn
            console.log(`[CurriculumAgent] Rerunning pipeline for ${id}`);

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Action API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
