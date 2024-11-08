import React from 'react';

interface ModelSelectorProps {
  models: {
    [key: string]: string[];
  };
  selectedModel: string;
  selectedProvider: string;
  onSelectModel: (model: string) => void;
  onSelectProvider: (provider: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  selectedProvider,
  onSelectModel,
  onSelectProvider
}) => {
  return (
    <div className="flex space-x-2">
      <select
        value={selectedProvider}
        onChange={(e) => {
          const newProvider = e.target.value;
          onSelectProvider(newProvider);
          onSelectModel(models[newProvider][0]);
        }}
        className="p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Object.keys(models).map((provider) => (
          <option key={provider} value={provider}>
            {provider.charAt(0).toUpperCase() + provider.slice(1)}
          </option>
        ))}
      </select>
      <select
        value={selectedModel}
        onChange={(e) => onSelectModel(e.target.value)}
        className="flex-grow p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {models[selectedProvider].map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector;