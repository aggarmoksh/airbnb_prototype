import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [mode, setMode] = useState('signup');
  const [role, setRole] = useState('TRAVELER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url =
        mode === 'signup' ? '/auth/signup' : '/auth/login';
      const payload =
        mode === 'signup'
          ? { name, email, password: pwd, role }
          : { email, password: pwd };

      const { data } = await api.post(url, payload);
      setUser(data);

      nav('/', { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Something went wrong'
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              onClick={() => setMode('signup')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${mode==='signup' ? 'bg-white shadow-sm' : ''}`}
            >
              Sign up
            </button>
            <button
              onClick={() => setMode('login')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${mode==='login' ? 'bg-white shadow-sm' : ''}`}
            >
              Log in
            </button>
          </div>

          {mode === 'signup' ? (
            <div className="text-xs text-gray-500">Create a Traveler or Owner account</div>
          ) : (
            <div className="text-xs text-gray-500">Role is auto-detected on login</div>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-rose-50 px-4 py-2 text-rose-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === 'signup' && (
            <>
              <label className="block text-sm font-medium">Name</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
              <div className="flex items-center gap-3 pt-1 pb-2">
                <span className="text-sm font-medium">I am</span>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="role"
                    value="TRAVELER"
                    checked={role === 'TRAVELER'}
                    onChange={() => setRole('TRAVELER')}
                  />
                  Traveler
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="role"
                    value="OWNER"
                    checked={role === 'OWNER'}
                    onChange={() => setRole('OWNER')}
                  />
                  Owner (Host)
                </label>
              </div>
            </>
          )}

          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Minimum 6 characters"
            required
          />

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-[#0f1a2a] px-4 py-2.5 text-white font-semibold hover:opacity-95"
          >
            {mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <button className="text-[#e91e63]" onClick={() => setMode('login')}>
                Log in
              </button>
            </>
          ) : (
            <>
              New here?{' '}
              <button className="text-[#e91e63]" onClick={() => setMode('signup')}>
                Create an account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
