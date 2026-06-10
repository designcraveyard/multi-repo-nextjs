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
      admin_roles: {
        Row: {
          created_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agent_configs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_background: boolean | null
          is_entry_point: boolean | null
          model: string | null
          name: string
          slug: string
          system_prompt: string | null
          temperature: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_background?: boolean | null
          is_entry_point?: boolean | null
          model?: string | null
          name: string
          slug: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_background?: boolean | null
          is_entry_point?: boolean | null
          model?: string | null
          name?: string
          slug?: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      agent_handoffs: {
        Row: {
          sort_order: number | null
          source_agent_id: string
          target_agent_id: string
          tool_description_override: string | null
        }
        Insert: {
          sort_order?: number | null
          source_agent_id: string
          target_agent_id: string
          tool_description_override?: string | null
        }
        Update: {
          sort_order?: number | null
          source_agent_id?: string
          target_agent_id?: string
          tool_description_override?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_handoffs_source_agent_id_fkey"
            columns: ["source_agent_id"]
            isOneToOne: false
            referencedRelation: "agent_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_handoffs_target_agent_id_fkey"
            columns: ["target_agent_id"]
            isOneToOne: false
            referencedRelation: "agent_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_tools: {
        Row: {
          agent_id: string
          parameter_overrides: Json | null
          tool_id: string
        }
        Insert: {
          agent_id: string
          parameter_overrides?: Json | null
          tool_id: string
        }
        Update: {
          agent_id?: string
          parameter_overrides?: Json | null
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_tools_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tool_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_versions: {
        Row: {
          id: string
          notes: string | null
          published_at: string | null
          published_by: string | null
          snapshot: Json
          version_number: number
        }
        Insert: {
          id?: string
          notes?: string | null
          published_at?: string | null
          published_by?: string | null
          snapshot: Json
          version_number: number
        }
        Update: {
          id?: string
          notes?: string | null
          published_at?: string | null
          published_by?: string | null
          snapshot?: Json
          version_number?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          agent_name: string | null
          content: string | null
          created_at: string | null
          id: string
          role: string
          sequence_number: number
          session_id: string
          tool_calls: Json | null
        }
        Insert: {
          agent_name?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          role: string
          sequence_number: number
          session_id: string
          tool_calls?: Json | null
        }
        Update: {
          agent_name?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          role?: string
          sequence_number?: number
          session_id?: string
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          active_agent: string | null
          id: string
          last_message_at: string | null
          message_count: number | null
          started_at: string | null
          status: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          active_agent?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          started_at?: string | null
          status?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          active_agent?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          started_at?: string | null
          status?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      debug_traces: {
        Row: {
          created_at: string | null
          events: Json | null
          session_id: string | null
          started_at: string | null
          summary: Json | null
          total_ms: number | null
          trace_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          events?: Json | null
          session_id?: string | null
          started_at?: string | null
          summary?: Json | null
          total_ms?: number | null
          trace_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          events?: Json | null
          session_id?: string | null
          started_at?: string | null
          summary?: Json | null
          total_ms?: number | null
          trace_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      intelligence_embeddings: {
        Row: {
          chunk_index: number | null
          chunk_text: string
          content_section: string | null
          created_at: string | null
          embedding: string | null
          entity_id: string | null
          entity_name: string | null
          entity_slug: string | null
          entity_type: string | null
          id: string
        }
        Insert: {
          chunk_index?: number | null
          chunk_text: string
          content_section?: string | null
          created_at?: string | null
          embedding?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_slug?: string | null
          entity_type?: string | null
          id?: string
        }
        Update: {
          chunk_index?: number | null
          chunk_text?: string
          content_section?: string | null
          created_at?: string | null
          embedding?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_slug?: string | null
          entity_type?: string | null
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tool_definitions: {
        Row: {
          code_ref: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          parameters_schema: Json | null
          slug: string
          tool_type: string | null
        }
        Insert: {
          code_ref?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parameters_schema?: Json | null
          slug: string
          tool_type?: string | null
        }
        Update: {
          code_ref?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parameters_schema?: Json | null
          slug?: string
          tool_type?: string | null
        }
        Relationships: []
      }
      user_memories: {
        Row: {
          confidence: number | null
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_reinforced_at: string | null
          memory_type: string
          source_session_id: string | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_reinforced_at?: string | null
          memory_type: string
          source_session_id?: string | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_reinforced_at?: string | null
          memory_type?: string
          source_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_memories_source_session_id_fkey"
            columns: ["source_session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_intel: {
        Args: {
          filter_entity_type?: string
          match_count?: number
          query_embedding: string
        }
        Returns: {
          chunk_text: string
          content_section: string
          entity_name: string
          entity_slug: string
          entity_type: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
