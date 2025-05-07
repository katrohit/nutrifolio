
import React from 'react';
import ChatHistory from './chat/ChatHistory';
import ChatInputBar from './chat/ChatInputBar';
import { useChat } from '@/hooks/useChat';

const ChatInterface = () => {
  const { chatHistory, loading, handleSubmit } = useChat();
  
  return (
    <div className="flex h-full w-full flex-col rounded-lg border bg-white shadow-sm">
      <ChatHistory chatHistory={chatHistory} />
      <ChatInputBar 
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
};

export default ChatInterface;
