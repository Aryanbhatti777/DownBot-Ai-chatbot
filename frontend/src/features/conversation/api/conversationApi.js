const baseUrl = "/api/v1/conversation";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  };
}

async function readJson(response) {
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.message ?? "The request could not be completed.");
  }
  return result?.data;
}

export async function getConversations(accessToken) {
  const response = await fetch(baseUrl, { headers: authHeaders(accessToken) });
  return readJson(response);
}

export async function getConversationMessages(accessToken, conversationId) {
  const response = await fetch(`${baseUrl}/${encodeURIComponent(conversationId)}`, {
    headers: authHeaders(accessToken)
  });
  return readJson(response);
}

export async function streamMessage(accessToken, { content, conversationId, onEvent }) {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ content, conversation: conversationId || undefined })
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.message ?? "Downbot could not answer. Please try again.");
  }
  if (!response.body) {
    throw new Error("Your browser does not support streamed responses.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  function dispatchBlock(block) {
    const data = block
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    if (data) onEvent(JSON.parse(data));
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() ?? "";
      blocks.forEach(dispatchBlock);
      if (done) break;
    }
    if (buffer.trim()) dispatchBlock(buffer);
  } finally {
    reader.releaseLock();
  }
}
