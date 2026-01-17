import { prisma } from '../db/prisma.js';
import { PipelineStep, StepStatus } from '@prisma/client';

export class PipelineOrchestrator {
    async initPipeline(documentId: string) {
        const steps: PipelineStep[] = ['PARSE', 'SPLIT', 'DB_SYNC', 'GRAPH_SYNC', 'RAG_SYNC'];

        await prisma.documentProcessingStep.createMany({
            data: steps.map(step => ({
                documentId,
                step,
                status: StepStatus.PENDING,
            })),
            skipDuplicates: true,
        });
    }

    async runStep(documentId: string, step: PipelineStep, task: () => Promise<any>) {
        await prisma.documentProcessingStep.update({
            where: { documentId_step: { documentId, step } },
            data: { status: 'IN_PROGRESS', startedAt: new Date(), logs: null },
        });

        try {
            const result = await task();
            await prisma.documentProcessingStep.update({
                where: { documentId_step: { documentId, step } },
                data: { status: 'COMPLETED', completedAt: new Date() },
            });
            return result;
        } catch (error) {
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

    async resetPipeline(documentId: string) {
        await prisma.$transaction([
            prisma.documentProcessingStep.updateMany({
                where: { documentId },
                data: {
                    status: StepStatus.PENDING,
                    startedAt: null,
                    completedAt: null,
                    logs: null
                },
            }),
            prisma.curriculumDocument.update({
                where: { id: documentId },
                data: { status: 'UPLOADED' },
            }),
        ]);
    }

    async resetStep(documentId: string, step: PipelineStep) {
        await prisma.documentProcessingStep.update({
            where: { documentId_step: { documentId, step } },
            data: {
                status: StepStatus.PENDING,
                startedAt: null,
                completedAt: null,
                logs: null
            },
        });
    }
}

export const pipelineOrchestrator = new PipelineOrchestrator();
