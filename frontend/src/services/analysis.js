import { authService } from './auth';

export const analysisService = {
  generateAnalysis: async (resumeId, jobId) => {
    const token = authService.getToken();
    if (!token) throw new Error('You must be logged in to generate an analysis');

    const response = await fetch('/api/analyses/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ resumeId, jobId })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to generate ATS analysis');
    }
    return data;
  },

  getLatestAnalysis: async (resumeId, jobId) => {
    const token = authService.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`/api/analyses/latest?resumeId=${resumeId}&jobId=${jobId}`, {
      headers
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Analysis not found');
    }
    return data;
  },

  getMyAnalyses: async () => {
    const token = authService.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch('/api/analyses', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch analyses');
    }
    return data;
  }
};
