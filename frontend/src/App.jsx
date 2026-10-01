import React, { useState, useEffect } from 'react';
import { authService } from './services/auth';
import { resumeService } from './services/resume';

export default function App() {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({
    name: 'Amit Patel',
    email: 'amit@example.com',
    password: 'password123',
    role: 'USER'
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Step 3: Resume Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedResume, setUploadedResume] = useState(null);
  const [myResumes, setMyResumes] = useState([]);

  useEffect(() => {
    if (authService.getToken()) {
      authService.fetchProfile()
        .then(profile => {
          setCurrentUser(prev => ({ ...prev, ...profile }));
          loadUserResumes();
        })
        .catch(() => {
          authService.clearSession();
          setCurrentUser(null);
        });
    }
  }, []);

  const loadUserResumes = async () => {
    try {
      const list = await resumeService.fetchMyResumes();
      setMyResumes(list);
      if (list.length > 0 && !uploadedResume) {
        setUploadedResume(list[0]);
      }
    } catch {
      // Ignored if unauthenticated or empty
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      let result;
      if (isRegister) {
        result = await authService.register(
          authForm.name,
          authForm.email,
          authForm.password,
          authForm.role
        );
      } else {
        result = await authService.login(authForm.email, authForm.password);
      }
      setCurrentUser(result);
      loadUserResumes();
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    authService.clearSession();
    setCurrentUser(null);
    setUploadedResume(null);
    setMyResumes([]);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setUploadError('Only PDF files (.pdf) are supported.');
        setSelectedFile(null);
        return;
      }
      setUploadError('');
      setSelectedFile(file);
    }
  };

  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please choose a PDF file to upload.');
      return;
    }

    setUploadLoading(true);
    setUploadError('');

    try {
      const response = await resumeService.uploadResume(selectedFile);
      setUploadedResume(response);
      setSelectedFile(null);
      await loadUserResumes();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Top Header */}
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
            Step 3: Resume Ingestion
          </span>

          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {currentUser.name} ({currentUser.role})
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* If Not Authenticated -> Show Auth Card */}
      {!currentUser ? (
        <div style={{ maxWidth: '480px', margin: '2rem auto' }}>
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                {isRegister ? 'Create Candidate Account' : 'Candidate Sign In'}
              </h2>
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setAuthError(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {isRegister ? 'Login instead' : 'Register instead'}
              </button>
            </div>

            {authError && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '0.85rem',
                marginBottom: '1.25rem'
              }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {isRegister && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  background: 'var(--gradient-brand)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: authLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {authLoading ? 'Authenticating...' : isRegister ? 'Register & Continue' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Authenticated Step 3 Workspace */
        <div>
          {/* Architectural Flow Diagram */}
          <div className="glass-panel" style={{ padding: '1.25rem 2rem', marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Step 3 Pipeline: PDF → Java → Extract Text → Database
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', textAlign: 'center' }}>
              <div style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '130px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>1. resume.pdf</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>POST /api/resumes/upload</div>
              </div>
              <span style={{ color: 'var(--accent-indigo)', fontWeight: 800 }}>→</span>
              <div style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '130px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>2. ResumeController</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MultipartFile + Auth Token</div>
              </div>
              <span style={{ color: 'var(--accent-indigo)', fontWeight: 800 }}>→</span>
              <div style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '130px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>3. Apache PDFBox</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PDFTextStripper Parser</div>
              </div>
              <span style={{ color: 'var(--accent-indigo)', fontWeight: 800 }}>→</span>
              <div style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '130px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>4. PostgreSQL</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>resumes (raw_text)</div>
              </div>
            </div>
          </div>

          {/* Upload Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            
            {/* Left: Upload Form */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Upload Candidate Resume
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Select a PDF resume to extract raw textual content using Apache PDFBox.
              </p>

              {uploadError && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem'
                }}>
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleUploadResume}>
                <div style={{
                  border: '2px dashed var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.2)',
                  marginBottom: '1.5rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="file"
                    id="resume-file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="resume-file" style={{ cursor: 'pointer', display: 'block' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📄</div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
                      {selectedFile ? selectedFile.name : 'Click or Drag & Drop PDF Resume'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Maximum file size: 10MB'}
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={uploadLoading || !selectedFile}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    background: 'var(--gradient-brand)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: (uploadLoading || !selectedFile) ? 'not-allowed' : 'pointer',
                    boxShadow: 'var(--shadow-glow)',
                    opacity: (uploadLoading || !selectedFile) ? 0.6 : 1
                  }}
                >
                  {uploadLoading ? 'Extracting Text via PDFBox...' : 'Extract & Save to Database'}
                </button>
              </form>

              {/* Uploaded History List */}
              {myResumes.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Uploaded Resumes ({myResumes.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {myResumes.map(r => (
                      <div
                        key={r.id}
                        onClick={() => setUploadedResume(r)}
                        style={{
                          padding: '0.6rem 0.9rem',
                          borderRadius: '6px',
                          background: uploadedResume?.id === r.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                          border: uploadedResume?.id === r.id ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.85rem'
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{r.fileName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.wordCount} words</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Extracted Text Inspector */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  Extracted Raw Text
                </h3>
                {uploadedResume && (
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--accent-emerald)',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    PARSED & SAVED
                  </span>
                )}
              </div>

              {uploadedResume ? (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.75rem',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '0.8rem',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>RESUME ID</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#{uploadedResume.id}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>WORDS</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{uploadedResume.wordCount}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>CHARACTERS</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{uploadedResume.characterCount}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    DATABASE COLUMN: <code style={{ color: '#38bdf8' }}>resumes.raw_text</code>
                  </div>
                  <pre style={{
                    background: 'rgba(0, 0, 0, 0.45)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '1rem',
                    fontSize: '0.8rem',
                    color: '#e2e8f0',
                    height: '280px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-mono)',
                    lineHeight: '1.5'
                  }}>
                    {uploadedResume.rawText}
                  </pre>
                </>
              ) : (
                <div style={{
                  height: '350px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  padding: '2rem'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📥</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    No Resume Uploaded Yet
                  </h4>
                  <p style={{ fontSize: '0.85rem', maxWidth: '300px' }}>
                    Upload a PDF resume on the left to verify the text extraction pipeline.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Database Schema Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              PostgreSQL Table: <code style={{ color: 'var(--accent-cyan)' }}>resumes</code>
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.4rem 0' }}>Column</th>
                    <th style={{ padding: '0.4rem 0' }}>Type</th>
                    <th style={{ padding: '0.4rem 0' }}>Constraints</th>
                    <th style={{ padding: '0.4rem 0' }}>Description</th>
                  </tr>
                </thead>
                <tbody style={{ color: 'var(--text-secondary)' }}>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.4rem 0', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>id</td>
                    <td>BIGINT</td>
                    <td>PRIMARY KEY, GENERATED IDENTITY</td>
                    <td>Unique resume record ID</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.4rem 0', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>user_id</td>
                    <td>BIGINT</td>
                    <td>FOREIGN KEY REFERENCES users(id)</td>
                    <td>Candidate who uploaded the resume</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.4rem 0', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>file_name</td>
                    <td>VARCHAR</td>
                    <td>NOT NULL</td>
                    <td>Original uploaded filename (e.g. resume.pdf)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.4rem 0', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>raw_text</td>
                    <td>TEXT</td>
                    <td>NOT NULL</td>
                    <td>Plain text extracted via Apache PDFBox</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem 0', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>uploaded_at</td>
                    <td>TIMESTAMP WITH TIME ZONE</td>
                    <td>NOT NULL</td>
                    <td>Timestamp of upload</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
