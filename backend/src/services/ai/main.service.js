import { ChatGroq } from "@langchain/groq";
import { config } from "../../config/env.js";
import { ChatCohere } from '@langchain/cohere';
import {ChatOpenAI} from '@langchain/openai'

const model = new ChatOpenAI({
    model : "command-a-plus-05-2026",
    apiKey: config.COHERE_API_KEY,
    configuration: {
        baseURL: "https://api.cohere.ai/compatibility/v1"
    }
})

export default model