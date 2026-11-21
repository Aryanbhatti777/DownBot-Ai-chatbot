import { createConversation, findConversationById } from "../DAO/conversation.dao.js";
import { generateTitle } from "../services/ai/ai.title.service.js";
import { AppError } from "../utils/AppError.js";
import model from "../services/ai/main.service.js";
import { findMessagesByConversation, createMessage } from "../DAO/message.dao.js";
import { AIMessage, HumanMessage } from "langchain";

export const handleMessage = async (req, res, next) => {
    
    const { content, conversation: conversationId } = req.body;

    const user = req.user;

    let conversation = null;

    if (!conversationId) {
        const { title } = await generateTitle(content);

        conversation = await createConversation({ userId: user._id, title })
    } else { 

        conversation = await findConversationById(conversationId, user._id);
        if (!conversation) {
            return next(new AppError(404, 'Conversation not found'))
        }
    }

    const messages = (await findMessagesByConversation(conversation.id)).map(
        msg => {
            if (msg.role === 'user') {
                return new HumanMessage(msg.content)
            } else if (msg.role === 'assistant') {
                return new AIMessage(msg.content)
            }
            return null;
        }
    ).filter(Boolean);

    messages.push(new HumanMessage(content))

    await createMessage({
        role: "user",
        content: content,
        conversationId: conversation.id
    })

    const stream = await model.stream(messages);

    // ---------- set headers for SSE -----------

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive')

    //-------- send conversation details via SSE

    res.write(`data: ${JSON.stringify({ conversationId: conversation.id, title: conversation.title })}\n\n`);

    let aiChunk = null;
    for await (const chunk of stream) {
        if (aiChunk == null) {
            aiChunk = chunk;
        } else {
            aiChunk = aiChunk.concat(chunk);
        }

        res.write(`data: ${JSON.stringify({ chunk: chunk.content })}\n\n`);
    }

    res.end();

    await createMessage({
        role: "assistant", 
        content: aiChunk.content,
        conversationId: conversation._id
    })


}