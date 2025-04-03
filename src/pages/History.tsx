
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client'; // Updated import
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { format, subDays, addDays, startOfDay, isSameDay } from 'date-fns';

interface FoodLog {
  id: string;
  food_name: string;
  brand: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: string;
  serving_size: string;
  serving_qty: number;
  created_at: string;
}

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const History = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [foodLogs, setFoodLogs] = useState<Record<string, FoodLog[]>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    if (user) {
      fetchFoodLogForDate(selectedDate);
    }
  }, [user, selectedDate]);

  const fetchFoodLogForDate = async (date: Date) => {
    try {
      setLoading(true);
      const dateString = format(date, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user?.id)
        .eq('log_date', dateString)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by meal type
      const groupedByMeal: Record<string, FoodLog[]> = {};
      (data || []).forEach((log) => {
        if (!groupedByMeal[log.meal_type]) {
          groupedByMeal[log.meal_type] = [];
        }
        groupedByMeal[log.meal_type].push(log as FoodLog);
      });

      setFoodLogs(groupedByMeal);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching food logs:', error);
      toast({
        title: 'Failed to load food logs',
        description: 'Please try refreshing the page.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleDeleteFoodLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update the UI by removing the deleted item
      const updatedFoodLogs: Record<string, FoodLog[]> = {};
      
      Object.keys(foodLogs).forEach((mealType) => {
        const updatedMeal = foodLogs[mealType].filter((log) => log.id !== id);
        if (updatedMeal.length > 0) {
          updatedFoodLogs[mealType] = updatedMeal;
        }
      });

      setFoodLogs(updatedFoodLogs);
      
      toast({
        title: 'Food log deleted',
        description: 'The food entry has been removed from your history.',
      });
    } catch (error) {
      console.error('Error deleting food log:', error);
      toast({
        title: 'Failed to delete food log',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const calculateDailyTotals = (): DailyTotals => {
    let totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    Object.values(foodLogs).forEach(logs => {
      logs.forEach(log => {
        totals.calories += log.calories || 0;
        totals.protein += log.protein || 0;
        totals.carbs += log.carbs || 0;
        totals.fat += log.fat || 0;
      });
    });

    return totals;
  };

  const navigateDate = (days: number) => {
    if (days < 0) {
      setSelectedDate(subDays(selectedDate, Math.abs(days)));
    } else {
      setSelectedDate(addDays(selectedDate, days));
    }
  };

  const dailyTotals = calculateDailyTotals();

  return (
    <div className="container pb-16 pt-6">
      <h1 className="mb-6 text-2xl font-bold">Food History</h1>
      
      <Tabs 
        defaultValue="list" 
        value={viewMode} 
        onValueChange={(v) => setViewMode(v as 'list' | 'calendar')}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigateDate(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-lg font-medium">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              {isSameDay(selectedDate, new Date()) && ' (Today)'}
            </h2>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigateDate(1)} 
              disabled={isSameDay(selectedDate, new Date())}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Daily Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-sm text-muted-foreground">Calories</div>
                  <div className="text-xl font-bold text-primary">{dailyTotals.calories}</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-sm text-muted-foreground">Protein</div>
                  <div className="text-xl font-bold">{dailyTotals.protein.toFixed(1)}g</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-sm text-muted-foreground">Carbs</div>
                  <div className="text-xl font-bold">{dailyTotals.carbs.toFixed(1)}g</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-sm text-muted-foreground">Fat</div>
                  <div className="text-xl font-bold">{dailyTotals.fat.toFixed(1)}g</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {loading ? (
            <div className="mt-6 text-center">Loading food logs...</div>
          ) : Object.keys(foodLogs).length === 0 ? (
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">No food logged on this date.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {Object.entries(foodLogs).map(([mealType, logs]) => (
                <Card key={mealType}>
                  <CardHeader>
                    <CardTitle className="text-lg">{mealType}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {logs.map((log) => (
                        <div 
                          key={log.id} 
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <div className="font-medium">{log.food_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {log.serving_qty} {log.serving_size}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div>{log.calories} cal</div>
                              <div className="text-xs text-muted-foreground">
                                P: {log.protein}g • C: {log.carbs}g • F: {log.fat}g
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFoodLog(log.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="calendar" className="mt-4">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              disabled={{ after: new Date() }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;
