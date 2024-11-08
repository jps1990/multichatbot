import { Message, ApiResponse } from '../types';

export const createMessage = (
  role: 'user' | 'assistant' | 'system',
  content: string,
  type: 'text' | 'image' | 'error' = 'text'
): Message => ({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  role,
  content,
  type,
  timestamp: Date.now()
});

export const processApiResponse = (
  provider: string,
  response: any
): ApiResponse => {
  try {
    let content: string;

    switch (provider) {
      case 'openai':
        content = response.data.choices[0].message.content;
        break;
      case 'anthropic':
        content = response.data.completion;
        break;
      case 'cohere':
        content = response.data.generations[0].text;
        break;
      default:
        throw new Error('Unsupported provider');
    }

    // Check for image generation request format
    const imageMatch = content.match(/<<IMAGE_REQUEST>>([\s\S]*?)<<END_IMAGE_REQUEST>>/);
    if (imageMatch) {
      try {
        const imageRequest = JSON.parse(imageMatch[1].trim());
        return {
          content: JSON.stringify(imageRequest),
          type: 'image'
        };
      } catch (error) {
        return {
          content: 'Invalid image generation request format',
          type: 'error'
        };
      }
    }

    // Regular text response
    return { 
      content,
      type: 'text'
    };
  } catch (error) {
    return {
      content: error instanceof Error ? error.message : 'Unknown error occurred',
      type: 'error'
    };
  }
};