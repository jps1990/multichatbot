import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Mic, VolumeX, Plus, Trash } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import ModelSelector from './components/ModelSelector';
import ConfigPanel from './components/ConfigPanel';
import ConversationList from './components/ConversationList';
import FileUpload from './components/FileUpload';
import { Message, Conversation, ApiKeys } from './types';
import { handleKeyboardShortcuts } from './utils/keyboardShortcuts';
import { handleApiCall, generateImage } from './utils/apiHelpers';
import { createMessage } from './utils/messageHandlers';

export const models = {
  openai: [
    'gpt-4o',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'dall-e-3',
    'dall-e-2'
  ],
  anthropic: [
    'claude-3.5-sonnet-20241022',
    'claude-3.5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ],
  cohere: [
    'command-r-plus-04-2024',
    'command-r-08-2024',
    'command',
    'command-light',
    'command-nightly'
  ]
};

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([{
    id: Date.now(), messages: [],
    title: ''
  }]);
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  const [input, setInput] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: '',
    anthropic: '',
    cohere: '',
  });
  const [selectedModel, setSelectedModel] = useState(models.openai[0]);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [temperature, setTemperature] = useState(0.7);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [userPrompt, setUserPrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const recognitionRef = useRef<typeof window.webkitSpeechRecognition | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  }, [isListening]);

  const newLine = useCallback(() => {
    if (inputRef.current) {
      const { selectionStart, selectionEnd } = inputRef.current;
      const newValue = input.substring(0, selectionStart) + '\n' + input.substring(selectionEnd);
      setInput(newValue);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = inputRef.current.selectionEnd = selectionStart + 1;
        }
      }, 0);
    }
  }, [input]);

  const handleSend = useCallback(async () => {
    if (!input.trim() && !uploadedFile) return;

    const userMessage = createMessage('user', input);
    const updatedConversations = conversations.map((conv, index) => 
      index === currentConversationIndex 
        ? { ...conv, messages: [...conv.messages, userMessage] }
        : conv
    );
    setConversations(updatedConversations);
    setInput('');

    try {
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}\n\n${input}`;
      const response = await handleApiCall(selectedProvider, selectedModel, apiKeys as unknown as { [key: string]: string }, fullPrompt, temperature, uploadedFile);

      if (response.type === 'image') {
        setIsGeneratingImage(true);
        try {
          const imageRequest = JSON.parse(response.content);
          const imageUrl = await generateImage(apiKeys.openai, imageRequest);
          const imageMessage = createMessage('assistant', imageUrl, 'image');
          
          const newUpdatedConversations = updatedConversations.map((conv, index) => 
            index === currentConversationIndex 
              ? { ...conv, messages: [...conv.messages, imageMessage] }
              : conv
          );
          setConversations(newUpdatedConversations);
        } catch (error) {
          const errorMessage = createMessage(
            'system',
            error instanceof Error ? error.message : 'Failed to generate image',
            'error'
          );
          const newUpdatedConversations = updatedConversations.map((conv, index) => 
            index === currentConversationIndex 
              ? { ...conv, messages: [...conv.messages, errorMessage] }
              : conv
          );
          setConversations(newUpdatedConversations);
        } finally {
          setIsGeneratingImage(false);
        }
      } else {
        const assistantMessage = createMessage('assistant', response.content, response.type);
        const newUpdatedConversations = updatedConversations.map((conv, index) => 
          index === currentConversationIndex 
            ? { ...conv, messages: [...conv.messages, assistantMessage] }
            : conv
        );
        setConversations(newUpdatedConversations);
      }

      setUploadedFile(null);
    } catch (error) {
      const errorMessage = createMessage(
        'system',
        error instanceof Error ? error.message : 'An error occurred',
        'error'
      );
      const newUpdatedConversations = updatedConversations.map((conv, index) => 
        index === currentConversationIndex 
          ? { ...conv, messages: [...conv.messages, errorMessage] }
          : conv
      );
      setConversations(newUpdatedConversations);
    }
  }, [input, uploadedFile, systemPrompt, userPrompt, selectedProvider, selectedModel, apiKeys, temperature]);

  const speakText = async (text: string) => {
    if (isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKeys.openai}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: 'alloy',
        }),
      });

      if (!response.ok) throw new Error('Speech generation failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsSpeaking(false);
    }
  };

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now(),
      title: `Conversation ${conversations.length + 1}`,
      messages: []
    };
    setConversations([...conversations, newConversation]);
    setCurrentConversationIndex(conversations.length);
  };

  const deleteConversation = (index: number) => {
    const updatedConversations = conversations.filter((_, i) => i !== index);
    setConversations(updatedConversations);
    if (currentConversationIndex >= updatedConversations.length) {
      setCurrentConversationIndex(Math.max(0, updatedConversations.length - 1));
    }
  };

  const updateConversationTitle = (index: number, newTitle: string) => {
    const updatedConversations = conversations.map((conv, i) => 
      i === index ? { ...conv, title: newTitle } : conv
    );
    setConversations(updatedConversations);
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      handleKeyboardShortcuts(event, handleSend, toggleListening, newLine);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSend, toggleListening, newLine, input]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-blue-300">
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">
          <Bot className="mr-2" /> Enhanced Multi-Provider AI Chatbot
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded ${
              activeTab === 'chat' ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded ${
              activeTab === 'config' ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            Config
          </button>
        </div>
      </header>
      {activeTab === 'chat' ? (
        <div className="flex flex-grow overflow-hidden">
          <ConversationList
            conversations={conversations}
            currentIndex={currentConversationIndex}
            onSelect={setCurrentConversationIndex}
            onNew={createNewConversation}
            onDelete={deleteConversation}
            onUpdateTitle={updateConversationTitle}
          />
          <div className="flex-grow flex flex-col">
            <div className="flex-grow overflow-auto p-4 space-y-4">
              {conversations[currentConversationIndex].messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onSpeak={speakText}
                />
              ))}
              {isGeneratingImage && (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2">Generating image...</span>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-800">
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                selectedProvider={selectedProvider}
                onSelectModel={setSelectedModel}
                onSelectProvider={setSelectedProvider}
              />
              <div className="flex mt-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow p-2 rounded-l-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your message..."
                  rows={3}
                  ref={inputRef}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <FileUpload onFileUpload={setUploadedFile} />
                <button
                  onClick={toggleListening}
                  className={`p-2 ${isListening ? 'bg-red-600' : 'bg-green-600'} text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {isListening ? <VolumeX size={24} /> : <Mic size={24} />}
                </button>
                <button
                  onClick={handleSend}
                  className="bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-grow p-4 overflow-auto">
          <ConfigPanel
            apiKeys={apiKeys}
            setApiKeys={setApiKeys}
            temperature={temperature}
            setTemperature={setTemperature}
            systemPrompt={systemPrompt}
            setSystemPrompt={setSystemPrompt}
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
          />
        </div>
      )}
    </div>
  );
}

export default App;