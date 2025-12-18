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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_edited: boolean | null
          movie_slug: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          movie_slug: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          movie_slug?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          movie_name: string
          movie_slug: string
          origin_name: string | null
          poster_url: string | null
          user_id: string
          year: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          movie_name: string
          movie_slug: string
          origin_name?: string | null
          poster_url?: string | null
          user_id: string
          year?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          movie_name?: string
          movie_slug?: string
          origin_name?: string | null
          poster_url?: string | null
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          preferred_language: string | null
          theme: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_language?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_language?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          identifier: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          identifier: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          identifier?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string
          id: string
          movie_slug: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          movie_slug: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          movie_slug?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      route_tokens: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          route_token: string
          route_type: string
          session_token: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          route_token: string
          route_type: string
          session_token: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          route_token?: string
          route_type?: string
          session_token?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          id: string
          query: string
          searched_at: string
          user_id: string
        }
        Insert: {
          id?: string
          query: string
          searched_at?: string
          user_id: string
        }
        Update: {
          id?: string
          query?: string
          searched_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_hash: string | null
          session_token: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_hash?: string | null
          session_token?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_hash?: string | null
          session_token?: string | null
        }
        Relationships: []
      }
      security_sessions: {
        Row: {
          block_reason: string | null
          created_at: string | null
          expires_at: string | null
          fingerprint_hash: string | null
          id: string
          ip_hash: string | null
          is_blocked: boolean | null
          last_request_at: string | null
          request_count: number | null
          session_token: string
          trust_score: number | null
          user_agent_hash: string | null
        }
        Insert: {
          block_reason?: string | null
          created_at?: string | null
          expires_at?: string | null
          fingerprint_hash?: string | null
          id?: string
          ip_hash?: string | null
          is_blocked?: boolean | null
          last_request_at?: string | null
          request_count?: number | null
          session_token: string
          trust_score?: number | null
          user_agent_hash?: string | null
        }
        Update: {
          block_reason?: string | null
          created_at?: string | null
          expires_at?: string | null
          fingerprint_hash?: string | null
          id?: string
          ip_hash?: string | null
          is_blocked?: boolean | null
          last_request_at?: string | null
          request_count?: number | null
          session_token?: string
          trust_score?: number | null
          user_agent_hash?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_next_episode: boolean | null
          autoplay: boolean | null
          created_at: string
          default_volume: number | null
          email_notifications: boolean | null
          id: string
          notifications_enabled: boolean | null
          playback_speed: number | null
          subtitle_language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_next_episode?: boolean | null
          autoplay?: boolean | null
          created_at?: string
          default_volume?: number | null
          email_notifications?: boolean | null
          id?: string
          notifications_enabled?: boolean | null
          playback_speed?: number | null
          subtitle_language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_next_episode?: boolean | null
          autoplay?: boolean | null
          created_at?: string
          default_volume?: number | null
          email_notifications?: boolean | null
          id?: string
          notifications_enabled?: boolean | null
          playback_speed?: number | null
          subtitle_language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      watch_history: {
        Row: {
          duration: number | null
          episode_name: string | null
          episode_slug: string | null
          id: string
          movie_name: string
          movie_slug: string
          poster_url: string | null
          progress: number | null
          user_id: string
          watched_at: string
        }
        Insert: {
          duration?: number | null
          episode_name?: string | null
          episode_slug?: string | null
          id?: string
          movie_name: string
          movie_slug: string
          poster_url?: string | null
          progress?: number | null
          user_id: string
          watched_at?: string
        }
        Update: {
          duration?: number | null
          episode_name?: string | null
          episode_slug?: string | null
          id?: string
          movie_name?: string
          movie_slug?: string
          poster_url?: string | null
          progress?: number | null
          user_id?: string
          watched_at?: string
        }
        Relationships: []
      }
      watch_room_messages: {
        Row: {
          avatar_url: string | null
          content: string
          created_at: string
          display_name: string
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          content: string
          created_at?: string
          display_name: string
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          content?: string
          created_at?: string
          display_name?: string
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "watch_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_room_participants: {
        Row: {
          avatar_url: string | null
          display_name: string
          id: string
          is_host: boolean | null
          joined_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          display_name: string
          id?: string
          is_host?: boolean | null
          joined_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          display_name?: string
          id?: string
          is_host?: boolean | null
          joined_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "watch_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_rooms: {
        Row: {
          created_at: string
          episode_name: string | null
          episode_slug: string | null
          expires_at: string | null
          host_id: string
          id: string
          is_playing: boolean | null
          movie_name: string
          movie_slug: string
          playback_time: number | null
          poster_url: string | null
          room_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          episode_name?: string | null
          episode_slug?: string | null
          expires_at?: string | null
          host_id: string
          id?: string
          is_playing?: boolean | null
          movie_name: string
          movie_slug: string
          playback_time?: number | null
          poster_url?: string | null
          room_code: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          episode_name?: string | null
          episode_slug?: string | null
          expires_at?: string | null
          host_id?: string
          id?: string
          is_playing?: boolean | null
          movie_name?: string
          movie_slug?: string
          playback_time?: number | null
          poster_url?: string | null
          room_code?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_action_type: string
          p_identifier: string
          p_max_requests?: number
          p_window_seconds?: number
        }
        Returns: {
          allowed: boolean
          current_count: number
          reset_at: string
        }[]
      }
      cleanup_expired_security_data: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "premium" | "moderator" | "admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["user", "premium", "moderator", "admin"],
    },
  },
} as const
