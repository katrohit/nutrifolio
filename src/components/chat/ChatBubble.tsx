
import React from 'react';
import { format } from 'date-fns';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: string;
}

const ChatBubble = ({ message, isUser, timestamp }: ChatBubbleProps) => {
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-col">
        <div
          className={`max-w-[300px] rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          {message}
        </div>
        <div className={`mt-1 text-xs text-muted-foreground ${
          isUser ? 'text-right' : 'text-left'
        }`}>
          {formatTimestamp(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
