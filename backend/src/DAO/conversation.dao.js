import { ConversationModel } from "../models/conversation.model.js";

/** Creates a conversation owned by the given user. */
export async function createConversation({ userId, title, lastMessage = "" }) {
  return ConversationModel.create({ user: userId, title, lastMessage });
}

/** Finds a conversation only when it belongs to the given user. */
export async function findConversationById(conversationId, userId) {
  return ConversationModel.findOne({ _id: conversationId, user: userId });
}

/** Lists the user's conversations, newest updated first. */
export async function findConversationsByUser(userId) {
  return ConversationModel.find({ user: userId }).sort({ updatedAt: -1 });
}

/** Updates a conversation's last-message preview and its updated timestamp. */
export async function updateConversationLastMessage(conversationId, userId, lastMessage) {
  return ConversationModel.findOneAndUpdate(
    { _id: conversationId, user: userId },
    { $set: { lastMessage } },
    { new: true, runValidators: true }
  );
}

/** Updates a conversation title when it belongs to the given user. */
export async function updateConversationTitle(conversationId, userId, title) {
  return ConversationModel.findOneAndUpdate(
    { _id: conversationId, user: userId },
    { $set: { title } },
    { new: true, runValidators: true }
  );
}

/** Deletes a conversation only when it belongs to the given user. */
export async function deleteConversation(conversationId, userId) {
  return ConversationModel.findOneAndDelete({ _id: conversationId, user: userId });
}
