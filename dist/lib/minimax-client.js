// lib/minimax-client.ts
import { LLMClient } from "@browserbasehq/stagehand";
import fetch from "node-fetch";
export class MiniMaxClient extends LLMClient {
    apiKey;
    model;
    constructor() {
        super("abab-6.5-chat"); // or whatever your MiniMax dashboard shows
        this.apiKey = process.env.MINIMAX_API_KEY;
        this.model = "abab-6.5-chat"; // check your MiniMax console for exact string
    }
    async createChatCompletion(options) {
        const { messages, tools = [], toolChoice = "auto", temperature = 0.3, } = options;
        const body = {
            model: this.model,
            messages,
            tools,
            tool_choice: toolChoice,
            temperature,
            max_tokens: 4096,
        };
        const response = await fetch("https://api.minimax.io/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`MiniMax API error ${response.status}: ${text}`);
        }
        const result = await response.json();
        return result;
    }
}
