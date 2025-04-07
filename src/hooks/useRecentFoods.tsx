
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface RecentFood {
  id: string;
  food_name: string;
  serving_qty: number;
  serving_size: string;
  calories: number;
  log_date: string;
  meal_type: string;
}

export const useRecentFoods = (limit: number = 5) => {
  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRecentFoods = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('food_logs')
        .select('id, food_name, serving_qty, serving_size, calories, log_date, meal_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      setRecentFoods(data || []);
    } catch (err: any) {
      console.error('Error fetching recent foods:', err);
      setError(err.message || 'Failed to fetch recent foods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentFoods();
  }, [user, limit]);

  return {
    recentFoods,
    loading,
    error,
    refetch: fetchRecentFoods
  };
};
