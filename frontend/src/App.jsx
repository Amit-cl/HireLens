import React, { useState, useEffect } from 'react';
import { authService } from './services/auth';

export default function App() {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Amit Patel',
    email: 'amit@example.com',
    password: 'password123',
    role: 'USER'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    // If token exists, verify with backend /api/auth/me
    if (authService.getToken()) {
      authService.fetchProfile()
        .then(profile => setCurrentUser(prev => ({ ...prev, ...profile })))
        .catch(() => {
          authService.clearSession();
          setCurrentUser(null);
        });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setApiResponse(null);

    try {
      let result;
      if (isRegister) {
        result = await authService.register(
          formData.name,
          formData.email,
          formData.password,
          formData.role
        );
      } else {
        result = await authService.login(formData.email, formData.password);
      }
      setCurrentUser(result);
      setApiResponse(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.clearSession();
    setCurrentUser(null);
    setApiResponse(null);
  };

  const testAuthEndpoint = async () => {
    setError('');
    try {
      const profile = await authService.fetchProfile();
      setApiResponse(profile);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      {/* Top Bar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.25rem',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)'
          }}>
            H
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
              Hire<span className="gradient-text">Lens</span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI-Powered Resume Matcher & Interview Platform</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            padding: '0.35rem 0.8rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(99, 102, 241, 0.12)',
            color: '#a5b4fc',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            Step 2: Authentication Active
          </span>
          {currentUser && (
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* Architectural Flow Diagram */}
      <div className="glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '2.5rem' }}>
        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Spring Security & JWT Flow
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', textAlign: 'center' }}>
          <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '120px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>1. User Request</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>POST /api/auth/login</div>
          </div>
          <span style={{ color: 'var(--accent-indigo)', fontWeight: 800 }}>→</span>
          <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '120px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>2. Spring Security</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BCrypt & DaoAuth</div>
          </div>
          <span style={{ color: 'var(--accent-indigo)', fontWeight: 800 }}>→</span>
          <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '120px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>3. Signed JWT</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HMAC-SHA256 Token</div>
          </div>
          <span style={{ color: 'var(--accent-indigo)', fontWeight: 800 }}>→</span>
          <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '120px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>4. Bearer Header</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Authorization: Bearer</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Session State */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* Left: Auth Form / User State */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {!currentUser ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                  {isRegister ? 'Create an Account' : 'Welcome Back'}
                </h2>
                <button
                  type="button"
                  onClick={() => { setIsRegister(!isRegister); setError(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
                </button>
              </div>

              {error && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  fontSize: '0.875rem',
                  marginBottom: '1.25rem'
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {isRegister && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--border-subtle)',
                        color: '#fff',
                        fontSize: '0.95rem'
                      }}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '0.95rem'
                    }}
                    placeholder="dev@example.com"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '0.95rem'
                    }}
                    placeholder="••••••••"
                  />
                </div>

                {isRegister && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: '#1e293b',
                        border: '1px solid var(--border-subtle)',
                        color: '#fff',
                        fontSize: '0.95rem'
                      }}
                    >
                      <option value="USER">USER (Candidate)</option>
                      <option value="ADMIN">ADMIN (Recruiter / System)</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    background: 'var(--gradient-brand)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: 'var(--shadow-glow)',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Processing...' : isRegister ? 'Register & Generate JWT' : 'Sign In'}
                </button>
              </form>
            </>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--gradient-brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#fff'
                }}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{currentUser.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{currentUser.email}</p>
                </div>
                <span style={{
                  marginLeft: 'auto',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  background: currentUser.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: currentUser.role === 'ADMIN' ? '#fca5a5' : 'var(--accent-emerald)',
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}>
                  {currentUser.role}
                </span>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>DATABASE ID</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{currentUser.id}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '0.25rem' }}>CREATED AT</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{new Date(currentUser.createdAt).toLocaleString()}</div>
              </div>

              <button
                type="button"
                onClick={testAuthEndpoint}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid var(--border-accent)',
                  color: '#c7d2fe',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Test Authorized GET /api/auth/me
              </button>
            </div>
          )}
        </div>

        {/* Right: JWT Inspector & API Response */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            JWT Security Inspector
          </h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Authorization Header
            </label>
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: '#38bdf8',
              wordBreak: 'break-all'
            }}>
              {authService.getToken() ? `Bearer ${authService.getToken().substring(0, 32)}...` : 'None (Unauthenticated)'}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Live Backend Payload
            </label>
            <pre style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '0.8rem',
              color: '#cbd5e1',
              maxHeight: '220px',
              overflowY: 'auto'
            }}>
              {JSON.stringify(apiResponse || currentUser || { message: "Submit Login or Register to inspect token response." }, null, 2)}
            </pre>
          </div>
        </div>

      </div>

      {/* Database Schema Card */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginTop: '2.5rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          PostgreSQL Table: <code style={{ color: 'var(--accent-cyan)' }}>users</code>
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.5rem 0' }}>Column</th>
                <th style={{ padding: '0.5rem 0' }}>Type</th>
                <th style={{ padding: '0.5rem 0' }}>Constraints</th>
                <th style={{ padding: '0.5rem 0' }}>Description</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '0.5rem 0', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>id</td>
                <td>BIGINT</td>
                <td>PRIMARY KEY, GENERATED IDENTITY</td>
                <td>Unique user identifier</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '0.5rem 0', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>name</td>
                <td>VARCHAR</td>
                <td>NOT NULL</td>
                <td>Candidate / Admin full name</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '0.5rem 0', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>email</td>
                <td>VARCHAR</td>
                <td>NOT NULL, UNIQUE</td>
                <td>User login credential & JWT Subject</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '0.5rem 0', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>password</td>
                <td>VARCHAR</td>
                <td>NOT NULL</td>
                <td>BCrypt salted hash (never raw text)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '0.5rem 0', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>role</td>
                <td>VARCHAR</td>
                <td>NOT NULL</td>
                <td>USER or ADMIN enum</td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem 0', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>created_at</td>
                <td>TIMESTAMP WITH TIME ZONE</td>
                <td>NOT NULL</td>
                <td>Automatic audit timestamp on create</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
