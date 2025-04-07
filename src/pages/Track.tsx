
import React from 'react';
import ChatInterface from '@/components/ChatInterface';

const Track = () => {
  return (
    <div className="w-full h-full">
      <div className="px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">Log Your Food</h1>
        <div className="h-[calc(100vh-150px)]">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default Track;
