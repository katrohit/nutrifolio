
import React from 'react';
import ChatInterface from '@/components/ChatInterface';
import DailySummary from '@/components/DailySummary';
import RecentFoods from '@/components/RecentFoods';

const Dashboard = () => {
  return (
    <div className="container grid grid-cols-1 gap-6 pb-16 pt-6 md:grid-cols-2 md:pb-6 lg:grid-cols-3">
      {/* Left column - Daily Summary */}
      <div className="space-y-6">
        <DailySummary />
      </div>

      {/* Middle column - Chat Interface */}
      <div className="md:col-span-1 lg:col-span-1">
        <h2 className="mb-4 text-2xl font-bold">Log Your Food</h2>
        <div className="h-[calc(100vh-180px)]">
          <ChatInterface />
        </div>
      </div>

      {/* Right column - Recent Foods */}
      <div className="space-y-6">
        <RecentFoods />
      </div>
    </div>
  );
};

export default Dashboard;
