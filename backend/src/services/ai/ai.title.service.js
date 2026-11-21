import { ChatGroq } from "@langchain/groq";
import { config } from '../../config/env.js'
import * as z from 'zod'
import { SystemMessage, HumanMessage } from "langchain";

const model = new ChatGroq({
    model: "qwen/qwen3.8-27b",
    apiKey: config.GROQ_API_KEY
})

const structureModel = model.withStructuredOutput(z.object({
    title: z.string().min(1).max(60).describe("The title of conversaton based on user message")
}));

export async function generateTitle(message) {
    const SystemMessage = new SystemMessage(`
        You are an AI assistant that generates a concise and relevant title for a conversation based on the user's message.

        ## Follow these guidelines:
        - The title should be concise and relevant to the user's message.
        - The title should be no longer than 60 characters.
        - Avoid using generic titles like "Chat" or "Conversation".
        - Focus on the main topic or intent of the user's message.
        
        `)
    
    const HumanMessage = new HumanMessage(message);

    const res = await structureModel.invoke([SystemMessage, HumanMessage]);

    return response
}