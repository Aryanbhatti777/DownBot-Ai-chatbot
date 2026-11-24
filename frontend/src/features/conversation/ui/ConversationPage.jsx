import {
  ArrowDown,
  ArrowUp,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  X
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth.js";
import {
  getConversationMessages,
  getConversations,
  streamMessage
} from "../api/conversationApi.js";
import "./conversation.css";

const suggestions = [
  { title: "Learn something", prompt: "Explain a tricky idea in a simple way." },
  { title: "Get inspired", prompt: "Give me a few creative ideas for my next project." },
  { title: "Make a plan", prompt: "Help me make a simple plan for something I want to do." }
];

export default function ConversationPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!auth.ready || !auth.user || !auth.accessToken) return;

    let active = true;
    getConversations(auth.accessToken)
      .then((data) => {
        if (active) setConversations(data?.convs ?? []);
      })
      .catch((error) => {
        if (active) setNotice(error.message);
      });

    return () => {
      active = false;
    };
  }, [auth.accessToken, auth.ready, auth.user]);

  useEffect(() => {
    if (!auth.ready || !auth.user || !auth.accessToken) return;
    if (!conversationId) {
      setMessages([]);
      setNotice("");
      setIsLoadingHistory(false);
      return;
    }

    let active = true;
    setMessages([]);
    setNotice("");
    setIsLoadingHistory(true);
    getConversationMessages(auth.accessToken, conversationId)
      .then((history) => {
        if (active) {
          setMessages((Array.isArray(history) ? history : []).map((message, index) => ({
            id: message._id ?? `${conversationId}-${index}`,
            role: message.role,
            content: message.content
          })));
        }
      })
      .catch((error) => {
        if (active) setNotice(error.message);
      })
      .finally(() => {
        if (active) setIsLoadingHistory(false);
      });

    return () => {
      active = false;
    };
  }, [auth.accessToken, auth.ready, auth.user, conversationId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (!auth.ready) {
    return <main className="conversation-loading">Getting your space ready…</main>;
  }
  if (!auth.user) return <Navigate to="/login" replace />;

  function startNewConversation() {
    navigate("/conversation");
    setMessages([]);
    setDraft("");
    setNotice("");
    setIsSidebarOpen(false);
    inputRef.current?.focus();
  }

  async function openConversation(conversation) {
    navigate(`/conversation/${conversation._id}`);
    setIsSidebarOpen(false);
  }

  async function sendMessage(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || isSending) return;

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;
    setDraft("");
    setNotice("");
    setIsSending(true);
    setMessages((current) => [
      ...current,
      { id: userMessageId, role: "user", content },
      { id: assistantMessageId, role: "assistant", content: "", streaming: true }
    ]);

    let responseText = "";
    let responseConversationId = conversationId;
    try {
      await streamMessage(auth.accessToken, {
        content,
        conversationId,
        onEvent: (data) => {
          if (data.conversationId) {
            responseConversationId = data.conversationId;
            setConversations((current) => {
              const existing = current.find((item) => item._id === data.conversationId);
              const conversation = {
                ...existing,
                _id: data.conversationId,
                title: data.title ?? existing?.title ?? "New conversation",
                lastMessage: content,
                updatedAt: new Date().toISOString()
              };
              return [conversation, ...current.filter((item) => item._id !== data.conversationId)];
            });
          }
          if (data.chunk !== undefined) {
            responseText += String(data.chunk);
            setMessages((current) => current.map((message) =>
              message.id === assistantMessageId
                ? { ...message, content: responseText }
                : message
            ));
          }
        }
      });
      setMessages((current) => current.map((message) =>
        message.id === assistantMessageId ? { ...message, streaming: false } : message
      ));
      if (responseConversationId && responseConversationId !== conversationId) {
        navigate(`/conversation/${responseConversationId}`, { replace: true });
      }
      try {
        const data = await getConversations(auth.accessToken);
        setConversations(data?.convs ?? []);
      } catch (error) {
        setNotice(error.message);
      }
    } catch (error) {
      setMessages((current) => current.filter((message) => message.id !== assistantMessageId));
      setNotice(error.message);
    } finally {
      setIsSending(false);
    }
  }

  function handleComposerKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  const visibleConversations = conversations.filter((conversation) =>
    (conversation.title ?? "Untitled conversation").toLowerCase().includes(search.toLowerCase())
  );
  const activeConversation = conversations.find((item) => item._id === conversationId);

  return (
    <main className="conversation-app">
      {isSidebarOpen && (
        <button
          className="conversation-backdrop"
          aria-label="Close conversation menu"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside className={`conversation-sidebar${isSidebarOpen ? " is-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-mark"><Sparkles size={17} /></span>
          <span>downbot</span>
          <button className="icon-button sidebar-close" aria-label="Close menu" onClick={() => setIsSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <button className="new-chat-button" onClick={startNewConversation}>
          <Plus size={17} />
          <span>New conversation</span>
          <span className="new-chat-shortcut">⌘ K</span>
        </button>

        <label className="history-search">
          <Search size={16} />
          <input
            aria-label="Search conversations"
            placeholder="Search conversations"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <div className="history-heading">YOUR HISTORY</div>
        <nav className="conversation-history" aria-label="Conversation history">
          {visibleConversations.length ? visibleConversations.map((conversation) => (
            <button
              key={conversation._id}
              className={`history-item${conversationId === conversation._id ? " is-active" : ""}`}
              onClick={() => openConversation(conversation)}
            >
              <MessageSquare size={16} />
              <span>{conversation.title || "Untitled conversation"}</span>
            </button>
          )) : (
            <p className="history-empty">{search ? "No matching conversations." : "Your conversations will appear here."}</p>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="account-card">
            <span className="account-avatar">{auth.user.name?.slice(0, 1).toUpperCase() || "U"}</span>
            <span className="account-details">
              <strong>{auth.user.name}</strong>
              <small>Personal workspace</small>
            </span>
            <button className="sign-out-button" onClick={auth.logout}>Sign out</button>
          </div>
        </div>
      </aside>

      <section className="conversation-main">
        <header className="conversation-topbar">
          <button className="icon-button mobile-menu" aria-label="Open conversation menu" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="topbar-title">
            <span>{activeConversation?.title || "New conversation"}</span>
            <span className="model-indicator"><i /> Downbot</span>
          </div>
          <button className="icon-button topbar-new-chat" aria-label="Start a new conversation" onClick={startNewConversation}>
            <Plus size={19} />
          </button>
        </header>

        <div className={`conversation-content${messages.length ? " has-messages" : ""}`}>
          {messages.length === 0 && !isLoadingHistory ? (
            <div className="conversation-welcome">
              <div className="welcome-icon"><Sparkles size={22} /></div>
              <p className="welcome-eyebrow">A THOUGHTFUL PLACE TO START</p>
              <h1>What’s on your mind{auth.user.name ? `, ${auth.user.name.split(" ")[0]}` : ""}?</h1>
              <p className="welcome-copy">Ask a question, explore an idea, or make a plan. We’ll figure it out together.</p>
              <div className="suggestion-grid">
                {suggestions.map((suggestion) => (
                  <button
                    className="suggestion-card"
                    key={suggestion.title}
                    onClick={() => {
                      setDraft(suggestion.prompt);
                      inputRef.current?.focus();
                    }}
                  >
                    <strong>{suggestion.title}</strong>
                    <span>{suggestion.prompt}</span>
                    <ArrowDown size={15} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="message-list">
              {isLoadingHistory && <p className="history-loading">Loading conversation…</p>}
              {messages.map((message) => (
                <article className={`message-row ${message.role}`} key={message.id}>
                  {message.role === "assistant" && (
                    <span className="assistant-avatar"><Sparkles size={15} /></span>
                  )}
                  <div className="message-body">
                    {message.role === "assistant" && <span className="message-author">Downbot</span>}
                    <div className={`message-text${message.role === "assistant" ? " markdown-content" : ""}`}>
                      {message.role === "assistant"
                        ? message.content
                          ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                          : message.streaming && <span className="typing-indicator"><i /><i /><i /></span>
                        : message.content}
                      {message.streaming && message.content && <span className="streaming-cursor" />}
                    </div>
                  </div>
                </article>
              ))}
              <div ref={messageEndRef} />
            </div>
          )}
          {notice && <div className="conversation-notice" role="alert">{notice}</div>}
        </div>

        <div className="composer-wrap">
          <form className="message-composer" onSubmit={sendMessage}>
            <textarea
              ref={inputRef}
              aria-label="Message Downbot"
              placeholder="Message Downbot…"
              rows={1}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              disabled={isLoadingHistory || isSending}
            />
            <div className="composer-footer">
              <span>Shift + Enter for a new line</span>
              <button
                type="submit"
                className="send-button"
                aria-label="Send message"
                disabled={!draft.trim() || isSending || isLoadingHistory}
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </form>
          <p className="composer-disclaimer">Downbot can make mistakes. Check important information.</p>
        </div>
      </section>
    </main>
  );
}
