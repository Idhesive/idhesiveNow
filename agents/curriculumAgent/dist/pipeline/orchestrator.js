import { prisma } from '../db/prisma.js';
import { StepStatus } from '@prisma/client';
export class PipelineOrchestrator {
    async initPipeline(documentId) {
        const steps = ['PARSE', 'SPLIT', 'DB_SYNC', 'GRAPH_SYNC', 'RAG_SYNC'];
        await prisma.documentProcessingStep.createMany({
            data: steps.map(step => ({
                documentId,
                step,
                status: StepStatus.PENDING,
            })),
            skipDuplicates: true,
        });
    }
    async runStep(documentId, step, task) {
        await prisma.documentProcessingStep.update({
            where: { documentId_step: { documentId, step } },
            data: { status: 'IN_PROGRESS', startedAt: new Date() },
        });
        try {
            const result = await task();
            await prisma.documentProcessingStep.update({
                where: { documentId_step: { documentId, step } },
                data: { status: 'COMPLETED', completedAt: new Date() },
            });
            return result;
        }
        catch (error) {
            await prisma.documentProcessingStep.update({
                where: { documentId_step: { documentId, step } },
                data: {
                    status: 'FAILED',
                    logs: error instanceof Error ? error.message : String(error)
                },
            });
            throw error;
        }
    }
}
export const pipelineOrchestrator = new PipelineOrchestrator();
