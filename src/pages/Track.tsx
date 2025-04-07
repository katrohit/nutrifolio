
import React from 'react';
import ChatInterface from '@/components/ChatInterface';
import { useRecentFoods } from '@/hooks/useRecentFoods';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Track = () => {
  const { recentFoods, loading } = useRecentFoods(8);

  return (
    <div className="container max-w-5xl py-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <h1 className="mb-6 text-2xl font-bold">Log Your Food</h1>
          <div className="h-[calc(100vh-300px)]">
            <ChatInterface />
          </div>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recently Used Items</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {loading ? (
                <p className="text-muted-foreground">Loading recent items...</p>
              ) : recentFoods.length === 0 ? (
                <p className="text-muted-foreground">No recent items</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {recentFoods.map((food) => (
                    <Button 
                      key={food.id}
                      variant="outline" 
                      size="sm"
                      className="text-left"
                      onClick={() => {
                        // This is a placeholder for future implementation
                        // You could implement a way to directly log these items again
                        // Or you could navigate to an edit page
                        console.log('Quick log:', food);
                      }}
                    >
                      {food.food_name}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Track;
