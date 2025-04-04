
import React from 'react';
import DailySummary from '@/components/DailySummary';
import RecentFoods from '@/components/RecentFoods';

const Analyze = () => {
  return (
    <div className="container max-w-5xl pb-16 pt-6">
      <h1 className="mb-6 text-2xl font-bold">Nutrition Analysis</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <DailySummary />
        </div>
        <div>
          <RecentFoods />
        </div>
      </div>
    </div>
  );
};

export default Analyze;
