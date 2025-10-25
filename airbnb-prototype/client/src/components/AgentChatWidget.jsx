import React, { useEffect, useRef, useState } from "react";

/* ---------- tiny, safe Markdown renderer (no deps) ---------- */
function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function renderMarkdown(src) {
  if (!src) return "";
  // 1) Extract code fences first so formatting inside stays intact
  const fences = [];
  src = src.replace(/```([\s\S]*?)```/g, (_, code) => {
    const i = fences.length;
    fences.push(`<pre style="margin:8px 0;padding:10px;border-radius:10px;background:#0b1220;color:#e5e7eb;overflow:auto;"><code>${escapeHtml(code.trim())}</code></pre>`);
    return `§§FENCE${i}§§`;
  });

  // 2) Escape everything else
  let s = escapeHtml(src);

  // 3) HR
  s = s.replace(/^\s*---\s*$/gm, '<hr style="border:none;border-top:1px dashed #e5e7eb;margin:8px 0;" />');

  // 4) Headings
  s = s.replace(/^###\s+(.+)$/gm, '<h3 style="margin:10px 0 6px;font-size:14px;font-weight:800;color:#111827;">$1</h3>');
  s = s.replace(/^##\s+(.+)$/gm,  '<h2 style="margin:12px 0 6px;font-size:16px;font-weight:800;color:#111827;">$1</h2>');
  s = s.replace(/^#\s+(.+)$/gm,   '<h1 style="margin:12px 0 6px;font-size:18px;font-weight:800;color:#111827;">$1</h1>');

  // 5) Bold / italic / inline code
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^\*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  s = s.replace(/`([^`\n]+)`/g, '<code style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px;padding:0 4px;">$1</code>');

  // 6) Lists (unordered + ordered)
  const blockToList = (text, markerRegex, tag) => {
    const lines = text.split("\n");
    const out = [];
    let i = 0;
    while (i < lines.length) {
      if (markerRegex.test(lines[i])) {
        const items = [];
        while (i < lines.length && markerRegex.test(lines[i])) {
          items.push(lines[i].replace(markerRegex, "").trim());
          i++;
        }
        out.push(
          `<${tag} style="margin:6px 0 8px 20px;padding:0;list-style:disc;">${items
            .map(li => `<li style="margin:3px 0;">${li}</li>`)
            .join("")}</${tag}>`
        );
      } else {
        out.push(lines[i]);
        i++;
      }
    }
    return out.join("\n");
  };
  s = blockToList(s, /^\s*[-*]\s+/, "ul");
  s = blockToList(s, /^\s*\d+\.\s+/, "ol");

  // 7) Paragraphs: two newlines → paragraph breaks
  s = s
    .split(/\n{2,}/)
    .map(chunk =>
      /^<h\d|^<ul|^<ol|^<hr|^§§FENCE/.test(chunk.trim())
        ? chunk
        : `<p style="margin:6px 0;color:#111827;">${chunk.replace(/\n/g, "<br/>")}</p>`
    )
    .join("");

  // 8) Restore code fences
  s = s.replace(/§§FENCE(\d+)§§/g, (_, i) => fences[Number(i)]);

  return s;
}
/* ------------------------------------------------------------ */

export default function AgentChatWidget({
  endpoint = "http://localhost:8001/agent/plan",
  title = "Travel Agent",
  initialOpen = false,
}) {
  const [open, setOpen] = useState(initialOpen);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // remember recent turns for context
  const [conversationId] = useState(() => {
    const k = "agent:conversationId";
    const v = localStorage.getItem(k);
    if (v) return v;
    const cid = Math.random().toString(36).slice(2);
    localStorage.setItem(k, cid);
    return cid;
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  async function send() {
    const query = input.trim();
    if (!query || loading) return;

    const id = String(Date.now());
    setMessages(m => [...m, { id, role: "user", text: query }]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .slice(-8)
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(({ role, text }) => ({ role, text }));

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, history, conversation_id: conversationId }),
      });
      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't generate a response.";
      setMessages(m => [...m, { id: id + "-bot", role: "assistant", text: reply }]);
    } catch (e) {
      setMessages(m => [...m, { id: id + "-err", role: "error", text: e?.message || "Network error" }]);
    } finally {
      setLoading(false);
    }
  }
  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  // styles
  const S = {
    root: { position: "fixed", right: 16, bottom: 16, zIndex: 9999, fontFamily: "Inter, system-ui, Arial" },
    fab: { display: "flex", gap: 8, alignItems: "center", borderRadius: 999, background: "#111827", color: "#fff", padding: "10px 14px", border: "1px solid #0b1220", boxShadow: "0 12px 30px rgba(0,0,0,.25)", cursor: "pointer" },
    panel: { width: 420, maxWidth: "95vw", height: 560, background: "#fff", borderRadius: 18, border: "1px solid #e5e7eb", boxShadow: "0 24px 60px rgba(0,0,0,.22)", display: "flex", flexDirection: "column", overflow: "hidden" },
    header: { padding: "12px 14px", background: "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" },
    messagesWrap: { flex: 1, overflowY: "auto", background: "linear-gradient(#f8fafc, #ffffff)", padding: 14 },
    row: (mine) => ({ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", margin: "8px 0" }),
    bubble: (mine, isErr) => ({
      maxWidth: "85%",
      padding: "10px 12px",
      borderRadius: 14,
      border: "1px solid " + (isErr ? "#fecaca" : mine ? "#0b1220" : "#e5e7eb"),
      background: isErr ? "#fef2f2" : mine ? "#111827" : "#ffffff",
      color: isErr ? "#991b1b" : mine ? "#ffffff" : "#111827",
      boxShadow: "0 1px 2px rgba(0,0,0,.06)",
      whiteSpace: "pre-wrap",
    }),
    md: { fontSize: 14, lineHeight: 1.55 },
    inputRow: { borderTop: "1px solid #e5e7eb", padding: 10, display: "flex", gap: 8, background: "#fff" },
    textarea: { flex: 1, minHeight: 44, maxHeight: 140, resize: "vertical", borderRadius: 12, border: "1px solid #e5e7eb", padding: "10px 12px", fontSize: 14 },
    send: { background: "#111827", color: "#fff", border: "1px solid #0b1220", padding: "10px 14px", borderRadius: 12, cursor: "pointer" },
  };

  return (
    <div style={S.root}>
      {!open && (
        <button style={S.fab} onClick={() => setOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 15a4 4 0 0 1-4 4H8l-4 3v-3H4a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v8Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Ask the Agent</span>
        </button>
      )}

      {open && (
        <div style={S.panel} role="dialog" aria-label={title}>
          <div style={S.header}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span aria-hidden style={{ width: 10, height: 10, background: "#34d399", borderRadius: 999, display: "inline-block" }} />
              <strong style={{ fontSize: 14 }}>{title}</strong>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "transparent", color: "#fff", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
          </div>

          <div ref={scrollRef} style={S.messagesWrap}>
            {messages.map((m) => {
              const mine = m.role === "user";
              const isErr = m.role === "error";
              return (
                <div key={m.id} style={S.row(mine)}>
                  <div style={S.bubble(mine, isErr)}>
                    {mine || isErr ? (
                      m.text
                    ) : (
                      <div
                        style={S.md}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            {loading && <div style={{ fontSize: 12, color: "#6b7280" }}>Thinking…</div>}
          </div>

          <div style={S.inputRow}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
              placeholder="Ask about routes, stays, budgets…"
              style={S.textarea}
            />
            <button onClick={send} disabled={loading || !input.trim()} style={{ ...S.send, opacity: loading || !input.trim() ? .6 : 1 }}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
