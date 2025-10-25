import React, { useEffect, useRef, useState } from "react";

export default function AgentChatWidget({
  endpoint = "http://localhost:8001/agent/plan",
  title = "Travel Agent",
  initialOpen = false,
}) {
  const [open, setOpen] = useState(initialOpen);
  const [messages, setMessages] = useState([]); // {id, role: 'user'|'assistant'|'error', text}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function send() {
    const query = input.trim();
    if (!query || loading) return;

    const id = String(Date.now());
    setMessages((m) => [...m, { id, role: "user", text: query }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't generate a response.";
      setMessages((m) => [
        ...m,
        { id: id + "-bot", role: "assistant", text: reply },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          id: id + "-err",
          role: "error",
          text: e?.message || "Network error",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const styles = {
    root: { position: "fixed", right: 16, bottom: 16, zIndex: 9999 },
    fab: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      borderRadius: 999,
      background: "#111827",
      color: "#fff",
      padding: "10px 14px",
      border: "1px solid #0b1220",
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      cursor: "pointer",
    },
    panel: {
      width: 360,
      maxWidth: "92vw",
      height: 520,
      background: "#fff",
      borderRadius: 16,
      border: "1px solid #e5e7eb",
      boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    header: {
      padding: "10px 12px",
      background: "#111827",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    messages: {
      flex: 1,
      overflowY: "auto",
      background: "#f9fafb",
      padding: 12,
    },
    bubbleBase: {
      maxWidth: "80%",
      padding: "8px 10px",
      borderRadius: 14,
      fontSize: 14,
      lineHeight: 1.4,
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      border: "1px solid transparent",
      whiteSpace: "pre-wrap",
    },
    user: { background: "#111827", color: "#fff" },
    bot: { background: "#ffffff", color: "#111827", borderColor: "#e5e7eb" },
    err: { background: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" },
    inputRow: {
      borderTop: "1px solid #e5e7eb",
      padding: 8,
      display: "flex",
      gap: 8,
      alignItems: "flex-end",
      background: "#fff",
    },
    textarea: {
      flex: 1,
      minHeight: 44,
      maxHeight: 120,
      resize: "vertical",
      borderRadius: 10,
      border: "1px solid #e5e7eb",
      padding: "8px 10px",
      fontSize: 14,
      outline: "none",
    },
    sendBtn: {
      background: "#111827",
      color: "#fff",
      border: "1px solid #0b1220",
      padding: "10px 12px",
      borderRadius: 10,
      cursor: "pointer",
      opacity: 1,
    },
    sendBtnDisabled: { opacity: 0.6, cursor: "not-allowed" },
    closeBtn: {
      background: "transparent",
      color: "#fff",
      border: "none",
      fontSize: 18,
      lineHeight: 1,
      cursor: "pointer",
      padding: 6,
      borderRadius: 8,
    },
    hint: {
      fontSize: 12,
      color: "#6b7280",
      background: "#fff",
      border: "1px dashed #e5e7eb",
      padding: 8,
      borderRadius: 12,
    },
  };

  return (
    <div style={styles.root}>
      {!open && (
        <button style={styles.fab} onClick={() => setOpen(true)}>
          {/* chat icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M20 15a4 4 0 0 1-4 4H8l-4 3v-3H4a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v8Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Ask the Agent</span>
        </button>
      )}

      {open && (
        <div style={styles.panel} role="dialog" aria-label={title}>
          <div style={styles.header}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                aria-hidden
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  background: "#34d399",
                  borderRadius: 999,
                }}
              />
              <strong style={{ fontSize: 14 }}>{title}</strong>
            </div>
            <button aria-label="Close chat" style={styles.closeBtn} onClick={() => setOpen(false)}>
              ×
            </button>
          </div>

          <div ref={scrollRef} style={styles.messages}>
            {messages.length === 0 && (
              <div style={styles.hint}>
                Ask about flights, stays, best dates, budgets, or multi-city routes.
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                    margin: "6px 0",
                  }}
                >
                  <div
                    style={{
                      ...styles.bubbleBase,
                      ...(m.role === "user" ? styles.user : m.role === "assistant" ? styles.bot : styles.err),
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ fontSize: 12, color: "#6b7280", padding: "2px 4px" }} aria-live="polite">
                  Thinking…
                </div>
              )}
            </div>
          </div>

          <div style={styles.inputRow}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your question and press Enter…"
              style={styles.textarea}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{ ...styles.sendBtn, ...(loading || !input.trim() ? styles.sendBtnDisabled : null) }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
