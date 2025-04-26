import axios from 'axios';

// Create axios instance with defaults
const api = axios.create({
  timeout: 10000, // 10 seconds
  maxContentLength: 10 * 1024 * 1024, // 10MB max content length
  maxBodyLength: 10 * 1024 * 1024, // 10MB max body length
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Add Authorization header
  }
});

// Add retry configuration
api.defaults.retry = 3;
api.defaults.retryDelay = 1000;

// Vercel deployment URL
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://lets-go-fishing-o10do50vq-emmylia321s-projects.vercel.app';

console.log('Using API URL:', API_URL); // Debug log

// Add request interceptor
api.interceptors.request.use((config) => {
  // Validate request
  if (!config.url?.startsWith('https://')) {
    throw new Error('Only HTTPS endpoints are allowed');
  }
  
  // Add token to request if not present
  if (!config.headers.Authorization && process.env.OPENAI_API_KEY) {
    config.headers.Authorization = `Bearer ${process.env.OPENAI_API_KEY}`;
  }
  
  return config;
});

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication error:', error.response.data);
      // You might want to trigger a re-authentication here
    }
    throw error;
  }
);

export const analyzeImage = async (base64Image) => {
  try {
    console.log('Making request to:', `${API_URL}/api/analyze-fish`); // Debug log
    const response = await api.post(`${API_URL}/api/analyze-fish`, {
      base64Image
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return {
      species: response.data.species,
      facts: response.data.facts
    };
  } catch (error) {
    console.error('Error analyzing image:', error.response?.data || error.message);
    throw error;
  }
};

