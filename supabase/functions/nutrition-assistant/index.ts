
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retrieve environment variables
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface RequestData {
  message: string;
  userId: string;
}

interface FoodData {
  food_name: string;
  serving_qty: number;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request
    const { message, userId } = await req.json() as RequestData;
    
    // Initialize Supabase client with service role key
    const supabase = createClient(
      supabaseUrl ?? '',
      supabaseServiceKey ?? ''
    );
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is missing');
    }

    console.log(`Processing message: "${message}" for user ${userId}`);

    // Call OpenAI API to analyze the food entry
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
            # IDENTITY and PURPOSE
            You are an nutrition analysis assistant AI built for Food calorie tracking. 
            You interpret nutritional value of the food based on the meal description, and share the output in a structured form.
            # STEPS 
            - If the user input is a valid food entry, respond with a JSON object containing the nutritional breakdown.
            -- Based on the description, try to assume the food or foods that are included in this meal.
            -- breakdown of the nutritional value based on average portion sizes or portion sizes described in the meal description
            -- list nutritional value of individual food items
            -- in case there are multiple food items in the meal, sum up the nutritional value of individual food items. output total nutritional estimate.
            -- Food Description (provide assumed food description with portion sizes in grams in brackets). e.g. 1 Bowl of Mung Bean Sprouts (~100g) with 1 Teaspoon of Oil (~5g) 
            - If it's not a food entry or you can't determine nutritional values, respond conversationally.
            -- change response for non-food entries conversationally. in case user is houmouring you, dial-in your best houmour setting. respond in humourour tone
            -- in case user is asking for information, provide accurate information to best of your knowledge.

            
            For food entries, extract:
            - food_name: a clear name of the food (in case of multiple food combined description)
            - serving_qty: the quantity (default to 1 if not specified)
            - serving_size: the unit (default to "serving" if not specified)
            - calories: estimated calories
            - protein: grams of protein
            - carbs: grams of carbohydrates
            - fat: grams of fat
            - meal_type: Breakfast, Lunch, Dinner, or Snack (default to Snack if not specified)

            I
            #Example Inputs
            Example valid food input: "2 apples" or "100g chicken breast"
            Example conversational inputs: "hello", "how many calories in an apple?", etc.
            in-case of conversational inputs - respond conversationally for e.g. answer calories in an apple.

            #Output format
            Your response should be in this format for food entries:
            {
              "type": "food_entry",
              "food_data": {
                "food_name": "Apple",
                "serving_qty": 2,
                "serving_size": "medium",
                "calories": 95,
                "protein": 0.5,
                "carbs": 25,
                "fat": 0.3,
                "meal_type": "Snack"
              },
              "response": "I've logged 2 medium apples as a snack. Each apple contains approximately 95 calories, 0.5g protein, 25g carbs, and 0.3g fat."
            }
            
            For non-food entries, respond conversationally. For e.g.:
            {
              "type": "conversation",
              "response": "I'm your nutrition assistant. You can log foods by typing something like '1 apple' or '200g grilled chicken'."
            }`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.3
      })
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await openAIResponse.json();
    const aiResponse = data.choices[0].message.content;
    console.log("OpenAI response:", aiResponse);

    let foodData: FoodData | null = null;
    let finalResponse = aiResponse;

    // Try to parse the response as JSON
    try {
      const parsedResponse = JSON.parse(aiResponse);
      
      if (parsedResponse.type === "food_entry" && parsedResponse.food_data) {
        foodData = parsedResponse.food_data;
        finalResponse = parsedResponse.response;
        
        // Log the food entry to the database
        const today = new Date().toISOString().split('T')[0];
        
        const { error: foodLogError } = await supabase
          .from('food_logs')
          .insert({
            user_id: userId,
            food_name: foodData.food_name,
            serving_qty: foodData.serving_qty,
            serving_size: foodData.serving_size,
            calories: foodData.calories,
            protein: foodData.protein,
            carbs: foodData.carbs,
            fat: foodData.fat,
            meal_type: foodData.meal_type,
            log_date: today
          });
          
        if (foodLogError) {
          console.error("Error logging food to database:", foodLogError);
          throw new Error(`Error logging food: ${foodLogError.message}`);
        }
        
        console.log(`Successfully logged food entry: ${foodData.food_name}`);
      } else {
        finalResponse = parsedResponse.response;
      }
    } catch (parseError) {
      console.warn("Failed to parse OpenAI response as JSON. Using raw response:", parseError);
      finalResponse = aiResponse;
    }

    return new Response(
      JSON.stringify({
        response: finalResponse,
        foodData: foodData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in nutrition-assistant function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
