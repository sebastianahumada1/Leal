export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          photo_url: string | null;
          city: string | null;
          birth_date: string | null;
          member_number: string;
          role: 'user' | 'admin' | 'staff';
          current_stamps: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          photo_url?: string | null;
          city?: string | null;
          birth_date?: string | null;
          member_number: string;
          role?: 'user' | 'admin' | 'staff';
          current_stamps?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          photo_url?: string | null;
          city?: string | null;
          birth_date?: string | null;
          member_number?: string;
          role?: 'user' | 'admin' | 'staff';
          current_stamps?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      stamps: {
        Row: {
          id: string;
          user_id: string;
          collected_at: string;
          collected_by: string | null;
          status: 'pending' | 'approved' | 'rejected';
          amount: number | null;
          location_code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          collected_at?: string;
          collected_by?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          amount?: number | null;
          location_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          collected_at?: string;
          collected_by?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          amount?: number | null;
          location_code?: string | null;
          created_at?: string;
        };
      };
      rewards: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          required_stamps: number;
          icon: string | null;
          active: boolean;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          required_stamps: number;
          icon?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          required_stamps?: number;
          icon?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      user_rewards: {
        Row: {
          id: string;
          user_id: string;
          reward_id: string;
          redeemed_at: string | null;
          status: 'pending' | 'approved' | 'rejected' | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reward_id: string;
          redeemed_at?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          reward_id?: string;
          redeemed_at?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | null;
          created_at?: string;
        };
      };
    };
  };
}
