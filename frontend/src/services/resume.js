import { authService } from './auth';

export const resumeService = {
  uploadResume: async (file) => {
    const token = authService.getToken();
    if (!token) throw new Error('You must be logged in to upload a resume');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/resumes/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Notice: Content-Type is deliberately omitted so the browser sets multipart/form-data with proper boundary!
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to parse and upload resume');
    }

    return data;
  },

  fetchMyResumes: async () => {
    const token = authService.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch('/api/resumes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch resumes');
    }

    return data;
  }
};
