
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CalorieRing from './CalorieRing';
import MacroProgress from './MacroProgress';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface NutritionData {
  calories: {
    consumed: number;
    goal: number;
  };
  protein: {
    consumed: number;
    goal: number;
  };
  carbs: {
    consumed: number;
    goal: number;
  };
  fat: {
    consumed: number;
    goal: number;
  };
  loading: boolean;
}

const DailySummary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    calories: { consumed: 0, goal: 2000 },
    protein: { consumed: 0, goal: 150 },
    carbs: { consumed: 0, goal: 200 },
    fat: { consumed: 0, goal: 65 },
    loading: true
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchTodaysNutrition();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('calorie_goal, protein_goal, carbs_goal, fat_goal')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setNutritionData(prev => ({
          ...prev,
          calories: { ...prev.calories, goal: data.calorie_goal || 2000 },
          protein: { ...prev.protein, goal: data.protein_goal || 150 },
          carbs: { ...prev.carbs, goal: data.carbs_goal || 200 },
          fat: { ...prev.fat, goal: data.fat_goal || 65 }
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: 'Failed to load profile data',
        description: 'Please try refreshing the page.',
        variant: 'destructive',
      });
    }
  };

  const fetchTodaysNutrition = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('food_logs')
        .select('calories, protein, carbs, fat')
        .eq('user_id', user?.id)
        .eq('log_date', today);

      if (error) throw error;

      if (data && data.length > 0) {
        const totals = data.reduce((acc, item) => {
          return {
            calories: acc.calories + (item.calories || 0),
            protein: acc.protein + (item.protein || 0),
            carbs: acc.carbs + (item.carbs || 0),
            fat: acc.fat + (item.fat || 0),
          };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

        setNutritionData(prev => ({
          ...prev,
          calories: { ...prev.calories, consumed: totals.calories },
          protein: { ...prev.protein, consumed: totals.protein },
          carbs: { ...prev.carbs, consumed: totals.carbs },
          fat: { ...prev.fat, consumed: totals.fat },
          loading: false
        }));
      } else {
        setNutritionData(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching today\'s nutrition:', error);
      toast({
        title: 'Failed to load nutrition data',
        description: 'Please try refreshing the page.',
        variant: 'destructive',
      });
      setNutritionData(prev => ({ ...prev, loading: false }));
    }
  };

  if (nutritionData.loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Daily Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center pb-4">
          <CalorieRing 
            consumed={nutritionData.calories.consumed} 
            goal={nutritionData.calories.goal} 
          />
        </div>
        <div className="space-y-4">
          <MacroProgress 
            label="Protein" 
            current={nutritionData.protein.consumed} 
            target={nutritionData.protein.goal} 
            color="bg-blue-500"
          />
          <MacroProgress 
            label="Carbs" 
            current={nutritionData.carbs.consumed} 
            target={nutritionData.carbs.goal}
            color="bg-green-500" 
          />
          <MacroProgress 
            label="Fat" 
            current={nutritionData.fat.consumed} 
            target={nutritionData.fat.goal}
            color="bg-amber-500" 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySummary;
