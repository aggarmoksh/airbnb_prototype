import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import OwnerDashboard from './pages/OwnerDashboard.jsx';
import AddProperty from './pages/AddProperty.jsx';
import EditProperty from './pages/EditProperty.jsx';
import PropertyDetails from './pages/PropertyDetails.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Auth from './pages/Auth.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Profile from './pages/Profile.jsx';

const SERVER = 'http://localhost:4000';

/** Error boundary so crashes show instead of white screen */
class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError:false, err:null }; }
  static getDerivedStateFromError(err){ return { hasError:true, err }; }
  componentDidCatch(err, info){ console.error('ErrorBoundary:', err, info); }
  render(){
    if (this.state.hasError) {
      return (
        <div style={{padding:20, fontFamily:'system-ui'}}>
          <h2>Something went wrong.</h2>
          <pre style={{whiteSpace:'pre-wrap', color:'#b91c1c'}}>
            {String(this.state.err?.message || this.state.err)}
          </pre>
          <button onClick={()=>location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Initials({ name }) {
  const s = (name || '').trim();
  const parts = s.split(/\s+/).slice(0,2);
  const init = parts.map(p=>p[0]?.toUpperCase() || '').join('');
  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 grid place-items-center text-xs font-semibold select-none">
      {init || 'U'}
    </div>
  );
}

function Header() {
  const { user, logout } = useAuth();
  const avatar = user?.avatarUrl ? `${SERVER}${user.avatarUrl}` : null;

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">
          bnb.<span className="text-rose-600">prototype</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {user && (
            <Link to="/profile" className="inline-flex items-center gap-2">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Your profile"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-black/5"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Initials name={user?.name} />
              )}
              <span className="sr-only">Profile</span>
            </Link>
          )}

          {user ? (
            <>
              <span className="text-gray-600 hidden sm:inline">Hi, {user.name}</span>
              <button onClick={logout} className="rounded-full px-3 py-1 bg-gray-900 text-white">
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="rounded-full px-3 py-1 bg-gray-900 text-white">
              Sign up
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

// Component to route based on user role
function RoleBasedHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  
  // Route based on role
  if (user.role === 'OWNER') {
    return <OwnerDashboard />;
  }
  return <Dashboard />;
}

export default function App(){
  return (
    <ErrorBoundary>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          
          {/* Home - Role-based routing */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoleBasedHome />
              </ProtectedRoute>
            }
          />

          {/* Owner-only routes */}
          <Route
            path="/property/add"
            element={
              <ProtectedRoute>
                <AddProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/property/edit/:id"
            element={
              <ProtectedRoute>
                <EditProperty />
              </ProtectedRoute>
            }
          />

          {/* Shared routes */}
          <Route
            path="/properties/:id"
            element={
              <ProtectedRoute>
                <PropertyDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<div>Not found</div>} />
        </Routes>
      </main>
    </ErrorBoundary>
  );
}
