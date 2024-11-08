import React from 'react';
import { Plus, Trash } from 'lucide-react';
import { Conversation } from '../types';

interface ConversationListProps {
  conversations: Conversation[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onNew: () => void;
  onDelete: (index: number) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentIndex,
  onSelect,
  onNew,
  onDelete
}) => {
  return (
    <div className="w-64 bg-gray-800 p-4 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Conversations</h2>
        <button
          onClick={onNew}
          className="p-1 rounded-full bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus size={20} />
        </button>
      </div>
      <ul className="space-y-2">
        {conversations.map((conversation, index) => (
          <li
            key={conversation.id}
            className={`flex justify-between items-center p-2 rounded cursor-pointer ${
              index === currentIndex ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
            onClick={() => onSelect(index)}
          >
            <span className="truncate">Conversation {index + 1}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(index);
              }}
              className="p-1 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <Trash size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;