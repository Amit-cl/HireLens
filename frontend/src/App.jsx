import React, { useState, useEffect } from 'react';
import { authService } from './services/auth';
import { resumeService } from './services/resume';
import { jobService } from './services/job';
import { analysisService } from './services/analysis';
import { interviewService } from './services/interview';

export default function App() {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [activeTab, setActiveTab] = useState('match'); // match, analysis, interview, final

  // Auth state
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({
    name: 'Amit Patel',
    email: 'amit@example.com',
    password: 'password123',
    role: 'USER'
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Step 3: Resume state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedResume, setUploadedResume] = useState(null);
  const [myResumes, setMyResumes] = useState([]);

  // Step 4: Job state
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

  // Step 5 & 6: ATS Analysis state
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  // Step 7, 8, 9: AI Interview state
  const [interviewSession, setInterviewSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [interviewError, setInterviewError] = useState('');
  const [interviewReport, setInterviewReport] = useState(null);

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
      // Ignored if offline
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
      loadJobs();
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
    setCurrentAnalysis(null);
    setInterviewSession(null);
    setInterviewReport(null);
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

  // Step 5: Run AI Resume Analysis
  const handleRunAnalysis = async () => {
    if (!uploadedResume || !selectedJob) {
      setAnalysisError('Both a resume and a job description are required to run analysis.');
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError('');

    try {
      const result = await analysisService.generateAnalysis(uploadedResume.id, selectedJob.id);
      setCurrentAnalysis(result);
      setActiveTab('analysis');
    } catch (err) {
      setAnalysisError(err.message);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Step 7: Generate AI Interview
  const handleStartInterview = async () => {
    if (!uploadedResume || !selectedJob) {
      setInterviewError('Resume and Job Description required.');
      return;
    }

    setInterviewError('');
    try {
      const session = await interviewService.generateInterview(uploadedResume.id, selectedJob.id);
      setInterviewSession(session);
      setCurrentQuestionIndex(0);
      setCandidateAnswer('');
      setCurrentEvaluation(null);
      setActiveTab('interview');
    } catch (err) {
      setInterviewError(err.message);
    }
  };

  // Step 9: Submit Answer
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!candidateAnswer.trim() || !interviewSession) return;

    setSubmittingAnswer(true);
    setInterviewError('');

    try {
      const currentQuestion = interviewSession.questions[currentQuestionIndex]?.question;
      const evaluation = await interviewService.submitAnswer(
        interviewSession.sessionId,
        currentQuestion,
        candidateAnswer
      );
      setCurrentEvaluation(evaluation);
    } catch (err) {
      setInterviewError(err.message);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Move to Next Question or Complete Interview
  const handleNextQuestion = async () => {
    if (!interviewSession) return;

    if (currentQuestionIndex + 1 < interviewSession.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCandidateAnswer('');
      setCurrentEvaluation(null);
    } else {
      // Completed all questions
      try {
        const report = await interviewService.completeInterview(interviewSession.sessionId);
        setInterviewReport(report);
        setActiveTab('final');
      } catch (err) {
        setInterviewError(err.message);
      }
    }
  };

  return (
    <div className="container">
      {/* Top Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
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

        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {currentUser.name} <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: '#c7d2fe', fontSize: '0.75rem', fontWeight: 600 }}>{currentUser.role}</span>
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
      </header>

      {/* Main Content Area */}
      {!currentUser ? (
        /* Sign In / Register Card */
        <div style={{ maxWidth: '480px', margin: '3rem auto' }}>
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
                  padding: '0.85rem',
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
        /* Authenticated Application with Complete 10-Step Workflow */
        <div>
          {/* Navigation Bar */}
          <nav style={{
            display: 'flex',
            gap: '0.5rem',
            background: 'rgba(17, 24, 39, 0.6)',
            padding: '0.4rem',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '2rem',
            overflowX: 'auto'
          }}>
            <button
              className={`nav-tab ${activeTab === 'match' ? 'active' : ''}`}
              onClick={() => setActiveTab('match')}
            >
              1. Resume & Job
            </button>
            <button
              className={`nav-tab ${activeTab === 'analysis' ? 'active' : ''}`}
              onClick={() => setActiveTab('analysis')}
            >
              2. ATS Dashboard {currentAnalysis && `(${currentAnalysis.overallScore}%)`}
            </button>
            <button
              className={`nav-tab ${activeTab === 'interview' ? 'active' : ''}`}
              onClick={() => setActiveTab('interview')}
            >
              3. AI Mock Interview
            </button>
            <button
              className={`nav-tab ${activeTab === 'final' ? 'active' : ''}`}
              onClick={() => setActiveTab('final')}
            >
              4. Final Report & Overview
            </button>
          </nav>

          {/* ======================================================== */}
          {/* TAB 1: RESUME & JOB SPECIFICATION (Steps 3, 4, and trigger 5) */}
          {/* ======================================================== */}
          {activeTab === 'match' && (
            <div>
              {/* Dual Setup Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* Resume Card */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-indigo)', fontWeight: 700 }}>STEP 3</span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Candidate Resume</h3>
                    </div>
                    {uploadedResume && (
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                        PARSED #{uploadedResume.id}
                      </span>
                    )}
                  </div>

                  {uploadError && (
                    <div style={{ padding: '0.6rem 0.9rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontSize: '0.8rem', marginBottom: '1rem' }}>
                      {uploadError}
                    </div>
                  )}

                  <form onSubmit={handleUploadResume} style={{ marginBottom: '1.25rem' }}>
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
                          {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Apache PDFBox Parser'}
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
                      {uploadLoading ? 'Extracting Text via PDFBox...' : 'Parse & Upload Resume'}
                    </button>
                  </form>

                  {uploadedResume ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        <span>RAW TEXT PREVIEW</span>
                        <span>{uploadedResume.wordCount} words</span>
                      </div>
                      <pre style={{
                        background: 'rgba(0, 0, 0, 0.45)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.85rem',
                        fontSize: '0.8rem',
                        color: '#cbd5e1',
                        height: '180px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {uploadedResume.rawText}
                      </pre>
                    </div>
                  ) : (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Upload a PDF resume to extract raw text.
                    </div>
                  )}
                </div>

                {/* Job Card */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>STEP 4</span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Target Job Description</h3>
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

                  {jobs.length > 0 ? (
                    <div>
                      <div style={{ marginBottom: '1rem' }}>
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
                          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '0.75rem' }}>
                            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>{selectedJob.title}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>{selectedJob.company}</div>
                          </div>
                          <pre style={{
                            background: 'rgba(0, 0, 0, 0.45)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '8px',
                            padding: '0.85rem',
                            fontSize: '0.85rem',
                            color: '#cbd5e1',
                            height: '180px',
                            overflowY: 'auto',
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'var(--font-sans)',
                            lineHeight: '1.5'
                          }}>
                            {selectedJob.description}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Loading job descriptions...
                    </div>
                  )}
                </div>
              </div>

              {/* Step 5 Trigger Action */}
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Execute AI Resume Analysis (Step 5 ⭐)
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '650px', margin: '0 auto 1.5rem auto' }}>
                  Calculate deterministic 4-tier match score: Skill Match (40%), Keyword Match (25%), Experience Match (20%), and Education Match (15%).
                </p>

                {analysisError && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
                    {analysisError}
                  </div>
                )}

                <button
                  onClick={handleRunAnalysis}
                  disabled={analysisLoading || !uploadedResume || !selectedJob}
                  style={{
                    padding: '0.9rem 2.5rem',
                    borderRadius: '10px',
                    background: 'var(--gradient-brand)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    cursor: (analysisLoading || !uploadedResume || !selectedJob) ? 'not-allowed' : 'pointer',
                    boxShadow: 'var(--shadow-glow)',
                    opacity: (analysisLoading || !uploadedResume || !selectedJob) ? 0.6 : 1
                  }}
                >
                  {analysisLoading ? 'Analyzing Resume via AI Engine...' : 'Run Structured ATS Match Analysis →'}
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: ANALYSIS DASHBOARD (Step 6) */}
          {/* ======================================================== */}
          {activeTab === 'analysis' && (
            <div>
              {currentAnalysis ? (
                <div>
                  {/* Top Score Banner */}
                  <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                      {currentAnalysis.jobTitle} • {currentAnalysis.jobCompany}
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      ATS MATCH SCORE
                    </h2>
                    <div style={{
                      fontSize: '4.5rem',
                      fontWeight: 900,
                      lineHeight: 1,
                      fontFamily: 'var(--font-sans)',
                      marginBottom: '1rem'
                    }}>
                      <span className="gradient-text">{currentAnalysis.overallScore}</span>
                      <span style={{ fontSize: '2rem', color: 'var(--text-muted)', fontWeight: 400 }}> / 100</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                      <button
                        onClick={handleStartInterview}
                        style={{
                          padding: '0.8rem 1.8rem',
                          borderRadius: '8px',
                          background: 'var(--gradient-brand)',
                          border: 'none',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          boxShadow: 'var(--shadow-glow)'
                        }}
                      >
                        Launch Targeted AI Interview (Step 7 ⭐) →
                      </button>
                    </div>
                  </div>

                  {/* 4-Tier Weight Breakdown */}
                  <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                      Structured Scoring Breakdown
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600 }}>Skill Match (40% Weight)</span>
                          <span style={{ color: 'var(--accent-indigo)', fontWeight: 700 }}>{currentAnalysis.skillScore}%</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${currentAnalysis.skillScore}%` }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600 }}>Keyword Match (25% Weight)</span>
                          <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{currentAnalysis.keywordScore}%</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${currentAnalysis.keywordScore}%` }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600 }}>Experience Match (20% Weight)</span>
                          <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{currentAnalysis.experienceScore}%</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${currentAnalysis.experienceScore}%` }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600 }}>Education Match (15% Weight)</span>
                          <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>{currentAnalysis.educationScore}%</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${currentAnalysis.educationScore}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                    {/* Skills Matched */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Skills Match</h4>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                          {currentAnalysis.skillsMatched?.length || 0} VERIFIED
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {currentAnalysis.skillsMatched?.map(skill => (
                          <div key={skill} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}>
                            <span style={{ fontWeight: 600 }}>{skill}</span>
                            <span style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>✓</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Missing Skills</h4>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontWeight: 700 }}>
                          {currentAnalysis.missingSkills?.length || 0} GAPS
                        </span>
                      </div>
                      {currentAnalysis.missingSkills?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {currentAnalysis.missingSkills.map(skill => (
                            <div key={skill} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.8rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem' }}>
                              <span style={{ fontWeight: 600, color: '#fca5a5' }}>{skill}</span>
                              <span style={{ color: '#ef4444', fontWeight: 800 }}>✗</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: 'var(--accent-emerald)', fontSize: '0.9rem' }}>
                          ✓ Perfect match! No core skills are missing.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                      AI Recommendations
                    </h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {currentAnalysis.recommendations?.map((rec, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                          <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'rgba(99, 102, 241, 0.2)',
                            color: '#a5b4fc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            flexShrink: 0
                          }}>
                            {i + 1}
                          </span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📊</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    No Analysis Performed Yet
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                    Go to the Resume & Job tab and run the Structured ATS Analysis to view this dashboard.
                  </p>
                  <button
                    onClick={() => setActiveTab('match')}
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Go to Resume & Job Setup
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: AI INTERVIEW SESSION (Steps 7, 8, and 9) */}
          {/* ======================================================== */}
          {activeTab === 'interview' && (
            <div>
              {interviewSession ? (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                  {/* Question Header */}
                  <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <span style={{
                        padding: '0.3rem 0.8rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#c7d2fe',
                        fontSize: '0.85rem',
                        fontWeight: 700
                      }}>
                        AI INTERVIEW • Question {currentQuestionIndex + 1} of {interviewSession.questions?.length}
                      </span>
                      <span style={{
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        background: 'rgba(6, 182, 212, 0.15)',
                        color: 'var(--accent-cyan)',
                        fontWeight: 700
                      }}>
                        {interviewSession.questions[currentQuestionIndex]?.difficulty} • {interviewSession.questions[currentQuestionIndex]?.targetedSkill}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800, lineHeight: 1.4, marginBottom: '2rem', color: '#f8fafc' }}>
                      "{interviewSession.questions[currentQuestionIndex]?.question}"
                    </h2>

                    {interviewError && (
                      <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        {interviewError}
                      </div>
                    )}

                    {!currentEvaluation ? (
                      /* Answer Input Form */
                      <form onSubmit={handleSubmitAnswer}>
                        <textarea
                          rows={6}
                          required
                          value={candidateAnswer}
                          onChange={(e) => setCandidateAnswer(e.target.value)}
                          placeholder="Type your technical answer here (e.g., explain concepts, mention architectures, algorithms, or practical examples)..."
                          style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '10px',
                            background: 'rgba(0,0,0,0.4)',
                            border: '1px solid var(--border-subtle)',
                            color: '#fff',
                            fontSize: '0.95rem',
                            fontFamily: 'var(--font-sans)',
                            lineHeight: '1.6',
                            resize: 'vertical',
                            marginBottom: '1rem'
                          }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {candidateAnswer.trim() ? `${candidateAnswer.trim().split(/\s+/).length} words` : '0 words'}
                          </span>
                          <button
                            type="submit"
                            disabled={submittingAnswer || !candidateAnswer.trim()}
                            style={{
                              padding: '0.8rem 2rem',
                              borderRadius: '8px',
                              background: 'var(--gradient-brand)',
                              border: 'none',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              cursor: (submittingAnswer || !candidateAnswer.trim()) ? 'not-allowed' : 'pointer',
                              boxShadow: 'var(--shadow-glow)',
                              opacity: (submittingAnswer || !candidateAnswer.trim()) ? 0.6 : 1
                            }}
                          >
                            {submittingAnswer ? 'Evaluating with AI...' : 'Submit Answer (Step 9 Evaluation) →'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Step 9: Real-time Evaluation Card */
                      <div>
                        <div style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid var(--border-accent)',
                          borderRadius: '12px',
                          padding: '1.75rem',
                          marginBottom: '1.5rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                              AI Answer Evaluation
                            </span>
                            <span style={{
                              fontSize: '1.25rem',
                              fontWeight: 800,
                              color: currentEvaluation.score >= 8 ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                            }}>
                              Score: {currentEvaluation.score} / 10
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CORRECTNESS</div>
                              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{currentEvaluation.correctness}/10</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TECH DEPTH</div>
                              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{currentEvaluation.technicalDepth}/10</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>COMMUNICATION</div>
                              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{currentEvaluation.communication}/10</div>
                            </div>
                          </div>

                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>FEEDBACK</div>
                            <p style={{ fontSize: '0.95rem', color: '#f8fafc' }}>{currentEvaluation.feedback}</p>
                          </div>

                          {currentEvaluation.missingPoints?.length > 0 && (
                            <div>
                              <div style={{ fontSize: '0.75rem', color: '#fca5a5', marginBottom: '0.25rem' }}>AREAS TO MENTION</div>
                              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {currentEvaluation.missingPoints.map((pt, i) => (
                                  <li key={i}>{pt}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <button
                            onClick={handleNextQuestion}
                            style={{
                              padding: '0.85rem 2.25rem',
                              borderRadius: '8px',
                              background: 'var(--gradient-brand)',
                              border: 'none',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '1rem',
                              cursor: 'pointer'
                            }}
                          >
                            {currentQuestionIndex + 1 < interviewSession.questions.length ? 'Next Question →' : 'Complete Interview & View Final Report →'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🎙️</div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    AI Interview Generator (Step 7 ⭐)
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                    Generates 5 tailored technical & behavioral questions based on your resume, the target job, and identified skill gaps.
                  </p>
                  <button
                    onClick={handleStartInterview}
                    disabled={!uploadedResume || !selectedJob}
                    style={{
                      padding: '0.85rem 2rem',
                      borderRadius: '8px',
                      background: 'var(--gradient-brand)',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: (!uploadedResume || !selectedJob) ? 'not-allowed' : 'pointer',
                      opacity: (!uploadedResume || !selectedJob) ? 0.6 : 1
                    }}
                  >
                    Start AI Mock Interview Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: FINAL DASHBOARD & REPORT (Step 10) */}
          {/* ======================================================== */}
          {activeTab === 'final' && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>HireLens Performance Report</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Position: <strong style={{ color: '#fff' }}>{selectedJob?.title || 'Java Backend Developer'}</strong> at {selectedJob?.company || 'TechCorp Cloud'}
                    </p>
                  </div>
                  <span style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.85rem' }}>
                    EVALUATION COMPLETE
                  </span>
                </div>

                {/* Section 1: Resume Match */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    1. Resume Match Overview
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      border: '4px solid var(--accent-indigo)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-glow)'
                    }}>
                      <div style={{ fontSize: '2rem', fontWeight: 900 }}>{currentAnalysis ? currentAnalysis.overallScore : 78}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ 100</div>
                    </div>
                    <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                          <span>Skills Match</span>
                          <span>{currentAnalysis ? currentAnalysis.skillScore : 80}%</span>
                        </div>
                        <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${currentAnalysis ? currentAnalysis.skillScore : 80}%` }} /></div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                          <span>Keywords Match</span>
                          <span>{currentAnalysis ? currentAnalysis.keywordScore : 75}%</span>
                        </div>
                        <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${currentAnalysis ? currentAnalysis.keywordScore : 75}%` }} /></div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                          <span>Experience Match</span>
                          <span>{currentAnalysis ? currentAnalysis.experienceScore : 82}%</span>
                        </div>
                        <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${currentAnalysis ? currentAnalysis.experienceScore : 82}%` }} /></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Missing Skills */}
                <div style={{ marginBottom: '2.5rem', background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    2. Missing Skills Identified
                  </h4>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {(currentAnalysis?.missingSkills || ['Docker', 'Kafka', 'Microservices']).map(s => (
                      <span key={s} style={{
                        padding: '0.4rem 0.9rem',
                        borderRadius: '6px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Section 3: Interview Performance */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    3. Interview Performance
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TECHNICAL KNOWLEDGE</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>
                        {interviewReport ? interviewReport.technicalKnowledge : 82}%
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>COMMUNICATION</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        {interviewReport ? interviewReport.communication : 88}%
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PROBLEM SOLVING</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                        {interviewReport ? interviewReport.problemSolving : 76}%
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JOB RELEVANCE</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                        {interviewReport ? interviewReport.jobRelevance : 85}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: AI Recommendations & Strengths */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.75rem' }}>
                      Strong Areas
                    </h5>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--accent-emerald)' }}>✓</span> Spring Boot & Dependency Injection
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--accent-emerald)' }}>✓</span> REST APIs & Controller Patterns
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--accent-emerald)' }}>✓</span> Stateless Authentication & JWT
                      </li>
                    </ul>
                  </div>

                  <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-accent)' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#c7d2fe', marginBottom: '0.75rem' }}>
                      AI Recommendations & Action Plan
                    </h5>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <li>→ Improve Docker & container lifecycle knowledge</li>
                      <li>→ Practice system design for high-traffic architectures</li>
                      <li>→ Add automated testing examples (JUnit/Mockito)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                      {jobLoading ? 'Saving...' : 'Save Job'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
