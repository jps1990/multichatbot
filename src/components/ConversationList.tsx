import React, { useState } from 'react';
import { Plus, Trash, Edit2, Check } from 'lucide-react';
import { Conversation } from '../types';

interface ConversationListProps {
  conversations: Conversation[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onNew: () => void;
  onDelete: (index: number) => void;
  onUpdateTitle: (index: number, newTitle: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentIndex,
  onSelect,
  onNew,
  onDelete,
  onUpdateTitle
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    setEditingTitle(conversations[index].title);
  };

  const handleEditSave = (index: number) => {
    onUpdateTitle(index, editingTitle.trim() || `Conversation ${index + 1}`);
    setEditingIndex(null);
  };

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
            className={`flex justify-between items-center p-2 rounded ${
              index === currentIndex ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            {editingIndex === index ? (
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditSave(index);
                  if (e.key === 'Escape') setEditingIndex(null);
                }}
                className="flex-grow bg-gray-700 text-white px-2 py-1 rounded mr-2"
                autoFocus
              />
            ) : (
              <span 
                className="truncate cursor-pointer flex-grow"
                onClick={() => onSelect(index)}
              >
                {conversation.title}
              </span>
            )}
            <div className="flex space-x-1">
              {editingIndex === index ? (
                <button
                  onClick={() => handleEditSave(index)}
                  className="p-1 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <Check size={16} />
                </button>
              ) : (
                <button
                  onClick={() => handleEditStart(index)}
                  className="p-1 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Edit2 size={16} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(index);
                }}
                className="p-1 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Trash size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;