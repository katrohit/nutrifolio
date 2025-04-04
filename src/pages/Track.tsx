
import React from 'react';
import ChatInterface from '@/components/ChatInterface';

const Track = () => {
  return (
    <div className="container max-w-5xl py-6">
      <h1 className="mb-6 text-2xl font-bold">Log Your Food</h1>
      <div className="mx-auto h-[calc(100vh-200px)]">
        <ChatInterface />
      </div>
    </div>
  );
};

export default Track;
