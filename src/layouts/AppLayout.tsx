
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '@/components/Navigation';

const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
