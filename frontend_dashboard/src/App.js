import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate
} from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import './App.css';

// ----------- AUTH CONTEXT ------------ //
/**
 * AuthContext provides authentication and user/session state
 */
const AuthContext = createContext();
/**
 * PUBLIC_INTERFACE
 * Provides context to children for authentication
 */
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    // Try to load user/JWT from localStorage on boot
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const user = jwtDecode(token);
        if (user.exp && Date.now() < user.exp * 1000) {
          return { token, user };
        }
      } catch {
        // ignore invalid token
        localStorage.removeItem('token');
      }
    }
    return { token: null, user: null };
  });

  // PUBLIC_INTERFACE
  const login = (token) => {
    try {
      const user = jwtDecode(token);
      localStorage.setItem('token', token);
      setAuth({ token, user });
    } catch {
      // Handle error as needed (show error, etc)
    }
  };
  // PUBLIC_INTERFACE
  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
// PUBLIC_INTERFACE
export function useAuth() {
  return useContext(AuthContext);
}

// ----------- ROUTE GUARDS & REDIRECTS ------------ //
/**
 * PRIVATE
 * A route that only renders if the user is authenticated.
 * Redirects to /login if not.
 */
function PrivateRoute({ children, roles }) {
  const auth = useAuth();
  const location = useLocation();
  if (!auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (roles && !roles.includes(auth.user.role)) {
    // Not authorized for this role
    return <Navigate to="/unauthorized" replace />;
  }
  return children ? children : <Outlet />;
}

/**
 * PUBLIC_INTERFACE
 * Dashboard redirect: send to correct dashboard for their role.
 */
export function RoleBasedDashboardRedirect() {
  const auth = useAuth();
  if (!auth.user) {
    return <Navigate to="/login" />;
  }
  switch (auth.user.role) {
    case 'admin':
      return <Navigate to="/dashboard/admin" />;
    case 'editor':
      return <Navigate to="/dashboard/editor" />;
    case 'viewer':
      return <Navigate to="/dashboard/viewer" />;
    default:
      return <Navigate to="/login" />;
  }
}

// ----------- LOGIN & SIGNUP VIEWS ------------ //
/**
 * PUBLIC_INTERFACE
 * Login form component with username/password
 */
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Simple fetch to backend_api (adjust endpoint as needed)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        setError('Login failed. Check credentials.');
        return;
      }
      const { token } = await res.json();
      auth.login(token);
      // Redirect according to role after login
      const user = jwtDecode(token);
      switch (user.role) {
        case 'admin':
          navigate('/dashboard/admin');
          break;
        case 'editor':
          navigate('/dashboard/editor');
          break;
        case 'viewer':
          navigate('/dashboard/viewer');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError('Error connecting to server.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
          />
          <button type="submit" className="theme-toggle">Login</button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
        <p>
          No account? <a href="/signup" style={{ color: "var(--text-secondary)" }}>Sign up</a>
        </p>
      </header>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Sign Up form for new users
 */
function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('viewer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      if (!res.ok) {
        setError('Signup failed. Choose a different username.');
        return;
      }
      setSuccess('Signup successful! You can now log in.');
      setTimeout(() => navigate('/login'), 1200);
    } catch {
      setError('Error connecting to server.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
          />
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button type="submit" className="theme-toggle">Sign Up</button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginTop: 12 }}>{success}</div>}
        <p>
          Already have an account? <a href="/login" style={{ color: "var(--text-secondary)" }}>Log in</a>
        </p>
      </header>
    </div>
  );
}

// ----------- DASHBOARD SCREENS ------------ //
// These are skeletal placeholders; Real UIs would be modularized in their own files

/**
 * PUBLIC_INTERFACE
 * Admin dashboard
 */
function AdminDashboard() {
  const { logout } = useAuth();
  return (
    <div className="App">
      <header className="App-header">
        <h2>Admin Dashboard</h2>
        <button className="theme-toggle" onClick={logout}>Logout</button>
        <p>Welcome, Admin! Content, users, settings & more.</p>
      </header>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Editor dashboard
 */
function EditorDashboard() {
  const { logout } = useAuth();
  return (
    <div className="App">
      <header className="App-header">
        <h2>Editor Dashboard</h2>
        <button className="theme-toggle" onClick={logout}>Logout</button>
        <p>Welcome, Editor! Edit, publish & manage content.</p>
      </header>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Viewer dashboard
 */
function ViewerDashboard() {
  const { logout } = useAuth();
  return (
    <div className="App">
      <header className="App-header">
        <h2>Viewer Dashboard</h2>
        <button className="theme-toggle" onClick={logout}>Logout</button>
        <p>View and browse published content here.</p>
      </header>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Unauthorized page
 */
function UnauthorizedPage() {
  return (
    <div className="App">
      <header className="App-header">
        <h2>Unauthorized</h2>
        <p>You do not have access to this page.</p>
        <a href="/" className="App-link">Go Home</a>
      </header>
    </div>
  );
}

// ----------- MAIN APP COMPONENT (ROUTER + THEME) ------------ //
/**
 * PUBLIC_INTERFACE
 * Main App mounts AuthProvider, handles theme, routing.
 */
function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            style={{ position: "fixed", top: 20, right: 20, zIndex: 10 }}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <Routes>
            {/* Authentication */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            {/* Dashboard routes (require authentication and specific roles) */}
            <Route element={<PrivateRoute roles={['admin']} />}>
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
            </Route>
            <Route element={<PrivateRoute roles={['editor']} />}>
              <Route path="/dashboard/editor" element={<EditorDashboard />} />
            </Route>
            <Route element={<PrivateRoute roles={['viewer']} />}>
              <Route path="/dashboard/viewer" element={<ViewerDashboard />} />
            </Route>
            {/* Default: If logged in, redirect to their dashboard; otherwise to login */}
            <Route path="/" element={<RoleBasedDashboardRedirect />} />
            {/* Catch-all fallback */}
            <Route path="*" element={<div className="App"><header className="App-header"><h2>404 Not Found</h2><a href="/" className="App-link">Return Home</a></header></div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
