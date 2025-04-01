
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Calendar, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 z-10 w-full border-t bg-background p-2 md:top-0 md:bottom-auto md:h-full md:w-auto md:border-r md:border-t-0 md:p-4">
      <div className="mx-auto flex max-w-md items-center justify-between gap-1 md:h-full md:flex-col md:items-start md:justify-start md:gap-6">
        {/* Logo/Brand - only show on large screens */}
        <div className="hidden items-center gap-3 py-4 md:flex">
          <div className="rounded-full bg-primary p-2 text-primary-foreground">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3ZM9 17H6C5.45 17 5 16.55 5 16V12C5 11.45 5.45 11 6 11H9C9.55 11 10 11.45 10 12V16C10 16.55 9.55 17 9 17ZM13.83 17H12.33C11.78 17 11.33 16.55 11.33 16V8C11.33 7.45 11.78 7 12.33 7H13.83C14.38 7 14.83 7.45 14.83 8V16C14.83 16.55 14.38 17 13.83 17ZM19 17H16.5C15.95 17 15.5 16.55 15.5 16V10C15.5 9.45 15.95 9 16.5 9H19C19.55 9 20 9.45 20 10V16C20 16.55 19.55 17 19 17Z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-foreground">NutriFolio</span>
        </div>

        {/* Nav Links */}
        <Link 
          to="/dashboard" 
          className={cn(
            "flex items-center gap-3 rounded-md px-4 py-2 transition-colors",
            isActive("/dashboard") 
              ? "bg-primary text-primary-foreground" 
              : "text-foreground hover:bg-muted"
          )}
        >
          <Home className="h-5 w-5" />
          <span className="hidden md:inline">Dashboard</span>
        </Link>
        
        <Link 
          to="/history" 
          className={cn(
            "flex items-center gap-3 rounded-md px-4 py-2 transition-colors",
            isActive("/history") 
              ? "bg-primary text-primary-foreground" 
              : "text-foreground hover:bg-muted"
          )}
        >
          <Calendar className="h-5 w-5" />
          <span className="hidden md:inline">History</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={cn(
            "flex items-center gap-3 rounded-md px-4 py-2 transition-colors",
            isActive("/profile") 
              ? "bg-primary text-primary-foreground" 
              : "text-foreground hover:bg-muted"
          )}
        >
          <User className="h-5 w-5" />
          <span className="hidden md:inline">Profile</span>
        </Link>

        {/* Sign Out Button - positioned at bottom for desktop */}
        <Button 
          variant="ghost" 
          className="mt-auto hidden items-center gap-3 px-4 py-2 md:flex"
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </Button>

        {/* Mobile Only Sign Out - show at bottom nav */}
        <Button 
          variant="ghost" 
          className="flex items-center gap-3 px-4 py-2 md:hidden"
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Navigation;
