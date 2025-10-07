export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      subjects: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          slug: string;
          owner_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          slug: string;
          owner_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["subjects"]["Insert"]>;
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          subject_id: string;
          term: string;
          definition: string;
          question: string | null;
          choices: Json;
          answer_index: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          subject_id: string;
          term: string;
          definition: string;
          question?: string | null;
          choices?: Json;
          answer_index?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["items"]["Insert"]>;
        Relationships: [];
      };
      item_progress: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          item_id: string;
          user_id: string;
          last_seen: string | null;
          last_result: "easy" | "medium" | "hard" | null;
          times_seen: number;
          easy_count: number;
          medium_count: number;
          hard_count: number;
          next_due: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          item_id: string;
          user_id: string;
          last_seen?: string | null;
          last_result?: "easy" | "medium" | "hard" | null;
          times_seen?: number;
          easy_count?: number;
          medium_count?: number;
          hard_count?: number;
          next_due?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["item_progress"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
