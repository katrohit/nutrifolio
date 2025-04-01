
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, userId } = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // This is where you would typically call an AI service like OpenAI
    // For now, we'll implement a simple rule-based assistant that can recognize food items
    
    const lowercaseMessage = message.toLowerCase();
    let response = "";
    let foodData = null;
    
    if (lowercaseMessage.includes("banana")) {
      response = "I've logged 1 medium banana (118g): 105 calories, 0.3g fat, 1.3g protein, 27g carbs";
      foodData = {
        food_name: "Banana",
        brand: null,
        calories: 105,
        protein: 1.3,
        carbs: 27,
        fat: 0.3,
        meal_type: getMealTypeByTime(),
        serving_size: "medium (118g)",
        serving_qty: 1,
        log_date: new Date().toISOString().split("T")[0],
      };
    } else if (lowercaseMessage.includes("apple")) {
      response = "I've logged 1 medium apple (182g): 95 calories, 0.3g fat, 0.5g protein, 25g carbs";
      foodData = {
        food_name: "Apple",
        brand: null,
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
        meal_type: getMealTypeByTime(),
        serving_size: "medium (182g)",
        serving_qty: 1,
        log_date: new Date().toISOString().split("T")[0],
      };
    } else if (lowercaseMessage.includes("chicken")) {
      const weight = lowercaseMessage.match(/\d+g/) 
        ? parseInt(lowercaseMessage.match(/\d+g/)![0]) 
        : 100;
      
      const multiplier = weight / 100;
      
      response = `I've logged ${weight}g of grilled chicken breast: ${Math.round(165 * multiplier)} calories, ${(3.6 * multiplier).toFixed(1)}g fat, ${(31 * multiplier).toFixed(1)}g protein, 0g carbs`;
      
      foodData = {
        food_name: "Grilled Chicken Breast",
        brand: null,
        calories: Math.round(165 * multiplier),
        protein: Math.round(31 * multiplier * 10) / 10,
        carbs: 0,
        fat: Math.round(3.6 * multiplier * 10) / 10,
        meal_type: getMealTypeByTime(),
        serving_size: `${weight}g`,
        serving_qty: 1,
        log_date: new Date().toISOString().split("T")[0],
      };
    } else {
      response = "I didn't recognize any food in your message. Try mentioning specific foods like 'banana', 'apple', or 'chicken'.";
    }
    
    // If we identified food and have a user ID, log it to the database
    if (foodData && userId) {
      const { error: supabaseError } = await logFoodToDatabase(userId, foodData);
      if (supabaseError) {
        console.error("Error logging food:", supabaseError);
      }
    }

    return new Response(
      JSON.stringify({ 
        response,
        foodData
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in nutrition-assistant function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Helper function to get meal type based on time of day
function getMealTypeByTime() {
  const hour = new Date().getUTCHours();
  
  if (hour >= 5 && hour < 10) return "Breakfast";
  if (hour >= 10 && hour < 12) return "Morning Snack";
  if (hour >= 12 && hour < 15) return "Lunch";
  if (hour >= 15 && hour < 18) return "Afternoon Snack";
  if (hour >= 18 && hour < 21) return "Dinner";
  return "Evening Snack";
}

// Helper function to log food to the database
async function logFoodToDatabase(userId: string, foodData: any) {
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.6");
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://wpckzzjlhusvhmckrwen.supabase.co";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  return await supabase.from("food_logs").insert({
    user_id: userId,
    food_name: foodData.food_name,
    brand: foodData.brand,
    calories: foodData.calories,
    protein: foodData.protein,
    carbs: foodData.carbs,
    fat: foodData.fat,
    meal_type: foodData.meal_type,
    serving_size: foodData.serving_size,
    serving_qty: foodData.serving_qty,
    log_date: foodData.log_date,
  });
}
