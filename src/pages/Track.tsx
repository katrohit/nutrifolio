
import React from 'react';
import ChatInterface from '@/components/ChatInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Track = () => {
  return (
    <div className="container max-w-5xl py-6">
      <div className="grid gap-6">
        <div>
          <h1 className="mb-6 text-2xl font-bold">Log Your Food</h1>
          <div className="h-[calc(100vh-300px)]">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Track;
