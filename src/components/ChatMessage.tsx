import React from 'react';
import { Bot, User, Volume2 } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onSpeak: (text: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSpeak }) => {
  const { role, content, type = 'text' } = message;
  const isUser = role === 'user';

  const renderContent = () => {
    switch (type) {
      case 'image':
        return (
          <img 
            src={content} 
            alt="Generated" 
            className="max-w-full h-auto rounded-lg shadow-lg"
            loading="lazy"
          />
        );
      case 'error':
        return (
          <p className="text-red-400">
            {content}
          </p>
        );
      default:
        return (
          <p className="text-white whitespace-pre-wrap break-words">
            {content}
          </p>
        );
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start space-x-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`p-2 rounded-full ${isUser ? 'bg-blue-600' : 'bg-gray-700'}`}>
          {isUser ? <User size={24} /> : <Bot size={24} />}
        </div>
        <div className={`p-3 rounded-lg ${isUser ? 'bg-blue-500' : 'bg-gray-800'} max-w-md relative`}>
          {renderContent()}
          {!isUser && type === 'text' && (
            <button
              onClick={() => onSpeak(content)}
              className="absolute bottom-1 right-1 p-1 rounded-full bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Speak message"
            >
              <Volume2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;