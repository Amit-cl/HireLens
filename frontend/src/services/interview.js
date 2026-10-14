import { authService } from './auth';

export const interviewService = {
  generateInterview: async (resumeId, jobId) => {
    const token = authService.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch('/api/interviews/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ resumeId, jobId })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to generate interview questions');
    }
    return data;
  },

  submitAnswer: async (sessionId, question, answer) => {
    const token = authService.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`/api/interviews/sessions/${sessionId}/answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ question, answer })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit answer');
    }
    return data;
  },

  completeInterview: async (sessionId) => {
    const token = authService.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`/api/interviews/sessions/${sessionId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to complete interview');
    }
    return data;
  },

  getReport: async (sessionId) => {
    const token = authService.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`/api/interviews/sessions/${sessionId}/report`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Report not found');
    }
    return data;
  }
};
