import 'dotenv/config';
import { pipelineOrchestrator } from './pipeline/orchestrator.js';
import { pdfParser } from './parser/pdf-parser.js';
import { graphService } from './db/graph.js';
import { ragService } from './rag/index.js';
import { prisma } from './db/prisma.js';
async function processDocument(documentId) {
    console.log(`Starting process for document: ${documentId}`);
    const document = await prisma.curriculumDocument.findUnique({
        where: { id: documentId }
    });
    if (!document || !document.fileUrl) {
        throw new Error(`Document not found or has no file URL: ${documentId}`);
    }
    await prisma.curriculumDocument.update({
        where: { id: documentId },
        data: { status: 'PROCESSING' }
    });
    try {
        // 1. PARSE
        const pdfData = await pipelineOrchestrator.runStep(documentId, 'PARSE', async () => {
            return await pdfParser.parse(document.fileUrl);
        });
        // 2. SPLIT (Simplified for now)
        await pipelineOrchestrator.runStep(documentId, 'SPLIT', async () => {
            console.log(`Parsed ${pdfData.numPages} pages.`);
            // TODO: Implement actual splitting logic
        });
        // 3. DB_SYNC
        await pipelineOrchestrator.runStep(documentId, 'DB_SYNC', async () => {
            // TODO: Extract subjects/topics and update Prisma standard models
        });
        // 4. GRAPH_SYNC
        await pipelineOrchestrator.runStep(documentId, 'GRAPH_SYNC', async () => {
            await graphService.connect();
            // TODO: Cypher queries to build the graph
            await graphService.close();
        });
        // 5. RAG_SYNC
        await pipelineOrchestrator.runStep(documentId, 'RAG_SYNC', async () => {
            await ragService.embedAndStore(pdfData.text, { documentId });
        });
        await prisma.curriculumDocument.update({
            where: { id: documentId },
            data: { status: 'COMPLETED' }
        });
    }
    catch (error) {
        console.error('Pipeline failed:', error);
        await prisma.curriculumDocument.update({
            where: { id: documentId },
            data: { status: 'FAILED' }
        });
    }
}
const docId = process.argv[2];
if (docId) {
    processDocument(docId).catch(console.error);
}
else {
    console.log('Usage: node dist/index.js <documentId>');
}
