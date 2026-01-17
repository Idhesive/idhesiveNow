-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PipelineStep" AS ENUM ('PARSE', 'SPLIT', 'DB_SYNC', 'GRAPH_SYNC', 'RAG_SYNC');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "curriculum_document" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileUrl" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_processing_step" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "step" "PipelineStep" NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'PENDING',
    "logs" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_processing_step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_knowledge" (
    "id" TEXT NOT NULL,
    "documentId" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_knowledge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_processing_step_documentId_step_key" ON "document_processing_step"("documentId", "step");

-- AddForeignKey
ALTER TABLE "learner_knowledge_state" ADD CONSTRAINT "learner_knowledge_state_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_processing_step" ADD CONSTRAINT "document_processing_step_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "curriculum_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
