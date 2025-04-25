import axios from 'axios';
import { config } from '../config/env';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Developer message that sets the assistant's persona
const developerMessage1 = {
  role: "developer",
  content: [
    {
      type: "text",
      text: "You are a helpful assistant meant to identify the species of aquatic animal in the image. Return your response in valid JSON format with the following structure: { 'species': string, 'facts': string[] }. The species field should contain the identified species name, and the facts field should contain an array of interesting facts about the animal."
    }
  ]
};

export const analyzeImage = async (base64Image) => {
  try {
    const response = await axios.post(OPENAI_API_URL, {
      model: "gpt-4o-mini",
      messages: [
        // Insert developer message
        developerMessage1,
        {
          role: "user",
          content: [
            { type: "text", text: "What's in this image?" },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "low" // This can be "low", "high", or "auto"
              }
            }
          ]
        }
      ],
      max_tokens: 300
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openai.apiKey}`
      }
    });

    // Parse the response content as JSON to get the structured data
    const content = response.data.choices[0].message.content;
    try {
      // Try to parse the response as JSON
      // First, try to extract JSON if it's wrapped in other text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonContent = jsonMatch ? jsonMatch[0] : content;
      
      const parsedResponse = JSON.parse(jsonContent);
      
      // Ensure the response has the expected structure
      if (!parsedResponse.species || !Array.isArray(parsedResponse.facts)) {
        throw new Error('Invalid response structure');
      }
      
      return {
        species: parsedResponse.species,
        facts: parsedResponse.facts
      };
    } catch (parseError) {
      // If parsing fails, return a structured error response
      console.warn('Failed to parse response:', parseError);
      return {
        species: 'Unknown',
        facts: ['This does not look like a fish to me']
      };
    }
  } catch (error) {
    // Improved error logging
    if (error.response) {
      console.error('OpenAI API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

