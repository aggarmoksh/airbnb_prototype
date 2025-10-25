import React, { useEffect, useState } from 'react';
import api from '../api';
import PropertyCard from '../components/PropertyCard.jsx';
import AgentPanel from '../components/AgentPanel.jsx';
import AgentModal from '../components/AgentModal.jsx';
import AgentChatWidget from "../components/AgentChatWidget";


export default function Dashboard(){
  const [location, setLocation] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [guests, setGuests] = useState(1);

  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [err, setErr] = useState('');
  const [favorites, setFavorites] = useState([]);

  const [agentOpen, setAgentOpen] = useState(false);

  const search = async () => {
    setErr(''); setLoadingResults(true);
    try {
      const r = await api.get('/properties', { params: { location, start, end, guests } });
      setResults(r.data);
    } catch (e) {
      setErr(e.response?.data?.error || 'Search failed');
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  const clearSearch = async () => {
    setLocation(''); setStart(''); setEnd(''); setGuests(1);
    setErr('');
    setLoadingResults(true);
    try {
      const r = await api.get('/properties', { params: { guests: 1 } });
      setResults(r.data);
    } catch {
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  useEffect(()=>{ search(); }, []); // initial

  const toggleFav = async (id, isFav) => {
    try {
      if (isFav) await api.delete(`/favorites/${id}`);
      else await api.post(`/favorites/${id}`);
      setFavorites(f => isFav ? f.filter(x=>x!==id) : [...f, id]);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome</h1>

      {err && <div className="bg-rose-50 text-rose-700 p-2 rounded">{err}</div>}

      {/* Search bar – single row on md+ */}
      <div className="bg-white rounded-2xl p-4 shadow">
        {/* Use standard grid counts to ensure Tailwind compiles */}
        <div className="grid gap-2 md:grid-cols-7">
          {/* Location (2 columns on md+) */}
          <div className="relative md:col-span-2">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 119.5 9 2.5 2.5 0 0112 11.5z"/>
            </svg>
            <input
              className="pl-10 w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/30"
              placeholder="City, State, Country"
              value={location}
              onChange={e=>setLocation(e.target.value)}
            />
          </div>

          {/* Start date */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2m0 6v2h10V8H7z"/>
            </svg>
            <input
              type="date"
              className="pl-10 w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/30"
              value={start}
              onChange={e=>setStart(e.target.value)}
            />
          </div>

          {/* End date */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2m0 6v2h10V8H7z"/>
            </svg>
            <input
              type="date"
              className="pl-10 w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/30"
              value={end}
              onChange={e=>setEnd(e.target.value)}
            />
          </div>

          {/* Guests */}
          <input
            type="number"
            min={1}
            className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/30"
            value={guests}
            onChange={e=>setGuests(e.target.value)}
          />

          {/* Search and Clear buttons (each occupy 1 col on md+) */}
          <button
            onClick={search}
            className="rounded-xl bg-gray-900 text-white hover:opacity-90 transition"
          >
            Search
          </button>
          <button
            onClick={clearSearch}
            className="rounded-xl border hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="min-h-[120px]">
        {loadingResults && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {[...Array(6)].map((_,i)=>(
              <div key={i} className="rounded-2xl bg-white shadow overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loadingResults && results.length === 0 && (
          <div className="mt-4 bg-white rounded-2xl p-6 shadow text-center">
            <div className="text-lg font-semibold">
              {location ? 'No properties available in selected area' : 'No homes match your filters'}
            </div>
            <div className="text-gray-600 text-sm">
              {location 
                ? 'Try searching in a different location or adjusting your dates.' 
                : 'Try adjusting location, dates, or guests.'}
            </div>
          </div>
        )}

        {!loadingResults && results.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {results.map(p => (
              <PropertyCard
                key={p.id}
                p={p}
                fav={favorites.includes(p.id)}
                onFav={() => toggleFav(p.id, favorites.includes(p.id))}
              />
            ))}
          </div>
        )}
      </div>
      
      <AgentChatWidget endpoint="http://localhost:8001/agent/plan" />

      {/* Floating Agent AI button */}
        {/* <button
        onClick={()=>setAgentOpen(true)}
        className="fixed bottom-6 right-6 rounded-full px-5 py-3 bg-rose-500 text-white shadow-lg hover:scale-105 transition"
        >
        Agent AI
        </button>

        <AgentPanel
        open={agentOpen}
        onClose={()=>setAgentOpen(false)}
        seedBooking={{ location, start, end, guests }}
        userId={"me"}     // if you want the agent to pull the latest DB booking for this logged-in user
        /> */}



      {/* Floating Agent AI button
      <button
        onClick={()=>setAgentOpen(true)}
        className="fixed bottom-6 right-6 rounded-full px-5 py-3 bg-rose-500 text-white shadow-lg hover:scale-105 transition"
      >
        Agent AI
      </button>

      <AgentModal open={agentOpen} onClose={()=>setAgentOpen(false)} /> */}
    </div>
  );
}



// import React, { useEffect, useState } from 'react';
// import api from '../api';
// import PropertyCard from '../components/PropertyCard.jsx';
// import AgentModal from '../components/AgentModal.jsx';

// export default function Dashboard(){
//   const [location, setLocation] = useState('');
//   const [start, setStart] = useState('');
//   const [end, setEnd] = useState('');
//   const [guests, setGuests] = useState(1);

//   const [results, setResults] = useState([]);
//   const [loadingResults, setLoadingResults] = useState(false);
//   const [err, setErr] = useState('');
//   const [favorites, setFavorites] = useState([]);

//   const [agentOpen, setAgentOpen] = useState(false);

//   const search = async () => {
//     setErr(''); setLoadingResults(true);
//     try {
//       const r = await api.get('/properties', { params: { location, start, end, guests } });
//       setResults(r.data);
//     } catch (e) {
//       setErr(e.response?.data?.error || 'Search failed');
//       setResults([]);
//     } finally {
//       setLoadingResults(false);
//     }
//   };

//   const clearSearch = async () => {
//     setLocation(''); setStart(''); setEnd(''); setGuests(1);
//     setErr('');
//     setLoadingResults(true);
//     try {
//       const r = await api.get('/properties', { params: { guests: 1 } });
//       setResults(r.data);
//     } catch {
//       setResults([]);
//     } finally {
//       setLoadingResults(false);
//     }
//   };

//   useEffect(()=>{ search(); }, []); // initial

//   const toggleFav = async (id, isFav) => {
//     try {
//       if (isFav) await api.delete(`/favorites/${id}`);
//       else await api.post(`/favorites/${id}`);
//       setFavorites(f => isFav ? f.filter(x=>x!==id) : [...f, id]);
//     } catch {}
//   };

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold">Welcome</h1>

//       {err && <div className="bg-rose-50 text-rose-700 p-2 rounded">{err}</div>}

//       {/* Search bar – one row on md+ */}
//       <div className="bg-white rounded-2xl p-4 shadow">
//         <div className="grid gap-2 md:grid-cols-7">
//           <input
//             className="md:col-span-2 w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/30"
//             placeholder="City, State, Country"
//             value={location}
//             onChange={e=>setLocation(e.target.value)}
//           />
//           <input
//             type="date"
//             className="w-full border p-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/30"
//             placeholder="dd-mm-yyyy"
//             value={start}
//             onChange={e=>setStart(e.target.value)}
//           />
//           <input
//             type="date"
//             className="w-full border p-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/30"
//             placeholder="dd-mm-yyyy"
//             value={end}
//             onChange={e=>setEnd(e.target.value)}
//           />
//           <input
//             type="number"
//             min={1}
//             className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/30"
//             value={guests}
//             onChange={e=>setGuests(e.target.value)}
//           />
//           <button
//             onClick={search}
//             className="rounded-xl bg-gray-900 text-white hover:opacity-90 transition"
//           >
//             Search
//           </button>
//           <button
//             onClick={clearSearch}
//             className="rounded-xl border hover:bg-gray-50"
//           >
//             Clear
//           </button>
//         </div>
//       </div>

//       {/* Results */}
//       <div className="min-h-[120px]">
//         {loadingResults && (
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
//             {[...Array(6)].map((_,i)=>(
//               <div key={i} className="rounded-2xl bg-white shadow overflow-hidden animate-pulse">
//                 <div className="h-56 bg-gray-200" />
//                 <div className="p-4 space-y-2">
//                   <div className="h-4 bg-gray-200 rounded w-2/3" />
//                   <div className="h-3 bg-gray-200 rounded w-1/2" />
//                   <div className="h-3 bg-gray-200 rounded w-3/4" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {!loadingResults && results.length === 0 && (
//           <div className="mt-4 bg-white rounded-2xl p-6 shadow text-center">
//             <div className="text-lg font-semibold">
//               {start && end ? 'No properties available for the selected dates' : 'No homes match your filters'}
//             </div>
//             <div className="text-gray-600 text-sm">Try adjusting location, dates, or guests.</div>
//           </div>
//         )}

//         {!loadingResults && results.length > 0 && (
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
//             {results.map(p => (
//               <PropertyCard
//                 key={p.id}
//                 p={p}
//                 fav={favorites.includes(p.id)}
//                 onFav={() => toggleFav(p.id, favorites.includes(p.id))}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Floating Agent AI button */}
//       <button
//         onClick={()=>setAgentOpen(true)}
//         className="fixed bottom-6 right-6 rounded-full px-5 py-3 bg-rose-500 text-white shadow-lg hover:scale-105 transition"
//       >
//         Agent AI
//       </button>

//       <AgentModal open={agentOpen} onClose={()=>setAgentOpen(false)} />
//     </div>
//   );
// }
