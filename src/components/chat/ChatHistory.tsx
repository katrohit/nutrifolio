
import React, { useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';
import { ChatMessage } from '@/types/chat';

interface ChatHistoryProps {
  chatHistory: ChatMessage[];
}

const ChatHistory = ({ chatHistory }: ChatHistoryProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when chat history changes
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Handle keyboard showing on mobile
  useEffect(() => {
    const handleResize = () => {
      if (chatContainerRef.current && bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={chatContainerRef} 
      className="chat-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto p-4"
    >
      {chatHistory.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground">
          <p className="mb-2">No messages yet</p>
          <p className="text-sm">
            Try adding something like "1 banana" or "300g grilled chicken"
          </p>
        </div>
      ) : (
        <>
          {chatHistory.map((chat) => (
            <ChatBubble 
              key={chat.id}
              message={chat.message}
              isUser={chat.isUser}
              timestamp={chat.createdAt}
            />
          ))}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
};

export default ChatHistory;
