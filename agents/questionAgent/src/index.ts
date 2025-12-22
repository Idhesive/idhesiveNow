import "dotenv/config";
import { createInterface } from "readline";
import { runQuestionAgent } from "./agent.js";

// ============================================================================
// CLI Entry Point
// ============================================================================

async function main() {
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║         idhesive Question Agent - QTI Generation CLI           ║");
    console.log("╠════════════════════════════════════════════════════════════════╣");
    console.log("║ Commands:                                                      ║");
    console.log("║   - Type your request to generate questions                    ║");
    console.log("║   - Type 'exit' or 'quit' to close                             ║");
    console.log("╚════════════════════════════════════════════════════════════════╝");
    console.log("");

    // Check for API key (OpenAI or OpenRouter)
    if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
        console.error("❌ Error: OPENAI_API_KEY or OPENROUTER_API_KEY not set in environment");
        console.error("   Copy env.example to .env and add your API key");
        process.exit(1);
    }

    // Check for DATABASE_URL
    if (!process.env.DATABASE_URL) {
        console.error("❌ Error: DATABASE_URL not set in environment");
        console.error("   Copy env.example to .env and add your database URL");
        process.exit(1);
    }

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const prompt = () => {
        rl.question("\n🎓 You: ", async (input) => {
            const trimmed = input.trim();

            if (!trimmed) {
                prompt();
                return;
            }

            if (trimmed.toLowerCase() === "exit" || trimmed.toLowerCase() === "quit") {
                console.log("\n👋 Goodbye!");
                rl.close();
                process.exit(0);
            }

            try {
                console.log("\n🤔 Thinking...\n");
                const result = await runQuestionAgent(trimmed);
                console.log("\n🤖 Agent:", result.output);
            } catch (error) {
                console.error("\n❌ Error:", error instanceof Error ? error.message : error);
            }

            prompt();
        });
    };

    // Handle single command mode (piped input)
    if (!process.stdin.isTTY) {
        let input = "";
        process.stdin.on("data", (chunk) => {
            input += chunk;
        });
        process.stdin.on("end", async () => {
            if (input.trim()) {
                try {
                    console.log("🤔 Processing...\n");
                    const result = await runQuestionAgent(input.trim());
                    console.log("\n🤖 Agent:", result.output);
                } catch (error) {
                    console.error("❌ Error:", error instanceof Error ? error.message : error);
                    process.exit(1);
                }
            }
            process.exit(0);
        });
    } else {
        prompt();
    }
}

// Run
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
