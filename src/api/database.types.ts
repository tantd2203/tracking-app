export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18'
  }
  public: {
    Tables: {
      activities: {
        Row: {
          board_id: string | null
          card_id: string | null
          id: string
          local_date: string
          meta: Json
          occurred_at: string
          type: string
          user_id: string
        }
        Insert: {
          board_id?: string | null
          card_id?: string | null
          id?: string
          local_date: string
          meta?: Json
          occurred_at?: string
          type: string
          user_id?: string
        }
        Update: {
          board_id?: string | null
          card_id?: string | null
          id?: string
          local_date?: string
          meta?: Json
          occurred_at?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'activities_board_id_fkey'
            columns: ['board_id']
            isOneToOne: false
            referencedRelation: 'boards'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'activities_card_id_fkey'
            columns: ['card_id']
            isOneToOne: false
            referencedRelation: 'cards'
            referencedColumns: ['id']
          },
        ]
      }
      boards: {
        Row: {
          archived_at: string | null
          color: number
          created_at: string
          description: string
          id: string
          name: string
          pinned: boolean
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          color?: number
          created_at?: string
          description?: string
          id?: string
          name: string
          pinned?: boolean
          user_id?: string
        }
        Update: {
          archived_at?: string | null
          color?: number
          created_at?: string
          description?: string
          id?: string
          name?: string
          pinned?: boolean
          user_id?: string
        }
        Relationships: []
      }
      card_labels: {
        Row: {
          card_id: string
          label_id: string
          user_id: string
        }
        Insert: {
          card_id: string
          label_id: string
          user_id?: string
        }
        Update: {
          card_id?: string
          label_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'card_labels_card_id_fkey'
            columns: ['card_id']
            isOneToOne: false
            referencedRelation: 'cards'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'card_labels_label_id_fkey'
            columns: ['label_id']
            isOneToOne: false
            referencedRelation: 'labels'
            referencedColumns: ['id']
          },
        ]
      }
      cards: {
        Row: {
          archived_at: string | null
          board_id: string
          completed_at: string | null
          completed_on: string | null
          created_at: string
          description: string
          due_date: string | null
          id: string
          list_id: string
          position: number
          priority: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          board_id: string
          completed_at?: string | null
          completed_on?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          list_id: string
          position: number
          priority?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          archived_at?: string | null
          board_id?: string
          completed_at?: string | null
          completed_on?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          list_id?: string
          position?: number
          priority?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'cards_board_id_fkey'
            columns: ['board_id']
            isOneToOne: false
            referencedRelation: 'boards'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'cards_list_id_fkey'
            columns: ['list_id']
            isOneToOne: false
            referencedRelation: 'lists'
            referencedColumns: ['id']
          },
        ]
      }
      checklist_items: {
        Row: {
          card_id: string
          done: boolean
          id: string
          position: number
          text: string
          user_id: string
        }
        Insert: {
          card_id: string
          done?: boolean
          id?: string
          position: number
          text: string
          user_id?: string
        }
        Update: {
          card_id?: string
          done?: boolean
          id?: string
          position?: number
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'checklist_items_card_id_fkey'
            columns: ['card_id']
            isOneToOne: false
            referencedRelation: 'cards'
            referencedColumns: ['id']
          },
        ]
      }
      labels: {
        Row: {
          color: number
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: number
          id?: string
          name: string
          user_id?: string
        }
        Update: {
          color?: number
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      lists: {
        Row: {
          board_id: string
          id: string
          is_done_list: boolean
          key: string
          name: string
          position: number
          user_id: string
        }
        Insert: {
          board_id: string
          id?: string
          is_done_list?: boolean
          key: string
          name: string
          position: number
          user_id?: string
        }
        Update: {
          board_id?: string
          id?: string
          is_done_list?: boolean
          key?: string
          name?: string
          position?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lists_board_id_fkey'
            columns: ['board_id']
            isOneToOne: false
            referencedRelation: 'boards'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          dark_mode: boolean
          display_name: string | null
          language: string
          reminder_time: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dark_mode?: boolean
          display_name?: string | null
          language?: string
          reminder_time?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          dark_mode?: boolean
          display_name?: string | null
          language?: string
          reminder_time?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      board_stats: {
        Args: { p_today: string }
        Returns: {
          board_id: string
          doing: number
          done: number
          overdue: number
          total: number
        }[]
      }
      create_board: {
        Args: { p_color?: number; p_description?: string; p_name: string }
        Returns: {
          archived_at: string | null
          color: number
          created_at: string
          description: string
          id: string
          name: string
          pinned: boolean
          user_id: string
        }
        SetofOptions: {
          from: '*'
          to: 'boards'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_card: {
        Args: {
          p_board_id: string
          p_list: string
          p_local_date: string
          p_title: string
        }
        Returns: {
          archived_at: string | null
          board_id: string
          completed_at: string | null
          completed_on: string | null
          created_at: string
          description: string
          due_date: string | null
          id: string
          list_id: string
          position: number
          priority: string
          title: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: '*'
          to: 'cards'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      day_cards: {
        Args: { p_day: string }
        Returns: {
          board_id: string
          board_name: string
          card_id: string
          completed_at: string
          title: string
        }[]
      }
      day_counts: {
        Args: { p_from: string; p_to: string }
        Returns: {
          count: number
          day: string
        }[]
      }
      duplicate_board: {
        Args: { p_board_id: string }
        Returns: {
          archived_at: string | null
          color: number
          created_at: string
          description: string
          id: string
          name: string
          pinned: boolean
          user_id: string
        }
        SetofOptions: {
          from: '*'
          to: 'boards'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      move_card: {
        Args: {
          p_card_id: string
          p_local_date: string
          p_position: number
          p_to_list: string
        }
        Returns: {
          archived_at: string | null
          board_id: string
          completed_at: string | null
          completed_on: string | null
          created_at: string
          description: string
          due_date: string | null
          id: string
          list_id: string
          position: number
          priority: string
          title: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: '*'
          to: 'cards'
          isOneToOne: true
          isSetofReturn: false
        }
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
