import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ChatNavigationProps {
  messages: Array<{
    text: string;
    isUser: boolean;
    timestamp?: string;
  }>;
  currentMessageIndex: number;
  onNavigate: (index: number) => void;
}

export function ChatNavigation({ messages, currentMessageIndex, onNavigate }: ChatNavigationProps) {
  const scrollToMessage = (index: number) => {
    onNavigate(index);
  };

  const scrollUp = () => {
    if (currentMessageIndex > 0) {
      onNavigate(currentMessageIndex - 1);
    }
  };

  const scrollDown = () => {
    if (currentMessageIndex < messages.length - 1) {
      onNavigate(currentMessageIndex + 1);
    }
  };

  return (
    <div className="w-[120px] flex flex-col h-full border-l border-yellow-100">
      {/* Up Arrow */}
      <button
        onClick={scrollUp}
        disabled={currentMessageIndex === 0}
        className={`p-2 flex justify-center items-center border-b border-yellow-100 
          ${currentMessageIndex === 0 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-yellow-600 hover:bg-yellow-50 arrow-hover'
          }`}
        aria-label="Scroll to previous message"
      >
        <ChevronUp size={20} />
      </button>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto chat-nav-container py-2">
        {messages.map((message, index) => (
          <button
            key={index}
            onClick={() => scrollToMessage(index)}
            className={`w-full px-3 py-2 text-left text-xs transition-colors nav-item-hover focus-visible
              ${index === currentMessageIndex 
                ? 'bg-yellow-50 text-yellow-700' 
                : 'text-gray-600 hover:bg-yellow-50/50'
              }`}
            aria-label={`Navigate to message ${index + 1}`}
          >
            <div className="font-medium mb-1">
              {message.isUser ? 'You' : 'Assistant'}
            </div>
            <div className="text-[10px] text-gray-400">
              {message.timestamp}
            </div>
          </button>
        ))}
      </div>

      {/* Down Arrow */}
      <button
        onClick={scrollDown}
        disabled={currentMessageIndex === messages.length - 1}
        className={`p-2 flex justify-center items-center border-t border-yellow-100
          ${currentMessageIndex === messages.length - 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-yellow-600 hover:bg-yellow-50 arrow-hover'
          }`}
        aria-label="Scroll to next message"
      >
        <ChevronDown size={20} />
      </button>
    </div>
  );
}