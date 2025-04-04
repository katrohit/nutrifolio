
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FoodLogItem {
  id: string;
  food_name: string;
  meal_type: string;
  calories: number;
  serving_qty: number;
  serving_size: string;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
}

interface EditFoodDialogProps {
  food: FoodLogItem;
  onSave: (updatedFood: FoodLogItem) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditFoodDialog = ({ food, onSave, open, onOpenChange }: EditFoodDialogProps) => {
  const [editedFood, setEditedFood] = useState<FoodLogItem>({...food});
  const { toast } = useToast();
  
  // Reset form when a new food item is selected
  useEffect(() => {
    setEditedFood({...food});
  }, [food]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric fields
    if (['calories', 'serving_qty', 'protein', 'carbs', 'fat'].includes(name)) {
      setEditedFood({
        ...editedFood,
        [name]: parseFloat(value) || 0
      });
    } else {
      setEditedFood({
        ...editedFood,
        [name]: value
      });
    }
  };
  
  const handleSelectChange = (value: string) => {
    setEditedFood({
      ...editedFood,
      meal_type: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(editedFood);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error saving changes',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Food Entry</DialogTitle>
            <DialogDescription>
              Make changes to your food log entry here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="food_name" className="text-right">
                Food Name
              </Label>
              <Input
                id="food_name"
                name="food_name"
                value={editedFood.food_name}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="meal_type" className="text-right">
                Meal
              </Label>
              <Select 
                value={editedFood.meal_type} 
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Breakfast">Breakfast</SelectItem>
                  <SelectItem value="Lunch">Lunch</SelectItem>
                  <SelectItem value="Dinner">Dinner</SelectItem>
                  <SelectItem value="Snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serving_qty" className="text-right">
                Quantity
              </Label>
              <Input
                id="serving_qty"
                name="serving_qty"
                type="number"
                value={editedFood.serving_qty}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serving_size" className="text-right">
                Unit
              </Label>
              <Input
                id="serving_size"
                name="serving_size"
                value={editedFood.serving_size}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="calories" className="text-right">
                Calories
              </Label>
              <Input
                id="calories"
                name="calories"
                type="number"
                value={editedFood.calories}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="protein" className="text-right">
                Protein (g)
              </Label>
              <Input
                id="protein"
                name="protein"
                type="number"
                value={editedFood.protein}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="carbs" className="text-right">
                Carbs (g)
              </Label>
              <Input
                id="carbs"
                name="carbs"
                type="number"
                value={editedFood.carbs}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fat" className="text-right">
                Fat (g)
              </Label>
              <Input
                id="fat"
                name="fat"
                type="number"
                value={editedFood.fat}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const RecentFoods = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [foods, setFoods] = useState<FoodLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFood, setEditingFood] = useState<FoodLogItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
        .select('id, food_name, meal_type, calories, serving_qty, serving_size, protein, carbs, fat, created_at')
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
  
  const handleEdit = (food: FoodLogItem) => {
    setEditingFood(food);
    setDialogOpen(true);
  };
  
  const handleSave = async (updatedFood: FoodLogItem) => {
    try {
      const { error } = await supabase
        .from('food_logs')
        .update({
          food_name: updatedFood.food_name,
          meal_type: updatedFood.meal_type,
          calories: updatedFood.calories,
          serving_qty: updatedFood.serving_qty,
          serving_size: updatedFood.serving_size,
          protein: updatedFood.protein,
          carbs: updatedFood.carbs,
          fat: updatedFood.fat
        })
        .eq('id', updatedFood.id);

      if (error) throw error;
      
      // Update the state with the edited food
      setFoods(foods.map(food => 
        food.id === updatedFood.id ? updatedFood : food
      ));
      
      toast({
        title: 'Food updated',
        description: 'The food entry has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating food:', error);
      toast({
        title: 'Failed to update food',
        description: 'Please try again.',
        variant: 'destructive',
      });
      throw error; // Re-throw to be caught by the dialog
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
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{food.food_name}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {food.meal_type}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {food.serving_qty} {food.serving_size} • {food.calories} cal • 
                    P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(food)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(food.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {editingFood && (
          <EditFoodDialog 
            food={editingFood}
            onSave={handleSave}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default RecentFoods;
