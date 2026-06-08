import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          discord_id: string;
          email?: string;
          username: string;
          display_name?: string;
          avatar_url?: string;
          dashboard_access: boolean;
          permissions: string[];
          role_level: number;
          role_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          discord_id: string;
          email?: string;
          username: string;
          display_name?: string;
          avatar_url?: string;
          dashboard_access?: boolean;
          permissions?: string[];
          role_level?: number;
          role_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          discord_id?: string;
          email?: string;
          username?: string;
          display_name?: string;
          avatar_url?: string;
          dashboard_access?: boolean;
          permissions?: string[];
          role_level?: number;
          role_name?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description?: string;
          icon?: string;
          icon_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string;
          icon?: string;
          icon_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      pages: {
        Row: {
          id: string;
          category_id: string;
          title: string;
          content?: string;
          image_url?: string;
          media_urls: string[];
          metadata: Record<string, unknown>;
          status: string;
          created_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          title: string;
          content?: string;
          image_url?: string;
          media_urls?: string[];
          metadata?: Record<string, unknown>;
          status?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['pages']['Insert']>;
      };
      credits: {
        Row: {
          id: string;
          discord_id?: string;
          email?: string;
          display_name: string;
          avatar_url?: string;
          role_name: string;
          title?: string;
          contribution?: string;
          sort_order: number;
          featured: boolean;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          discord_id?: string;
          email?: string;
          display_name: string;
          avatar_url?: string;
          role_name: string;
          title?: string;
          contribution?: string;
          sort_order?: number;
          featured?: boolean;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['credits']['Insert']>;
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          type: 'info' | 'warning' | 'success' | 'error';
          active: boolean;
          priority: number;
          expires_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          type?: 'info' | 'warning' | 'success' | 'error';
          active?: boolean;
          priority?: number;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>;
      };
      web_logos: {
        Row: {
          id: string;
          name: string;
          type: 'banner' | 'loading' | 'favicon' | 'logo';
          image_url: string;
          is_active: boolean;
          description?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'banner' | 'loading' | 'favicon' | 'logo';
          image_url: string;
          is_active?: boolean;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['web_logos']['Insert']>;
      };
    };
  };
};
