import React from 'react';

interface ConfigPanelProps {
  apiKeys: {
    openai: string;
    anthropic: string;
    cohere: string;
  };
  setApiKeys: (keys: { openai: string; anthropic: string; cohere: string }) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  apiKeys,
  setApiKeys,
  temperature,
  setTemperature,
  systemPrompt,
  setSystemPrompt,
  userPrompt,
  setUserPrompt
}) => {
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Configuration</h2>
      <div className="mb-4">
        <label htmlFor="openaiApiKey" className="block mb-2">OpenAI API Key</label>
        <input
          type="password"
          id="openaiApiKey"
          value={apiKeys.openai}
          onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Enter your OpenAI API key"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="anthropicApiKey" className="block mb-2">Anthropic API Key</label>
        <input
          type="password"
          id="anthropicApiKey"
          value={apiKeys.anthropic}
          onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Enter your Anthropic API key"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="cohereApiKey" className="block mb-2">Cohere API Key</label>
        <input
          type="password"
          id="cohereApiKey"
          value={apiKeys.cohere}
          onChange={(e) => setApiKeys({ ...apiKeys, cohere: e.target.value })}
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Enter your Cohere API key"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="temperature" className="block mb-2">Temperature: {temperature}</label>
        <input
          type="range"
          id="temperature"
          min="0"
          max="1"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="systemPrompt" className="block mb-2">System Prompt</label>
        <textarea
          id="systemPrompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
          rows={4}
          placeholder="Enter system prompt"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="userPrompt" className="block mb-2">User Prompt</label>
        <textarea
          id="userPrompt"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
          rows={4}
          placeholder="Enter user prompt"
        />
      </div>
    </div>
  );
};

export default ConfigPanel;