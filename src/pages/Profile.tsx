
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const profileFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  age: z.string().transform((val) => (val ? parseInt(val, 10) : undefined)),
  gender: z.string().optional(),
  weight: z.string().transform((val) => (val ? parseFloat(val) : undefined)),
  height: z.string().transform((val) => (val ? parseFloat(val) : undefined)),
  weightUnit: z.enum(['kg', 'lb']),
  heightUnit: z.enum(['cm', 'in']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'veryActive']),
  goal: z.enum(['lose', 'maintain', 'gain']),
});

const goalFormSchema = z.object({
  calorieGoal: z.string().transform((val) => (val ? parseInt(val, 10) : undefined)),
  proteinGoal: z.string().transform((val) => (val ? parseFloat(val) : undefined)),
  carbsGoal: z.string().transform((val) => (val ? parseFloat(val) : undefined)),
  fatGoal: z.string().transform((val) => (val ? parseFloat(val) : undefined)),
});

const activityLevelOptions = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { value: 'light', label: 'Light (exercise 1-3 days/week)' },
  { value: 'moderate', label: 'Moderate (exercise 3-5 days/week)' },
  { value: 'active', label: 'Active (exercise 6-7 days/week)' },
  { value: 'veryActive', label: 'Very Active (intense exercise daily)' },
];

