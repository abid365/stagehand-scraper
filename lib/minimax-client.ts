// lib/minimax-client.ts
import { LLMClient } from "@browserbasehq/stagehand";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic(); // Anthropic will read ANTHROPIC_API_KEY + ANTHROPIC_BASE_URL automatically

export class MiniMaxClient extends LLMClient {
  constructor() {
    super("MiniMax-M2.7"); // or abab-6.5-chat, depending on your plan
  }

  async createChatCompletion<T>(options: any): Promise<T> {
    const {
      messages,
      tools = [],
      tool_choice = "auto",
      temperature = 0.3,
    } = options;

    const result = await anthropic.messages.create({
      model: this.modelName, // MiniMax‑M2.7 or abab‑6.5‑chat
      messages,
      tools,
      tool_choice,
      temperature,
      max_tokens: 4096,
    });

    return result as unknown as T;
  }
}
