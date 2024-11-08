import axios, { AxiosError } from 'axios';
import { ApiResponse } from '../types';
import { processApiResponse } from './messageHandlers';

export const handleApiCall = async (
  provider: string,
  model: string,
  apiKeys: { [key: string]: string },
  prompt: string,
  temperature: number,
  uploadedFile: File | null
): Promise<ApiResponse> => {
  // Check for API key before making the request
  if (!apiKeys[provider]) {
    return {
      content: `Please provide a valid ${provider.toUpperCase()} API key in the configuration panel.`,
      type: 'error'
    };
  }

  try {
    const response = await makeApiRequest(provider, model, apiKeys, prompt, temperature, uploadedFile);
    return processApiResponse(provider, response);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        return {
          content: `Invalid ${provider.toUpperCase()} API key. Please check your API key in the configuration panel.`,
          type: 'error'
        };
      }
      return {
        content: axiosError.response?.data?.error?.message || axiosError.message,
        type: 'error'
      };
    }
    return {
      content: error instanceof Error ? error.message : 'API call failed',
      type: 'error'
    };
  }
};

const makeApiRequest = async (
  provider: string,
  model: string,
  apiKeys: { [key: string]: string },
  prompt: string,
  temperature: number,
  uploadedFile: File | null
) => {
  const headers = {
    'Authorization': `Bearer ${apiKeys[provider]}`,
    'Content-Type': 'application/json',
  };

  switch (provider) {
    case 'openai':
      if (model === 'gpt-4-vision-preview' && uploadedFile) {
        const base64Image = await fileToBase64(uploadedFile);
        return axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4-vision-preview',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                ]
              }
            ],
            max_tokens: 300,
          },
          { headers }
        );
      }
      return axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature,
        },
        { headers }
      );

    case 'anthropic':
      return axios.post(
        'https://api.anthropic.com/v1/complete',
        {
          prompt,
          model,
          max_tokens_to_sample: 300,
          temperature,
        },
        { headers }
      );

    case 'cohere':
      return axios.post(
        'https://api.cohere.ai/v1/generate',
        {
          prompt,
          model,
          max_tokens: 300,
          temperature,
        },
        { headers }
      );

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};

export const generateImage = async (apiKey: string, imageRequest: any): Promise<string> => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      imageRequest,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.data[0].url;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || error.message);
    }
    throw error;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};