const goalOptions = [
  { value: 'lose', label: 'Lose Weight' },
  { value: 'maintain', label: 'Maintain Weight' },
  { value: 'gain', label: 'Gain Weight' },
];

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [calculatingGoals, setCalculatingGoals] = useState(false);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      age: '',
      gender: '',
      weight: '',
      height: '',
      weightUnit: 'kg',
      heightUnit: 'cm',
      activityLevel: 'moderate',
      goal: 'maintain',
    },
  });

  const goalForm = useForm<z.infer<typeof goalFormSchema>>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      calorieGoal: '',
      proteinGoal: '',
      carbsGoal: '',
      fatGoal: '',
    },
  });

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
        
      if (error) {
        // If no profile exists yet, we'll create one later
        if (error.code !== 'PGRST116') {
          throw error;
        }
      }

      if (data) {
        // Update profile form
        profileForm.reset({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          age: data.age ? String(data.age) : '',
          gender: data.gender || '',
          weight: data.weight ? String(data.weight) : '',
          height: data.height ? String(data.height) : '',
          weightUnit: data.weight_unit || 'kg',
          heightUnit: data.height_unit || 'cm',
          activityLevel: (data.activity_level as any) || 'moderate',
          goal: (data.goal as any) || 'maintain',
        });

        // Update goal form
        goalForm.reset({
          calorieGoal: data.calorie_goal ? String(data.calorie_goal) : '',
          proteinGoal: data.protein_goal ? String(data.protein_goal) : '',
          carbsGoal: data.carbs_goal ? String(data.carbs_goal) : '',
          fatGoal: data.fat_goal ? String(data.fat_goal) : '',
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Failed to load profile',
        description: 'Please try refreshing the page.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const onSubmitProfile = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      const profileData = {
        id: user?.id,
        first_name: values.firstName,
        last_name: values.lastName,
        age: values.age,
        gender: values.gender,
        weight: values.weight,
        height: values.height,
        weight_unit: values.weightUnit,
        height_unit: values.heightUnit,
        activity_level: values.activityLevel,
        goal: values.goal,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Failed to update profile',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const onSubmitGoals = async (values: z.infer<typeof goalFormSchema>) => {
    try {
      const goalData = {
        id: user?.id,
        calorie_goal: values.calorieGoal,
        protein_goal: values.proteinGoal,
        carbs_goal: values.carbsGoal,
        fat_goal: values.fatGoal,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(goalData);

      if (error) throw error;

      toast({
        title: 'Goals updated',
        description: 'Your nutrition goals have been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating goals:', error);
      toast({
        title: 'Failed to update goals',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const calculateGoals = () => {
    setCalculatingGoals(true);
    
    try {
      // Get current profile values
      const formValues = profileForm.getValues();
      
      // Ensure required fields are filled
      if (!formValues.weight || !formValues.height || !formValues.age || !formValues.gender) {
        toast({
          title: 'Missing information',
          description: 'Please fill in your weight, height, age, and gender before calculating goals.',
          variant: 'destructive',
        });
        setCalculatingGoals(false);
        return;
      }
      
      // Convert weight to kg if needed
      let weightKg = parseFloat(formValues.weight);
      if (formValues.weightUnit === 'lb') {
        weightKg *= 0.453592; // Convert pounds to kg
      }
      
      // Convert height to cm if needed
      let heightCm = parseFloat(formValues.height);
      if (formValues.heightUnit === 'in') {
        heightCm *= 2.54; // Convert inches to cm
      }
      
      const age = parseInt(formValues.age, 10);
      const isMale = formValues.gender.toLowerCase() === 'male';
      
      // Mifflin-St Jeor Formula for BMR
      let bmr;
      if (isMale) {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
      } else {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
      }
      
      // Activity multiplier
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9,
      };
      
      const tdee = Math.round(bmr * activityMultipliers[formValues.activityLevel]);
      
      // Adjust based on goal
      let calorieGoal = tdee;
      if (formValues.goal === 'lose') {
        calorieGoal = Math.round(tdee * 0.8); // 20% deficit
      } else if (formValues.goal === 'gain') {
        calorieGoal = Math.round(tdee * 1.1); // 10% surplus
      }
      
      // Calculate macros (40/30/30 split by default)
      // Protein: 30% of calories, 4 calories per gram
      const proteinGoal = Math.round((calorieGoal * 0.3) / 4);
      
      // Carbs: 40% of calories, 4 calories per gram
      const carbsGoal = Math.round((calorieGoal * 0.4) / 4);
      
      // Fat: 30% of calories, 9 calories per gram
      const fatGoal = Math.round((calorieGoal * 0.3) / 9);
      
      // Update form values
      goalForm.setValue('calorieGoal', String(calorieGoal));
      goalForm.setValue('proteinGoal', String(proteinGoal));
      goalForm.setValue('carbsGoal', String(carbsGoal));
      goalForm.setValue('fatGoal', String(fatGoal));
      
      toast({
        title: 'Goals calculated',
        description: 'Nutrition goals have been calculated based on your profile information.',
      });
    } catch (error) {
      console.error('Error calculating goals:', error);
      toast({
        title: 'Failed to calculate goals',
        description: 'Please try again or set goals manually.',
        variant: 'destructive',
      });
    } finally {
      setCalculatingGoals(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container pb-16 pt-6">
      <h1 className="mb-6 text-2xl font-bold">Profile Settings</h1>
      
      <div className="mb-4">
        <p className="text-muted-foreground">
          Signed in as: <span className="font-medium text-foreground">{user?.email}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Member since: {user?.created_at && format(new Date(user.created_at), 'MMM d, yyyy')}
        </p>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Personal Info</TabsTrigger>
          <TabsTrigger value="goals">Nutrition Goals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={profileForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Your age in years" 
                              {...field}
                              min={0} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex gap-2">
                      <FormField
                        control={profileForm.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Weight</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Your weight" 
                                {...field}
                                min={0}
                                step="0.1"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="weightUnit"
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormLabel>Unit</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="lb">lb</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex gap-2">
                      <FormField
                        control={profileForm.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Height</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Your height" 
                                {...field}
                                min={0}
                                step="0.1"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="heightUnit"
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormLabel>Unit</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cm">cm</SelectItem>
                                <SelectItem value="in">in</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="activityLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Level</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your activity level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {activityLevelOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How active are you on a daily basis?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {goalOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          What's your primary nutrition goal?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Goals</CardTitle>
              <CardDescription>
                Set your daily calorie and macronutrient targets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={calculateGoals} 
                disabled={calculatingGoals}
              >
                {calculatingGoals ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  'Calculate Recommended Goals'
                )}
              </Button>
              
              <Form {...goalForm}>
                <form onSubmit={goalForm.handleSubmit(onSubmitGoals)} className="space-y-6">
                  <FormField
                    control={goalForm.control}
                    name="calorieGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Calorie Goal</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter your daily calorie target" 
                            {...field}
                            min={0}
                          />
                        </FormControl>
                        <FormDescription>
                          How many calories do you aim to consume each day?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                      control={goalForm.control}
                      name="proteinGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Protein Goal (g)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter grams of protein" 
                              {...field}
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={goalForm.control}
                      name="carbsGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carbs Goal (g)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter grams of carbs" 
                              {...field}
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={goalForm.control}
                      name="fatGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fat Goal (g)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter grams of fat" 
                              {...field}
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit">Save Goals</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
