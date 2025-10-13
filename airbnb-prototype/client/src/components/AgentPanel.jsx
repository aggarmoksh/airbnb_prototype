import React, { useMemo, useState } from 'react';
import axios from 'axios';

const AGENT_BASE = 'http://localhost:8001';

function Field({ label, children }) {
  return (
    <label className="block text-sm mb-2">
      <span className="block mb-1 text-gray-700">{label}</span>
      {children}
    </label>
  );
}

export default function AgentPanel({
  open,
  onClose,
  seedBooking,   // { location, start, end, guests }
  userId         // if you want to use "latest booking" from DB
}) {
  const [freeText, setFreeText] = useState('');
  const [useSearchBooking, setUseSearchBooking] = useState(true);
  const [useLatest, setUseLatest] = useState(false);

  const [partyType, setPartyType] = useState('family');
  const [budget, setBudget] = useState('$$');
  const [interests, setInterests] = useState('museums, parks, local culture');
  const [mobility, setMobility] = useState('');
  const [dietary, setDietary] = useState('vegan');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  const bookingPayload = useMemo(() => {
    if (!useSearchBooking || !seedBooking) return null;
    if (!(seedBooking.location && seedBooking.start && seedBooking.end)) return null;
    return {
      location: seedBooking.location,
      start_date: seedBooking.start,
      end_date: seedBooking.end,
      guests: Number(seedBooking.guests || 1),
      party_type: partyType,
    };
  }, [useSearchBooking, seedBooking, partyType]);

  const callAgent = async () => {
    setErr(''); setResult(null); setLoading(true);
    try {
      const payload = {
        free_text: freeText || null,
        booking: bookingPayload,
        use_latest_booking_for_user_id: useLatest ? userId : null,
        preferences: {
          budget_tier: budget,
          interests: interests.split(',').map(s=>s.trim()).filter(Boolean),
          mobility_needs: mobility.split(',').map(s=>s.trim()).filter(Boolean),
          dietary: dietary.split(',').map(s=>s.trim()).filter(Boolean),
        }
      };
      const { data } = await axios.post(`${AGENT_BASE}/agent/plan`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      setResult(data);
    } catch (e) {
      console.error('Agent error:', e);
      if (e.code === 'ERR_NETWORK') {
        setErr('AI Agent service is not running. Please start the AI agent server (port 8001).');
      } else {
        setErr(e?.response?.data?.detail || 'Agent call failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-[440px] bg-white shadow-xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">AI Concierge</h3>
          <button onClick={onClose} className="rounded-full px-3 py-1 border">Close</button>
        </div>

        {/* Options */}
        <div className="space-y-3 border-b pb-3">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={useSearchBooking} onChange={e=>setUseSearchBooking(e.target.checked)} />
              Use current search filters as booking
            </label>
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={useLatest} onChange={e=>setUseLatest(e.target.checked)} />
              Or use my latest DB booking
            </label>
          </div>

          <Field label="Free-text ask (NLU)">
            <textarea
              rows={2}
              className="w-full border rounded-xl p-2"
              placeholder='e.g., "vegan, two kids, no long hikes"'
              value={freeText}
              onChange={e=>setFreeText(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Party type">
              <select className="w-full border rounded-xl p-2" value={partyType} onChange={e=>setPartyType(e.target.value)}>
                <option>family</option><option>couple</option><option>friends</option><option>business</option>
              </select>
            </Field>
            <Field label="Budget">
              <select className="w-full border rounded-xl p-2" value={budget} onChange={e=>setBudget(e.target.value)}>
                <option>$</option><option>$$</option><option>$$$</option><option>$$$$</option>
              </select>
            </Field>
          </div>

          <Field label="Interests (comma-sep)">
            <input className="w-full border rounded-xl p-2" value={interests} onChange={e=>setInterests(e.target.value)} />
          </Field>

          <Field label="Mobility needs (comma-sep)">
            <input className="w-full border rounded-xl p-2" value={mobility} onChange={e=>setMobility(e.target.value)} />
          </Field>

          <Field label="Dietary filters (comma-sep)">
            <input className="w-full border rounded-xl p-2" value={dietary} onChange={e=>setDietary(e.target.value)} />
          </Field>

          <button
            onClick={callAgent}
            className="w-full rounded-xl bg-gray-900 text-white py-2"
            disabled={loading}
          >
            {loading ? 'Thinking…' : 'Generate plan'}
          </button>

          {err && <div className="bg-rose-50 text-rose-700 p-2 rounded mt-2">{err}</div>}
        </div>

        {/* Results */}
        {result && (
          <div className="pt-4 space-y-4">
            <div className="text-sm text-gray-600">
              {result.meta?.canonical_location && <>Location: <b>{result.meta.canonical_location}</b></>}
            </div>

            <section>
              <h4 className="font-semibold mb-2">Itinerary</h4>
              <div className="space-y-3">
                {result.itinerary?.map(day => (
                  <div key={day.date} className="border rounded-xl p-2">
                    <div className="font-medium mb-1">{day.date}</div>
                    {day.blocks?.map(bl => (
                      <div key={bl.block} className="mb-2">
                        <div className="text-xs uppercase text-gray-500">{bl.block}</div>
                        <ul className="list-disc ml-5">
                          {bl.activities?.map((a, i) => (
                            <li key={i} className="text-sm">
                              <span className="font-medium">{a.title}</span>
                              {a.address && <> — <span className="text-gray-600">{a.address}</span></>}
                              {a.price_tier && <> · {a.price_tier}</>}
                              {a.tags?.length>0 && <> · <span className="text-gray-500">{a.tags.join(', ')}</span></>}
                              {a.url && <> · <a href={a.url} target="_blank" className="text-rose-600">link</a></>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h4 className="font-semibold mb-2">Restaurants</h4>
              <ul className="list-disc ml-5">
                {result.restaurants?.map((r,i)=>(
                  <li key={i} className="text-sm">
                    <span className="font-medium">{r.title}</span>
                    {r.price_tier && <> · {r.price_tier}</>}
                    {r.tags?.length>0 && <> · <span className="text-gray-500">{r.tags.join(', ')}</span></>}
                    {r.address && <> — <span className="text-gray-600">{r.address}</span></>}
                    {r.url && <> · <a href={r.url} target="_blank" className="text-rose-600">link</a></>}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="font-semibold mb-2">Packing checklist</h4>
              <ul className="list-disc ml-5 text-sm">
                {result.packing_checklist?.map((p,i)=> <li key={i}>{p}</li>)}
              </ul>
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}
