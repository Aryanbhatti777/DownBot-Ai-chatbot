import { MessageModel } from "../models/message.model.js";

/** Creates a message for a conversation. */
export async function createMessage({ conversationId, role, content }) {
  return MessageModel.create({
    conversation: conversationId,
    role,
    content
  });
}

/** Retrieves a conversation's messages in chronological order. */
export async function findMessagesByConversation(conversationId) {
  return MessageModel.find({ conversation: conversationId })
}
