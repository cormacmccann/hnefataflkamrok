export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      daily_puzzles: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string
          goal: string
          id: string
          position: Json
          puzzle_date: string
          side_to_move: string
          solution: Json
          variant_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty: string
          goal: string
          id?: string
          position: Json
          puzzle_date: string
          side_to_move: string
          solution: Json
          variant_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string
          goal?: string
          id?: string
          position?: Json
          puzzle_date?: string
          side_to_move?: string
          solution?: Json
          variant_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_invites: {
        Row: {
          created_at: string
          from_id: string
          id: string
          room_id: string
          status: Database["public"]["Enums"]["invite_status"]
          to_id: string
        }
        Insert: {
          created_at?: string
          from_id: string
          id?: string
          room_id: string
          status?: Database["public"]["Enums"]["invite_status"]
          to_id: string
        }
        Update: {
          created_at?: string
          from_id?: string
          id?: string
          room_id?: string
          status?: Database["public"]["Enums"]["invite_status"]
          to_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_invites_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_invites_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_invites_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          is_anonymous: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          id: string
          is_anonymous?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_anonymous?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      puzzle_attempts: {
        Row: {
          completed_at: string
          id: string
          moves_taken: number
          puzzle_id: string
          solved: boolean
          time_seconds: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          moves_taken?: number
          puzzle_id: string
          solved?: boolean
          time_seconds?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          moves_taken?: number
          puzzle_id?: string
          solved?: boolean
          time_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_attempts_puzzle_id_fkey"
            columns: ["puzzle_id"]
            isOneToOne: false
            referencedRelation: "daily_puzzles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_moves: {
        Row: {
          by_player: string
          by_side: Database["public"]["Enums"]["player_side"]
          created_at: string
          id: string
          idx: number
          move: Json
          room_id: string
          state_after: Json
        }
        Insert: {
          by_player: string
          by_side: Database["public"]["Enums"]["player_side"]
          created_at?: string
          id?: string
          idx: number
          move: Json
          room_id: string
          state_after: Json
        }
        Update: {
          by_player?: string
          by_side?: Database["public"]["Enums"]["player_side"]
          created_at?: string
          id?: string
          idx?: number
          move?: Json
          room_id?: string
          state_after?: Json
        }
        Relationships: [
          {
            foreignKeyName: "room_moves_by_player_fkey"
            columns: ["by_player"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_moves_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          code: string
          created_at: string
          current_player: Database["public"]["Enums"]["player_side"]
          guest_id: string | null
          host_id: string
          host_side: Database["public"]["Enums"]["player_side"]
          id: string
          last_move_at: string
          move_count: number
          rules: Json
          state: Json
          status: Database["public"]["Enums"]["room_status"]
          updated_at: string
          variant_id: string
          winner: Database["public"]["Enums"]["player_side"] | null
        }
        Insert: {
          code: string
          created_at?: string
          current_player?: Database["public"]["Enums"]["player_side"]
          guest_id?: string | null
          host_id: string
          host_side?: Database["public"]["Enums"]["player_side"]
          id?: string
          last_move_at?: string
          move_count?: number
          rules?: Json
          state?: Json
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
          variant_id: string
          winner?: Database["public"]["Enums"]["player_side"] | null
        }
        Update: {
          code?: string
          created_at?: string
          current_player?: Database["public"]["Enums"]["player_side"]
          guest_id?: string | null
          host_id?: string
          host_side?: Database["public"]["Enums"]["player_side"]
          id?: string
          last_move_at?: string
          move_count?: number
          rules?: Json
          state?: Json
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
          variant_id?: string
          winner?: Database["public"]["Enums"]["player_side"] | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gen_room_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      join_room: {
        Args: { _code: string }
        Returns: {
          code: string
          created_at: string
          current_player: Database["public"]["Enums"]["player_side"]
          guest_id: string | null
          host_id: string
          host_side: Database["public"]["Enums"]["player_side"]
          id: string
          last_move_at: string
          move_count: number
          rules: Json
          state: Json
          status: Database["public"]["Enums"]["room_status"]
          updated_at: string
          variant_id: string
          winner: Database["public"]["Enums"]["player_side"] | null
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      peek_room: {
        Args: { _code: string }
        Returns: {
          code: string
          created_at: string
          guest_id: string
          guest_name: string
          host_id: string
          host_name: string
          host_side: Database["public"]["Enums"]["player_side"]
          id: string
          status: Database["public"]["Enums"]["room_status"]
          variant_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      friendship_status: "pending" | "accepted"
      invite_status: "pending" | "accepted" | "declined"
      player_side: "attacker" | "defender"
      room_status: "waiting" | "active" | "finished" | "abandoned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      friendship_status: ["pending", "accepted"],
      invite_status: ["pending", "accepted", "declined"],
      player_side: ["attacker", "defender"],
      room_status: ["waiting", "active", "finished", "abandoned"],
    },
  },
} as const
