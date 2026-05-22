const prisma = require("../config/db");
const geminiService = require("./geminiService");

async function chatWithAssistant({ userId, message, context, history = [] }) {
  const persisted = await prisma.aIConversation.findMany({
    where: { userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 10
  });

  const persistedMessages = persisted
    .reverse()
    .map((entry) => ({
      role: entry.role === "ASSISTANT" ? "assistant" : "user",
      content: entry.message
    }));

  const clientHistory = history
    .slice(-6)
    .map((entry) => ({ role: entry.role, content: entry.content }));

  const baseHistory = clientHistory.length ? clientHistory : persistedMessages.slice(-8);
  const messages = [...baseHistory, { role: "user", content: message }];

  const response = await geminiService.sendAgricultureChat(messages, context);

  await prisma.$transaction(async (tx) => {
    await tx.aIConversation.create({
      data: { userId, role: "USER", message }
    });
    await tx.aIConversation.create({
      data: { userId, role: "ASSISTANT", message: response.reply }
    });
  });

  return response;
}

async function getConversationHistory(userId, take = 40) {
  const rows = await prisma.aIConversation.findMany({
    where: { userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take
  });

  return rows.reverse().map((entry) => ({
    id: entry.id,
    role: entry.role === "ASSISTANT" ? "assistant" : "user",
    content: entry.message,
    createdAt: entry.createdAt
  }));
}

async function saveAnalysis({ userId, type, result }) {
  return prisma.aIAnalysis.create({
    data: {
      userId,
      analysisType: type,
      resultJson: result
    }
  });
}

module.exports = {
  chatWithAssistant,
  getConversationHistory,
  saveAnalysis
};
