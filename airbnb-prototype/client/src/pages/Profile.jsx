import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Profile(){
  const [me, setMe] = useState(null);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const r = await api.get('/users/me');
    setMe(r.data);
  };

  useEffect(()=>{ load(); }, []);

  const save = async () => {
    const { id, createdAt, avatarUrl, ...body } = me;
    await api.put('/users/me', body);
    setMsg('Saved');
  };

//   const upload = async () => {
//     if (!file) return;
//     const fd = new FormData();
//     fd.append('avatar', file);
//     const r = await api.post('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
//     setMe(r.data);
//   };
  const upload = async () => {

    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    // Do NOT set Content-Type manually; Axios will add the boundary.
    const r = await api.post('/users/avatar', fd);
    setMe(r.data);
  };

  if (!me) return <div>Loading...</div>;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="grid md:grid-cols-2 gap-3">
          <input className="border p-3 rounded-xl" placeholder="Name" value={me.name || ''} onChange={e=>setMe({...me, name: e.target.value})} />
          <input className="border p-3 rounded-xl" placeholder="Email" value={me.email || ''} onChange={e=>setMe({...me, email: e.target.value})} />
          <input className="border p-3 rounded-xl" placeholder="Phone" value={me.phone || ''} onChange={e=>setMe({...me, phone: e.target.value})} />
          <input className="border p-3 rounded-xl" placeholder="City" value={me.city || ''} onChange={e=>setMe({...me, city: e.target.value})} />
          <select className="border p-3 rounded-xl" value={me.state || ''} onChange={e=>setMe({...me, state: e.target.value})}>
            <option value="">State (abbr)</option>
            {['AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY'].map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="border p-3 rounded-xl" value={me.country || 'USA'} onChange={e=>setMe({...me, country: e.target.value})}>
            {['USA','Canada','UK','India','Australia'].map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="border p-3 rounded-xl md:col-span-2" placeholder="Languages (comma separated)" value={me.languages || ''} onChange={e=>setMe({...me, languages: e.target.value})} />
          <select className="border p-3 rounded-xl" value={me.gender || ''} onChange={e=>setMe({...me, gender: e.target.value})}>
            <option value="">Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </select>
          <textarea className="border p-3 rounded-xl md:col-span-2" placeholder="About me" value={me.about || ''} onChange={e=>setMe({...me, about: e.target.value})}></textarea>
        </div>
        <button onClick={save} className="mt-3 bg-gray-900 text-white px-4 py-2 rounded-xl">Save</button>
        {msg && <span className="ml-2 text-sm">{msg}</span>}
      </div>
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="font-semibold">Profile picture</h2>
        <div className="mt-3">
          {me.avatarUrl ? <img src={`http://localhost:4000${me.avatarUrl}`} alt="avatar" className="w-40 h-40 rounded-full object-cover"/> : <div className="w-40 h-40 rounded-full bg-gray-100"/>}
        </div>
        <input type="file" onChange={e=>setFile(e.target.files[0])} className="mt-3" />
        <button onClick={upload} className="mt-2 bg-rose-500 text-white px-4 py-2 rounded-xl">Upload</button>
      </div>
    </div>
  );
}
