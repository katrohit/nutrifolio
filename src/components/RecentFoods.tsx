
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface FoodLogItem {
  id: string;
  food_name: string;
  meal_type: string;
  calories: number;
  serving_qty: number;
  serving_size: string;
  created_at: string;
}

const RecentFoods = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [foods, setFoods] = useState<FoodLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentFoods();
    }
  }, [user]);

  const fetchRecentFoods = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('food_logs')
        .select('id, food_name, meal_type, calories, serving_qty, serving_size, created_at')
        .eq('user_id', user?.id)
        .eq('log_date', today)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setFoods(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recent foods:', error);
      toast({
        title: 'Failed to load recent foods',
        description: 'Please try refreshing the page.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFoods(foods.filter(food => food.id !== id));
      
      toast({
        title: 'Food deleted',
        description: 'The food entry has been removed from your log.',
      });
    } catch (error) {
      console.error('Error deleting food:', error);
      toast({
        title: 'Failed to delete food',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Foods</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Today's Foods</CardTitle>
      </CardHeader>
      <CardContent>
        {foods.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No foods logged today. Start by logging a food in the chat!
          </p>
        ) : (
          <div className="space-y-4">
            {foods.map((food) => (
              <div 
                key={food.id} 
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{food.food_name}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {food.meal_type}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {food.serving_qty} {food.serving_size} • {food.calories} cal
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(food.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentFoods;
