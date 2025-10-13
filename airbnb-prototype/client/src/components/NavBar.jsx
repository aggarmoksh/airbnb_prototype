import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function NavBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link to="/dashboard" className="text-xl font-bold">bnb<span className="text-rose-500">.</span>prototype</Link>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <span className="text-sm text-gray-600">{user.role}</span>
              <Link to="/profile" className="text-sm">Profile</Link>
              <button className="px-3 py-1 rounded-full bg-gray-900 text-white text-sm"
                onClick={async()=>{await logout(); nav('/login');}}>
                Logout
              </button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className="text-sm">Login</Link>
              <Link to="/signup" className="text-sm">Signup</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
