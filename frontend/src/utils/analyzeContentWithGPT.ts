import axios from 'axios';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function analyzeContentWithGPT(transcript: string, cardType: 'behavioral' | 'technical'): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please check your .env file.');
  }

  const prompt =
    cardType === 'behavioral'
      ? `Evaluate this behavioral interview response for tone, confidence, and clarity:\n\n"${transcript}"`
      : `Evaluate this technical interview response for correctness and completeness:\n\n"${transcript}"`;

  try {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that evaluates interview answers. Always respond with clear, concise feedback.'
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
    return content;
  } catch (error: any) {
    console.error('Error calling OpenAI API:', error);
    if (error.response) {
      throw new Error(`OpenAI API error: ${error.response.data.error?.message || 'Unknown error'}`);
    } else if (error.request) {
      throw new Error('No response from OpenAI API. Please check your internet connection.');
    } else {
      throw new Error(`Error: ${error.message}`);
    }
  }
} 