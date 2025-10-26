import React, { useState } from 'react';

export default function AgentModal({ open, onClose }) {
  const [q, setQ] = useState('');
  const [log, setLog] = useState([]);

  if (!open) return null;

  const ask = async () => {
    if (!q.trim()) return;
    setLog(l => [...l, { role: 'you', text: q }, { role: 'agent', text: `I received: "${q}"` }]);
    setQ('');
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full sm:max-w-lg bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-semibold">Agent AI</h3>
          <button onClick={onClose} className="rounded-full px-3 py-1 border">Close</button>
        </div>

        <div className="p-4 h-80 overflow-y-auto space-y-2">
          {log.length === 0 && (
            <div className="text-sm text-gray-500">Ask anything about properties, bookings, or your account.</div>
          )}
          {log.map((m, i) => (
            <div key={i} className={`text-sm ${m.role === 'agent' ? 'text-gray-800' : 'text-rose-700'}`}>
              <span className="font-medium">{m.role === 'agent' ? 'Agent' : 'You'}:</span> {m.text}
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex gap-2">
          <input
            className="flex-1 border rounded-xl p-3"
            placeholder="Type your question…"
            value={q}
            onChange={e=>setQ(e.target.value)}
            onKeyDown={e=>e.key==='Enter' && ask()}
          />
          <button onClick={ask} className="rounded-xl bg-gray-900 text-white px-4">Send</button>
        </div>
      </div>
    </div>
  );
}
