const axios = require('axios');

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Developer message that sets the assistant's persona
const developerMessage = {
  role: "developer",
  content: [
    {
      type: "text",
      text: "You are a helpful assistant meant to identify the species of aquatic animal in the image. Return your response in valid JSON format with the following structure: { 'species': string, 'facts': string[] }. The species field should contain the identified species name, and the facts field should contain an array of interesting facts about the animal."
    }
  ]
};

// Validate authentication token
// const validateAuth = (req) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return false;
//   }
//   const token = authHeader.split(' ')[1];
//   return token === process.env.OPENAI_API_KEY;
// };

module.exports = async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET request for testing
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'API is running',
      openaiKeySet: !!process.env.OPENAI_API_KEY,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate authentication
  if (!validateAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized - Invalid or missing authentication token' });
  }

  try {
    const { base64Image } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const response = await axios.post(OPENAI_API_URL, {
      model: "gpt-4-vision-preview",
      messages: [
        developerMessage,
        {
          role: "user",
          content: [
            { type: "text", text: "What's in this image?" },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "low"
              }
            }
          ]
        }
      ],
      max_tokens: 300
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    const content = response.data.choices[0].message.content;
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonContent = jsonMatch ? jsonMatch[0] : content;
      const parsedResponse = JSON.parse(jsonContent);
      
      if (!parsedResponse.species || !Array.isArray(parsedResponse.facts)) {
        throw new Error('Invalid response structure');
      }
      
      return res.status(200).json(parsedResponse);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return res.status(200).json({
        species: 'Unknown',
        facts: ['This does not look like a fish to me']
      });
    }
  } catch (error) {
    console.error('Error processing request:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Failed to analyze image',
      details: error.response?.data || error.message 
    });
  }
}; 