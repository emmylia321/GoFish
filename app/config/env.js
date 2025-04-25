import { OPENAI_API_KEY } from 'react-native-dotenv';

// Debug logs
console.log('Environment variables debug:');
console.log('OPENAI_API_KEY exists:', !!OPENAI_API_KEY);
console.log('OPENAI_API_KEY value:', OPENAI_API_KEY ? 'Has value' : 'No value');

// Validate environment variables
if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is missing in environment variables');
}

export const config = {
  openai: {
    apiKey: OPENAI_API_KEY,
    // Add other OpenAI-related config here
  },
  // Add other configuration categories as needed
}; 