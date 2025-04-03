
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const genderEnum = z.enum(['male', 'female', 'other']);
const activityLevelEnum = z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']);
const goalEnum = z.enum(['lose_weight', 'maintain_weight', 'gain_weight']);
const unitsEnum = z.enum(['metric', 'imperial']);

const profileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  age: z.coerce.number().min(1, 'Age must be at least 1').max(120, 'Age cannot exceed 120'),
  gender: genderEnum,
  weight: z.coerce.number().min(20, 'Weight must be at least 20').max(500, 'Weight cannot exceed 500'),
  height: z.coerce.number().min(50, 'Height must be at least 50cm').max(250, 'Height cannot exceed 250cm'),
  activity_level: activityLevelEnum,
  goal: goalEnum,
  weight_unit: unitsEnum,
  height_unit: unitsEnum,
  calorie_goal: z.coerce.number().min(500, 'Minimum 500 calories').max(10000, 'Maximum 10000 calories'),
  protein_goal: z.coerce.number().min(0, 'Cannot be negative'),
  carbs_goal: z.coerce.number().min(0, 'Cannot be negative'),
  fat_goal: z.coerce.number().min(0, 'Cannot be negative'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [calculatingNutrition, setCalculatingNutrition] = useState(false);

  // Create form with default values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      age: 30,
      gender: 'male',
      weight: 70,
      height: 170,
      activity_level: 'moderately_active',
      goal: 'maintain_weight',
      weight_unit: 'metric',
      height_unit: 'metric',
      calorie_goal: 2000,
      protein_goal: 150,
      carbs_goal: 200,
      fat_goal: 65,
    },
  });

  const watchedWeightUnit = form.watch('weight_unit');
  const watchedHeightUnit = form.watch('height_unit');
  const watchedWeight = form.watch('weight');
  const watchedHeight = form.watch('height');
  const watchedActivityLevel = form.watch('activity_level');
  const watchedGender = form.watch('gender');
  const watchedAge = form.watch('age');
  const watchedGoal = form.watch('goal');

  // Load user profile data
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        // Ensure gender is one of the allowed values or default to 'male'
        const gender = isValidGender(data.gender) ? data.gender : 'male';
        // Ensure activity_level is one of the allowed values or default to 'moderately_active'
        const activity_level = isValidActivityLevel(data.activity_level) ? data.activity_level : 'moderately_active';
        // Ensure goal is one of the allowed values or default to 'maintain_weight'
        const goal = isValidGoal(data.goal) ? data.goal : 'maintain_weight';
        // Convert weight_unit and height_unit to expected units format
        const weight_unit = data.weight_unit === 'kg' ? 'metric' : 'imperial';
        const height_unit = data.height_unit === 'cm' ? 'metric' : 'imperial';

        form.reset({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          age: Number(data.age) || 30,
          gender,
          weight: Number(data.weight) || 70,
          height: Number(data.height) || 170,
          activity_level,
          goal,
          weight_unit,
          height_unit,
          calorie_goal: Number(data.calorie_goal) || 2000,
          protein_goal: Number(data.protein_goal) || 150,
          carbs_goal: Number(data.carbs_goal) || 200,
          fat_goal: Number(data.fat_goal) || 65,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Failed to load profile',
        description: 'Your profile could not be loaded. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  // Helper functions to validate enums
  const isValidGender = (value: any): value is z.infer<typeof genderEnum> => {
    return ['male', 'female', 'other'].includes(value);
  };

  const isValidActivityLevel = (value: any): value is z.infer<typeof activityLevelEnum> => {
    return ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'].includes(value);
  };

  const isValidGoal = (value: any): value is z.infer<typeof goalEnum> => {
    return ['lose_weight', 'maintain_weight', 'gain_weight'].includes(value);
  };

  const calculateNutrition = () => {
    setCalculatingNutrition(true);

    try {
      // Convert values if imperial units
      let weightKg = watchedWeight;
      let heightCm = watchedHeight;
      
      if (watchedWeightUnit === 'imperial') {
        // Convert from lbs to kg
        weightKg = watchedWeight * 0.453592;
      }
      
      if (watchedHeightUnit === 'imperial') {
        // Convert from inches to cm
        heightCm = watchedHeight * 2.54;
      }

      // Calculate BMR using Mifflin-St Jeor Equation
      let bmr;
      if (watchedGender === 'male') {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * watchedAge + 5;
      } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * watchedAge - 161;
      }

      // Apply activity factor
      let tdee;
      switch (watchedActivityLevel) {
        case 'sedentary':
          tdee = bmr * 1.2;
          break;
        case 'lightly_active':
          tdee = bmr * 1.375;
          break;
        case 'moderately_active':
          tdee = bmr * 1.55;
          break;
        case 'very_active':
          tdee = bmr * 1.725;
          break;
        case 'extremely_active':
          tdee = bmr * 1.9;
          break;
        default:
          tdee = bmr * 1.55; // Default to moderate
      }

      // Apply goal adjustment
      let calorieGoal;
      switch (watchedGoal) {
        case 'lose_weight':
          calorieGoal = tdee - 500; // 500 calorie deficit
          break;
        case 'gain_weight':
          calorieGoal = tdee + 500; // 500 calorie surplus
          break;
        default:
          calorieGoal = tdee; // Maintain weight
      }

      // Ensure minimum calorie intake
      calorieGoal = Math.max(1200, calorieGoal);

      // Calculate macros using standard ratios (40% carbs, 30% protein, 30% fat)
      // 4 calories per gram of protein and carbs, 9 calories per gram of fat
      const proteinGoal = Math.round((calorieGoal * 0.3) / 4);
      const carbsGoal = Math.round((calorieGoal * 0.4) / 4);
      const fatGoal = Math.round((calorieGoal * 0.3) / 9);

      // Round calorie goal to nearest 50
      calorieGoal = Math.round(calorieGoal / 50) * 50;

      // Update form values
      form.setValue('calorie_goal', calorieGoal);
      form.setValue('protein_goal', proteinGoal);
      form.setValue('carbs_goal', carbsGoal);
      form.setValue('fat_goal', fatGoal);

      toast({
        title: 'Nutrition calculated',
        description: 'Your recommended nutrition goals have been calculated.',
      });
    } catch (error) {
      console.error('Error calculating nutrition:', error);
      toast({
        title: 'Calculation failed',
        description: 'Failed to calculate nutrition goals. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCalculatingNutrition(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setLoading(true);
      
      // Convert weight_unit and height_unit back to database format
      const weight_unit = data.weight_unit === 'metric' ? 'kg' : 'lb';
      const height_unit = data.height_unit === 'metric' ? 'cm' : 'in';
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          first_name: data.first_name,
          last_name: data.last_name,
          age: data.age,
          gender: data.gender,
          weight: data.weight,
          height: data.height,
          activity_level: data.activity_level,
          goal: data.goal,
          weight_unit,
          height_unit,
          calorie_goal: data.calorie_goal,
          protein_goal: data.protein_goal,
          carbs_goal: data.carbs_goal,
          fat_goal: data.fat_goal,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !form.formState.isSubmitting) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Profile Settings</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <FormField
                  control={form.control}
                  name="weight_unit"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Weight Unit</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select weight unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="metric">Metric (kg)</SelectItem>
                            <SelectItem value="imperial">Imperial (lb)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="height_unit"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Height Unit</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select height unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="metric">Metric (cm)</SelectItem>
                            <SelectItem value="imperial">Imperial (in)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Weight ({watchedWeightUnit === 'metric' ? 'kg' : 'lbs'})
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Height ({watchedHeightUnit === 'metric' ? 'cm' : 'inches'})
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="activity_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Level</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                          <SelectItem value="lightly_active">Lightly active (light exercise 1-3 days/week)</SelectItem>
                          <SelectItem value="moderately_active">Moderately active (moderate exercise 3-5 days/week)</SelectItem>
                          <SelectItem value="very_active">Very active (hard exercise 6-7 days/week)</SelectItem>
                          <SelectItem value="extremely_active">Extremely active (very hard exercise, physical job or training twice a day)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lose_weight">Lose Weight</SelectItem>
                          <SelectItem value="maintain_weight">Maintain Weight</SelectItem>
                          <SelectItem value="gain_weight">Gain Weight</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={calculateNutrition}
                disabled={calculatingNutrition}
                className="mr-2"
              >
                {calculatingNutrition && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Calculate Nutrition
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nutrition Goals</CardTitle>
              <CardDescription>
                Set your daily calorie and macronutrient targets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="calorie_goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Calorie Goal</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="protein_goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Protein Goal (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="carbs_goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Carbs Goal (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fat_goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Fat Goal (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading || !form.formState.isDirty}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Profile
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default ProfilePage;
