import { createConversation, findConversationById, findConversationByUser } from "../DAO/conversation.dao.js";
import { generateTitle } from "../services/ai/ai.title.service.js";
import { AppError } from "../utils/AppError.js";
import model from "../services/ai/main.service.js";
import { findMessagesByConversation, createMessage } from "../DAO/message.dao.js";
import { AIMessage, HumanMessage, SystemMessage } from "langchain";
import { sendSuccess } from "../utils/apiResponse.js";

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

    const stream = await model.stream([
        new SystemMessage(`
            - Your name is Downbot.
            -You speak in Cavemen language
            `),
        ...messages
    ]);

    // ---------- set headers for SSE -----------

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive')

    //-------- send conversation details via SSE

    res.write(`data: ${JSON.stringify({ conversationId: conversation.id, title: conversation.title })}\n\n`);

    let aiChunk = null;
    for await (const chunk of stream) {
        process.stdout.write(chunk.text);
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

export const getAllConversations = async (req, res, next) => {

    const user = req.user

    const convs = await findConversationByUser(user._id);

    return sendSuccess(res, 200, 'Conversationsfetchedsuccessfully', {convs})
}

export const getMessagesByConversation = async (req, res, next) => {
    
    const id = req.params.id;
    const user = req.user;

    const conv = await findConversationById({ conversationId: id, user: user._id });

    if (!conv) {
        return next(new AppError(404, 'Conversation not found'));
    }

    const messages = await findMessagesByConversation(id);

    return sendSuccess(res, 200, "Messages fetched successfully", messages)
}

