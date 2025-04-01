export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string
          id: string
          is_user: boolean
          message: string
          response: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_user: boolean
          message: string
          response?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_user?: boolean
          message?: string
          response?: string | null
          user_id?: string
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          brand: string | null
          calories: number
          carbs: number
          created_at: string
          fat: number
          food_name: string
          id: string
          log_date: string
          meal_type: string
          protein: number
          serving_qty: number
          serving_size: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          calories: number
          carbs: number
          created_at?: string
          fat: number
          food_name: string
          id?: string
          log_date: string
          meal_type: string
          protein: number
          serving_qty: number
          serving_size: string
          user_id: string
        }
        Update: {
          brand?: string | null
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          food_name?: string
          id?: string
          log_date?: string
          meal_type?: string
          protein?: number
          serving_qty?: number
          serving_size?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          calorie_goal: number | null
          carbs_goal: number | null
          created_at: string
          fat_goal: number | null
          first_name: string | null
          gender: string | null
          goal: string | null
          height: number | null
          height_unit: string
          id: string
          last_name: string | null
          protein_goal: number | null
          updated_at: string
          weight: number | null
          weight_unit: string
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          calorie_goal?: number | null
          carbs_goal?: number | null
          created_at?: string
          fat_goal?: number | null
          first_name?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          height_unit?: string
          id: string
          last_name?: string | null
          protein_goal?: number | null
          updated_at?: string
          weight?: number | null
          weight_unit?: string
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          calorie_goal?: number | null
          carbs_goal?: number | null
          created_at?: string
          fat_goal?: number | null
          first_name?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          height_unit?: string
          id?: string
          last_name?: string | null
          protein_goal?: number | null
          updated_at?: string
          weight?: number | null
          weight_unit?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
