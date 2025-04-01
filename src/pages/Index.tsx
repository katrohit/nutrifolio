
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 z-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(#4CAF50 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        ></div>

        <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 sm:pb-32 lg:flex lg:px-8 lg:pt-24">
          <div className="relative z-10 mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
            <div className="flex">
              <div className="relative flex items-center gap-3 rounded-full bg-nutrifolio-light px-4 py-1 text-sm leading-6 text-nutrifolio-dark ring-1 ring-inset ring-nutrifolio-primary/20">
                <svg className="h-5 w-5 text-nutrifolio-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3ZM9 17H6C5.45 17 5 16.55 5 16V12C5 11.45 5.45 11 6 11H9C9.55 11 10 11.45 10 12V16C10 16.55 9.55 17 9 17ZM13.83 17H12.33C11.78 17 11.33 16.55 11.33 16V8C11.33 7.45 11.78 7 12.33 7H13.83C14.38 7 14.83 7.45 14.83 8V16C14.83 16.55 14.38 17 13.83 17ZM19 17H16.5C15.95 17 15.5 16.55 15.5 16V10C15.5 9.45 15.95 9 16.5 9H19C19.55 9 20 9.45 20 10V16C20 16.55 19.55 17 19 17Z" />
                </svg>
                Tracking made simple
              </div>
            </div>
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Nutrition tracking with{' '}
              <span className="text-nutrifolio-primary">
                AI simplicity
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              NutriFolio makes tracking your nutrition effortless with a simple chat interface. 
              Just tell us what you ate, and we'll handle the rest. 
              No more searching through databases or scanning barcodes.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              {user ? (
                <Button asChild size="lg" className="px-8 py-6 text-base">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="px-8 py-6 text-base">
                    <Link to="/register">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="px-6 py-6 text-base">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="relative mt-16 sm:mt-24 lg:mt-0">
            <div className="flex justify-center lg:justify-end">
              <div className="relative max-w-[360px]">
                <div className={cn(
                  "overflow-hidden rounded-[2.5rem] bg-white shadow-xl ring-1",
                  "ring-gray-900/10 sm:w-[360px]"
                )}>
                  {/* Mock phone screen */}
                  <div className="px-4 py-8">
                    {/* Chat header */}
                    <div className="mb-4 text-center">
                      <div className="text-lg font-medium">NutriFolio</div>
                    </div>
                    
                    {/* Chat messages */}
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <div className="max-w-[80%] rounded-lg bg-nutrifolio-primary px-4 py-2 text-white">
                          I had a banana for breakfast
                        </div>
                      </div>
                      <div className="flex">
                        <div className="max-w-[80%] rounded-lg bg-gray-100 px-4 py-2 text-gray-800">
                          I've logged 1 medium banana (118g): 105 calories, 0.3g fat, 1.3g protein, 27g carbs
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="max-w-[80%] rounded-lg bg-nutrifolio-primary px-4 py-2 text-white">
                          200g grilled chicken for lunch
                        </div>
                      </div>
                      <div className="flex">
                        <div className="max-w-[80%] rounded-lg bg-gray-100 px-4 py-2 text-gray-800">
                          I've logged 200g of grilled chicken breast: 330 calories, 7.2g fat, 62g protein, 0g carbs
                        </div>
                      </div>
                    </div>
                    
                    {/* Chat input */}
                    <div className="mt-4">
                      <div className="flex items-center rounded-full border border-gray-300 bg-white px-4 py-2">
                        <div className="flex-1 text-sm text-gray-500">Type what you ate...</div>
                        <button className="rounded-full bg-nutrifolio-primary p-1 text-white">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 2L11 13" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="bg-nutrifolio-light py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Track Your Nutrition Effortlessly
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              NutriFolio simplifies nutrition tracking with powerful features designed for everyday use.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-nutrifolio-primary text-white">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM8 14H6V12H8V14ZM8 11H6V9H8V11ZM8 8H6V6H8V8ZM15 14H10V12H15V14ZM18 11H10V9H18V11ZM18 8H10V6H18V8Z" />
                    </svg>
                  </div>
                  Simple Chat Interface
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Just type what you ate in plain language. No more searching through databases or scanning barcodes.
                  </p>
                </dd>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-nutrifolio-primary text-white">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" />
                    </svg>
                  </div>
                  Smart Nutrition Tracking
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Automatically track calories, macros, and progress with beautiful visualizations and insights.
                  </p>
                </dd>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-nutrifolio-primary text-white">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM18 9.24L16.76 10.48L10.48 4.2L11.72 2.96L18 9.24ZM5 19V13L9.48 8.52L15.76 14.8L11.28 19.24L5 19Z" />
                    </svg>
                  </div>
                  Personalized Goals
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Set custom calorie and macro goals based on your personal needs and fitness targets.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            {/* Footer links */}
            <span className="text-center text-sm leading-5 text-gray-500">
              &copy; 2025 NutriFolio. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
