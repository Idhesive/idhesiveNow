import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

const curriculumSchema = z.object({
    subject: z.string().describe("The name of the subject (e.g., Mathematics, English)"),
    grade: z.string().describe("The grade level (e.g., Grade 4, Grade 7)"),
    topics: z.array(z.object({
        name: z.string().describe("The name of the topic"),
        code: z.string().describe("The unique code for the topic if available"),
        description: z.string().optional().describe("A brief description of the topic"),
        subtopics: z.array(z.object({
            name: z.string().describe("The name of the subtopic"),
            description: z.string().optional().describe("A brief description of the subtopic"),
            learningGoals: z.array(z.string()).optional().describe("List of learning objectives")
        }))
    }))
});

export class LLMExtractor {
    private model: ChatOpenAI;
    private parser: StructuredOutputParser<typeof curriculumSchema>;

    constructor() {
        this.model = new ChatOpenAI({
            apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
            modelName: process.env.MODEL_NAME || "openai/gpt-4o",
            temperature: 0,
            configuration: {
                baseURL: process.env.OPENROUTER_API_KEY ? "https://openrouter.ai/api/v1" : undefined,
            }
        });
        this.parser = StructuredOutputParser.fromZodSchema(curriculumSchema);
    }

    async extract(text: string) {
        const formatInstructions = this.parser.getFormatInstructions();
        const prompt = new PromptTemplate({
            template: "Extract structured curriculum information from the following text.\n{format_instructions}\nText: {text}",
            inputVariables: ["text"],
            partialVariables: { format_instructions: formatInstructions },
        });

        const input = await prompt.format({ text: text.substring(0, 10000) }); // Limit text for now
        const response = await this.model.invoke(input);
        return await this.parser.parse(response.content as string);
    }
}

export const llmExtractor = new LLMExtractor();
