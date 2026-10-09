import { authService } from './auth';

export const jobService = {
  getAllJobs: async () => {
    const token = authService.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch('/api/jobs', { headers });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch job descriptions');
    }
    return data;
  },

  getJobById: async (id) => {
    const token = authService.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`/api/jobs/${id}`, { headers });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Job description not found');
    }
    return data;
  },

  createJob: async (title, company, description) => {
    const token = authService.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers,
      body: JSON.stringify({ title, company, description })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to create job description');
    }
    return data;
  }
};
