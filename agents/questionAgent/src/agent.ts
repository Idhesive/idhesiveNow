import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { PromptTemplate } from "@langchain/core/prompts";
import { databaseTools } from "./tools/database.js";
import { qtiTools } from "./tools/qti-generator.js";
import { SYSTEM_PROMPT } from "./prompts/system.js";

// ============================================================================
// Create the Question Agent
// ============================================================================

export async function createQuestionAgent() {
    // Initialize the LLM
    const llm = new ChatOpenAI({
        apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
        modelName: process.env.MODEL_NAME || "openai/gpt-4o-mini",
        temperature: 0.7,
        configuration: {
            baseURL: process.env.OPENROUTER_API_KEY
                ? "https://openrouter.ai/api/v1"
                : undefined,
            defaultHeaders: process.env.OPENROUTER_API_KEY
                ? {
                    "HTTP-Referer": "http://localhost",
                    "X-Title": "idhesive Question Agent",
                }
                : undefined,
        },
        modelKwargs: {
            stop: ["Observation:"],
        },
    });

    // Combine all tools
    const tools = [...databaseTools, ...qtiTools];

    // Create a ReAct prompt that includes our system context
    const toolNames = tools.map((t) => t.name).join(", ");
    const toolDescriptions = tools.map((t) => `${t.name}: ${t.description}`).join("\n");

    const prompt = PromptTemplate.fromTemplate(`${SYSTEM_PROMPT}

You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}`);

    // Create a ReAct agent (works with models that don't support function calling)
    const agent = await createReactAgent({
        llm,
        tools,
        prompt,
    });

    // Create the executor with error handling
    const executor = new AgentExecutor({
        agent,
        tools,
        verbose: true,
        returnIntermediateSteps: true,
        maxIterations: 15,
        handleParsingErrors: true, // Treat parsing errors as the final answer
    });

    return executor;
}

// ============================================================================
// Run the Agent with a Query
// ============================================================================

export async function runQuestionAgent(query: string): Promise<{
    output: string;
    intermediateSteps: unknown[];
}> {
    const executor = await createQuestionAgent();

    const result = await executor.invoke({
        input: query,
    });

    return {
        output: result.output,
        intermediateSteps: result.intermediateSteps || [],
    };
}
