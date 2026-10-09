import React, { useState, useEffect } from 'react';
import { authService } from './services/auth';
import { resumeService } from './services/resume';
import { jobService } from './services/job';

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

  // Step 4: Job Description State
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: 'Java Backend Developer',
    company: 'TechCorp Cloud',
    description: 'Looking for Java developer with Spring Boot, PostgreSQL, REST APIs, Git and Docker experience.'
  });
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState('');

  useEffect(() => {
    loadJobs();
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

  const loadJobs = async () => {
    try {
      const list = await jobService.getAllJobs();
      setJobs(list);
      if (list.length > 0 && !selectedJob) {
        setSelectedJob(list[0]);
      }
    } catch {
      // Backend may be offline or initializing
    }
  };

  const loadUserResumes = async () => {
    try {
      const list = await resumeService.fetchMyResumes();
      setMyResumes(list);
      if (list.length > 0 && !uploadedResume) {
        setUploadedResume(list[0]);
      }
    } catch {
      // Ignored
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

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setJobLoading(true);
    setJobError('');

    try {
      const created = await jobService.createJob(
        jobForm.title,
        jobForm.company,
        jobForm.description
      );
      setJobs(prev => [created, ...prev]);
      setSelectedJob(created);
      setShowJobModal(false);
    } catch (err) {
      setJobError(err.message);
    } finally {
      setJobLoading(false);
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
            Step 4: Resume + Job Description Ready
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
        /* Authenticated Step 4 Dual Engine */
        <div>
          {/* Status Banner */}
          <div className="glass-panel" style={{ padding: '1.25rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-cyan)' }}>
                Targeting Core Analysis Engine
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Resume Ingestion + Job Description Alignment
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                background: uploadedResume ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: uploadedResume ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                {uploadedResume ? `✓ Resume: ${uploadedResume.fileName}` : '○ Resume Required'}
              </span>
              <span style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                background: selectedJob ? 'rgba(6, 182, 212, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: selectedJob ? 'var(--accent-cyan)' : 'var(--accent-amber)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                {selectedJob ? `✓ Job: ${selectedJob.title}` : '○ Job Required'}
              </span>
            </div>
          </div>

          {/* Dual Columns: Left = Resume, Right = Job Description */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            
            {/* COLUMN 1: RESUME (Step 3) */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-indigo)', fontWeight: 700 }}>STEP 3 COMPONENT</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Candidate Resume</h3>
                </div>
                {uploadedResume && (
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                    PARSED #{uploadedResume.id}
                  </span>
                )}
              </div>

              {/* Upload Input */}
              {uploadError && (
                <div style={{ padding: '0.6rem 0.9rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleUploadResume} style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  border: '2px dashed var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.2)',
                  marginBottom: '1rem',
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
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc', marginBottom: '0.2rem' }}>
                      {selectedFile ? selectedFile.name : 'Choose or Drop PDF Resume'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Apache PDFBox Parser Ready'}
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={uploadLoading || !selectedFile}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    borderRadius: '8px',
                    background: 'var(--gradient-brand)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: (uploadLoading || !selectedFile) ? 'not-allowed' : 'pointer',
                    opacity: (uploadLoading || !selectedFile) ? 0.6 : 1
                  }}
                >
                  {uploadLoading ? 'Extracting Text...' : 'Parse & Upload Resume'}
                </button>
              </form>

              {/* Raw Text Preview */}
              {uploadedResume ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <span>EXTRACTED RAW TEXT</span>
                    <span>{uploadedResume.wordCount} words / {uploadedResume.characterCount} chars</span>
                  </div>
                  <pre style={{
                    background: 'rgba(0, 0, 0, 0.45)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.9rem',
                    fontSize: '0.8rem',
                    color: '#cbd5e1',
                    height: '240px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {uploadedResume.rawText}
                  </pre>
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No resume uploaded yet. Select a PDF file above.
                </div>
              )}
            </div>

            {/* COLUMN 2: JOB DESCRIPTION (Step 4) */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>STEP 4 COMPONENT</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Job Description</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowJobModal(true)}
                  style={{
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: 'var(--accent-cyan)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  + Add New Job
                </button>
              </div>

              {/* Jobs selector */}
              {jobs.length > 0 ? (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Active Target Position
                    </label>
                    <select
                      value={selectedJob?.id || ''}
                      onChange={(e) => {
                        const job = jobs.find(j => j.id === Number(e.target.value));
                        setSelectedJob(job);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: '8px',
                        background: '#1e293b',
                        border: '1px solid var(--border-subtle)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}
                    >
                      {jobs.map(j => (
                        <option key={j.id} value={j.id}>
                          {j.title} — {j.company}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedJob && (
                    <div>
                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                          {selectedJob.title}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                          {selectedJob.company}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Added {new Date(selectedJob.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        JOB DESCRIPTION SPECIFICATION
                      </div>
                      <pre style={{
                        background: 'rgba(0, 0, 0, 0.45)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.9rem',
                        fontSize: '0.85rem',
                        color: '#cbd5e1',
                        height: '240px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'var(--font-sans)',
                        lineHeight: '1.6'
                      }}>
                        {selectedJob.description}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    No job descriptions created yet.
                  </div>
                  <button
                    onClick={() => setShowJobModal(true)}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '8px',
                      background: 'var(--gradient-brand)',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Create Initial Job Description
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Step 5 Prompt Banner */}
          <div className="glass-panel" style={{ padding: '1.75rem 2rem', borderLeft: '4px solid var(--accent-indigo)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-indigo)', textTransform: 'uppercase' }}>
                Foundation for Step 5 Ready
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.25rem 0' }}>
                We have: Resume ({uploadedResume ? uploadedResume.fileName : 'Standby'}) + Job Description ({selectedJob ? selectedJob.title : 'Standby'})
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Next milestone: Implement the 4-tier structured scoring algorithm (Skill Match 40%, Keyword Match 25%, Experience Match 20%, Education Match 15%) and AI JSON generation!
              </p>
            </div>
            <div style={{
              padding: '0.5rem 1.2rem',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid var(--border-accent)',
              color: '#c7d2fe',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              Ready for Step 5
            </div>
          </div>

          {/* Modal: Create Job */}
          {showJobModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
              padding: '1rem'
            }}>
              <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Add Job Description</h3>
                  <button
                    onClick={() => setShowJobModal(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                {jobError && (
                  <div style={{ padding: '0.6rem 0.9rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {jobError}
                  </div>
                )}

                <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Job Title
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--border-subtle)',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                      placeholder="e.g. Java Backend Developer"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Company
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.company}
                      onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--border-subtle)',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                      placeholder="e.g. TechCorp Solutions"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Job Description & Requirements
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={jobForm.description}
                      onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--border-subtle)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        resize: 'vertical'
                      }}
                      placeholder="e.g. Looking for Java developer with Spring Boot, PostgreSQL, REST APIs, Git and Docker experience."
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowJobModal(false)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={jobLoading}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: 'var(--gradient-brand)',
                        border: 'none',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: jobLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {jobLoading ? 'Saving...' : 'Save Job (POST /api/jobs)'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Database Schema Card for jobs */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-cyan)', marginTop: '2rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              PostgreSQL Table: <code style={{ color: 'var(--accent-cyan)' }}>jobs</code>
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
                    <td>Unique job record ID</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.4rem 0', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>title</td>
                    <td>VARCHAR</td>
                    <td>NOT NULL</td>
                    <td>Job title (e.g. Java Backend Developer)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.4rem 0', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>company</td>
                    <td>VARCHAR</td>
                    <td>NOT NULL</td>
                    <td>Hiring company or department</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.4rem 0', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>description</td>
                    <td>TEXT</td>
                    <td>NOT NULL</td>
                    <td>Job description and tech requirements</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem 0', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>created_at</td>
                    <td>TIMESTAMP WITH TIME ZONE</td>
                    <td>NOT NULL</td>
                    <td>Timestamp of creation</td>
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
