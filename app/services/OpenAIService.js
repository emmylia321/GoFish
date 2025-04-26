import axios from 'axios';

// Set global Axios defaults
axios.defaults.timeout = 10000; // 10 seconds
axios.defaults.maxContentLength = 10 * 1024 * 1024; // 10MB max content length
axios.defaults.maxBodyLength = 10 * 1024 * 1024; // 10MB max body length
axios.defaults.headers.common['Content-Security-Policy'] = "upgrade-insecure-requests";
axios.defaults.retry = 3;
axios.defaults.retryDelay = 1000;

// Require API URL from environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL environment variable is required');
}


axios.interceptors.request.use((config) => {
  // Validate request
  if (!config.url?.startsWith('https://')) {
    throw new Error('Only HTTPS endpoints are allowed');
  }
  return config;
});

export const analyzeImage = async (base64Image) => {
  try {
    const response = await axios.post(`${API_URL}/api/analyze-fish`, {
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
    console.error('Error analyzing image:', error.response?.status, error.response?.data); // Enhanced error logging
    throw error;
  }
};

