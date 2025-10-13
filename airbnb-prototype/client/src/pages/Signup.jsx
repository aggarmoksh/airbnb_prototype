import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup(){
  const nav = useNavigate();
  const { signup } = useAuth();
  const [role, setRole] = useState('TRAVELER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('USA');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { role, name, email, password };
      if (role === 'OWNER') payload.location = { city, state, country };
      await signup(payload);
      nav('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-2xl shadow p-6">
      <h1 className="text-2xl font-bold mb-4">Create account</h1>
      {error && <div className="bg-rose-50 text-rose-600 p-2 rounded mb-3 text-sm">{error}</div>}
      <form onSubmit={submit} className="space-y-3">
        <div className="flex gap-2">
          <button type="button" onClick={()=>setRole('TRAVELER')} className={`flex-1 p-2 rounded-xl border ${role==='TRAVELER'?'bg-gray-900 text-white':'bg-white'}`}>Traveler</button>
          <button type="button" onClick={()=>setRole('OWNER')} className={`flex-1 p-2 rounded-xl border ${role==='OWNER'?'bg-gray-900 text-white':'bg-white'}`}>Owner</button>
        </div>
        <input className="w-full border p-3 rounded-xl" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full border p-3 rounded-xl" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full border p-3 rounded-xl" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {role==='OWNER' && (
          <div className="grid grid-cols-2 gap-2">
            <input className="border p-3 rounded-xl" placeholder="City" value={city} onChange={e=>setCity(e.target.value)} />
            <select className="border p-3 rounded-xl" value={state} onChange={e=>setState(e.target.value)}>
              <option value="">State (abbr)</option>
              {['AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY'].map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="col-span-2 border p-3 rounded-xl" value={country} onChange={e=>setCountry(e.target.value)}>
              {['USA','Canada','UK','India','Australia'].map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        <button className="w-full bg-gray-900 text-white py-3 rounded-xl">Create account</button>
      </form>
      <p className="text-sm mt-3">Have an account? <Link to="/login" className="text-rose-600">Login</Link></p>
    </div>
  );
}
