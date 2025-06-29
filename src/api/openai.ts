import axios from 'axios';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export function buildFlashcardPrompt(count: number): string {
  return `
  Generate ${count} high-quality flashcards to help someone prepare for job interviews.
  Each flashcard should be a JSON object with two fields: "question" and "answer".

  - Include both behavioral and technical questions.
  - Use the STAR method (Situation, Task, Action, Result) in behavioral answers.
  - Keep questions concise and realistic.
  - Answers should be clear, practical, and ideally 2–4 sentences long.

  Return only a JSON array of the flashcards. No explanations or extra text.
  `.trim();
}

// Debug logging
console.log('API Key exists:', !!OPENAI_API_KEY);
console.log('API Key length:', OPENAI_API_KEY?.length);
console.log('API Key first 4 chars:', OPENAI_API_KEY?.substring(0, 4));

if (!OPENAI_API_KEY) {
  console.error('OpenAI API key is missing. Please check your .env file.');
}

export async function generateFlashcards(prompt: string) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please check your .env file.');
  }

  try {
    console.log('Making API call with key starting with:', OPENAI_API_KEY.substring(0, 4));
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates interview flashcards. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = res.data.choices[0].message.content;
    try {
      // Try to parse the response as JSON
      const parsedContent = JSON.parse(content);
      
      // Handle both array and object with flashcards key
      const flashcards = Array.isArray(parsedContent) ? parsedContent : parsedContent.flashcards;
      
      if (!Array.isArray(flashcards)) {
        throw new Error('Response is not an array of flashcards');
      }
      
      return flashcards;
    } catch (e) {
      console.error('Failed to parse OpenAI response as JSON:', e);
      console.error('Raw response:', content);
      throw new Error('Failed to parse the AI response. Please try again.');
    }
  } catch (error: any) {
    console.error('Error calling OpenAI API:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response:', error.response.data);
      throw new Error(`OpenAI API error: ${error.response.data.error?.message || 'Unknown error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from OpenAI API. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Error: ${error.message}`);
    }
  }
} 