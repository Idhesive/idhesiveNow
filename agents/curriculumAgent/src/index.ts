import 'dotenv/config';
import { pipelineOrchestrator } from './pipeline/orchestrator.js';
import { pdfParser } from './parser/pdf-parser.js';
import { llmExtractor } from './parser/llm-extractor.js';
import { graphService } from './db/graph.js';
import { ragService } from './rag/index.js';
import { prisma } from './db/prisma.js';

async function processDocument(documentId: string) {
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
            return await pdfParser.parse(document.fileUrl!);
        });

        // 2. EXTRACT (New Step using LLM)
        const extractedData = await pipelineOrchestrator.runStep(documentId, 'SPLIT', async () => {
            const data = await llmExtractor.extract(pdfData.text);
            await prisma.curriculumDocument.update({
                where: { id: documentId },
                data: { metadata: data as any }
            });
            return data;
        });

        // 3. DB_SYNC
        await pipelineOrchestrator.runStep(documentId, 'DB_SYNC', async () => {
            // Find or create Country (assuming ZA for now)
            const country = await prisma.country.upsert({
                where: { code: 'ZA' },
                update: {},
                create: { code: 'ZA', name: 'South Africa' }
            });

            // Find or create Curriculum (assuming CAPS for now)
            const curriculum = await prisma.curriculum.upsert({
                where: { code: 'CAPS' },
                update: {},
                create: {
                    code: 'CAPS',
                    name: 'Curriculum and Assessment Policy Statement',
                    countryId: country.id
                }
            });

            // Find or create Subject
            const subject = await prisma.subject.upsert({
                where: { curriculumId_code: { curriculumId: curriculum.id, code: extractedData.subject.toUpperCase() } },
                update: {},
                create: {
                    curriculumId: curriculum.id,
                    code: extractedData.subject.toUpperCase(),
                    name: extractedData.subject
                }
            });

            // Find or create GradeLevel
            const gradeMatch = extractedData.grade.match(/\d+/);
            const gradeInt = gradeMatch ? parseInt(gradeMatch[0]) : 0;
            const gradeLevel = await prisma.gradeLevel.upsert({
                where: { subjectId_grade: { subjectId: subject.id, grade: gradeInt } },
                update: {},
                create: {
                    subjectId: subject.id,
                    grade: gradeInt,
                    name: extractedData.grade
                }
            });

            // Sync Topics and Subtopics
            for (const topicData of extractedData.topics) {
                const topic = await prisma.topic.upsert({
                    where: { gradeLevelId_code: { gradeLevelId: gradeLevel.id, code: topicData.code || topicData.name.toUpperCase().replace(/\s+/g, '_') } },
                    update: { name: topicData.name, description: topicData.description },
                    create: {
                        gradeLevelId: gradeLevel.id,
                        code: topicData.code || topicData.name.toUpperCase().replace(/\s+/g, '_'),
                        name: topicData.name,
                        description: topicData.description
                    }
                });

                for (const subtopicData of topicData.subtopics) {
                    await prisma.topic.upsert({
                        where: { gradeLevelId_code: { gradeLevelId: gradeLevel.id, code: `${topic.code}_${subtopicData.name.toUpperCase().replace(/\s+/g, '_')}` } },
                        update: {
                            name: subtopicData.name,
                            description: subtopicData.description,
                            learningGoals: subtopicData.learningGoals || []
                        },
                        create: {
                            gradeLevelId: gradeLevel.id,
                            parentId: topic.id,
                            code: `${topic.code}_${subtopicData.name.toUpperCase().replace(/\s+/g, '_')}`,
                            name: subtopicData.name,
                            description: subtopicData.description,
                            learningGoals: subtopicData.learningGoals || []
                        }
                    });
                }
            }
        });

        // 4. GRAPH_SYNC
        await pipelineOrchestrator.runStep(documentId, 'GRAPH_SYNC', async () => {
            await graphService.connect();
            // TODO: Cypher queries to build the graph based on extractedData
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

    } catch (error) {
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
} else {
    console.log('Usage: node dist/index.js <documentId>');
}
