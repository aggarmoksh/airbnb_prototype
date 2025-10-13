import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      await login(email, password);
      nav('/', { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.error || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6">
      <h1 className="text-xl font-semibold mb-4">Log in</h1>
      {err && <div className="mb-3 bg-rose-50 text-rose-700 p-2 rounded">{err}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="Email"
          className="w-full border p-3 rounded-xl"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          placeholder="Password"
          className="w-full border p-3 rounded-xl"
          value={password}
          onChange={e=>setPassword(e.target.value)}
        />
        <button disabled={busy} className="w-full rounded-xl bg-gray-900 text-white py-3">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-3">
        Tip: use the credentials you created via signup or db seed.
      </p>
    </div>
  );
}
