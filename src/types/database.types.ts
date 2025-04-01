
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string | null
          last_name: string | null
          age: number | null
          gender: string | null
          weight: number | null
          height: number | null
          activity_level: string | null
          goal: string | null
          weight_unit: string
          height_unit: string
          calorie_goal: number | null
          protein_goal: number | null
          carbs_goal: number | null
          fat_goal: number | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          age?: number | null
          gender?: string | null
          weight?: number | null
          height?: number | null
          activity_level?: string | null
          goal?: string | null
          weight_unit?: string
          height_unit?: string
          calorie_goal?: number | null
          protein_goal?: number | null
          carbs_goal?: number | null
          fat_goal?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          age?: number | null
          gender?: string | null
          weight?: number | null
          height?: number | null
          activity_level?: string | null
          goal?: string | null
          weight_unit?: string
          height_unit?: string
          calorie_goal?: number | null
          protein_goal?: number | null
          carbs_goal?: number | null
          fat_goal?: number | null
        }
      }
      food_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          food_name: string
          brand: string | null
          calories: number
          protein: number
          carbs: number
          fat: number
          meal_type: string
          serving_size: string
          serving_qty: number
          log_date: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          food_name: string
          brand?: string | null
          calories: number
          protein: number
          carbs: number
          fat: number
          meal_type: string
          serving_size: string
          serving_qty: number
          log_date: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          food_name?: string
          brand?: string | null
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          meal_type?: string
          serving_size?: string
          serving_qty?: number
          log_date?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          created_at: string
          user_id: string
          message: string
          response: string | null
          is_user: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          message: string
          response?: string | null
          is_user: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          message?: string
          response?: string | null
          is_user?: boolean
        }
      }
    }
  }
}
