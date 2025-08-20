import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running on port 3000');
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Collections
  getCollections: () => apiClient.get('/get-collections'),
  deleteCollection: (collectionName) => 
    apiClient.delete('/delete-collection', {  collectionName }),
  
  // Messages
  getMessages: (collectionName) => 
    apiClient.get('/get-messages', { params: { collectionName } }),
  clearMessages: (collectionName) => 
    apiClient.post('/clear-messages', { collectionName }),
  
  // Query
  query: (query, collectionName) => 
    apiClient.post('/query', { query, collectionName }),
  
  // Index data
  indexText: (text, collectionName) => 
    apiClient.post('/index', { text, collectionName }),
  
  indexFiles: (files, collectionName) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('collectionName', collectionName);
    
    return apiClient.post('/index', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  indexWebsite: (websiteLink, collectionName) => 
    apiClient.post('/index', { websiteLink, collectionName }),
};
