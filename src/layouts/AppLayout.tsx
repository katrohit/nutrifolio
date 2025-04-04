
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '@/components/Navigation';

const AppLayout = () => {
  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Navigation />
      <main className="flex-1 w-full md:pl-16 lg:pl-20">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
