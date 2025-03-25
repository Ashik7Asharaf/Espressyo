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
      communities: {
        Row: {
          id: string
          name: string
          description: string | null
          location: Json
          creator_ids: string[]
          member_count: number
          image_url: string | null
          tags: string[]
          type: 'public' | 'private'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          location: Json
          creator_ids: string[]
          member_count?: number
          image_url?: string | null
          tags: string[]
          type: 'public' | 'private'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          location?: Json
          creator_ids?: string[]
          member_count?: number
          image_url?: string | null
          tags?: string[]
          type?: 'public' | 'private'
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string | null
          location: Json
          start_date: string
          end_date: string
          type: 'public' | 'supporters-only'
          support_tier: 'basic' | 'premium' | null
          max_attendees: number | null
          current_attendees: number
          image_url: string | null
          price: number | null
          currency: string | null
          tags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string | null
          location: Json
          start_date: string
          end_date: string
          type: 'public' | 'supporters-only'
          support_tier?: 'basic' | 'premium' | null
          max_attendees?: number | null
          current_attendees?: number
          image_url?: string | null
          price?: number | null
          currency?: string | null
          tags: string[]
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string | null
          location?: Json
          start_date?: string
          end_date?: string
          type?: 'public' | 'supporters-only'
          support_tier?: 'basic' | 'premium' | null
          max_attendees?: number | null
          current_attendees?: number
          image_url?: string | null
          price?: number | null
          currency?: string | null
          tags?: string[]
          created_at?: string
        }
      }
      community_members: {
        Row: {
          user_id: string
          community_id: string
          role: 'admin' | 'moderator' | 'member'
          joined_at: string
        }
        Insert: {
          user_id: string
          community_id: string
          role: 'admin' | 'moderator' | 'member'
          joined_at?: string
        }
        Update: {
          user_id?: string
          community_id?: string
          role?: 'admin' | 'moderator' | 'member'
          joined_at?: string
        }
      }
      event_attendees: {
        Row: {
          user_id: string
          event_id: string
          status: 'going' | 'maybe' | 'not-going'
          ticket_id: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          event_id: string
          status: 'going' | 'maybe' | 'not-going'
          ticket_id?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          event_id?: string
          status?: 'going' | 'maybe' | 'not-going'
          ticket_id?: string | null
          updated_at?: string
        }
      }
      community_posts: {
        Row: {
          id: string
          community_id: string
          creator_id: string
          content: string
          media_urls: string[] | null
          type: 'public' | 'supporters-only'
          support_tier: 'basic' | 'premium' | null
          location: Json | null
          likes: number
          comments: number
          created_at: string
        }
        Insert: {
          id?: string
          community_id: string
          creator_id: string
          content: string
          media_urls?: string[] | null
          type: 'public' | 'supporters-only'
          support_tier?: 'basic' | 'premium' | null
          location?: Json | null
          likes?: number
          comments?: number
          created_at?: string
        }
        Update: {
          id?: string
          community_id?: string
          creator_id?: string
          content?: string
          media_urls?: string[] | null
          type?: 'public' | 'supporters-only'
          support_tier?: 'basic' | 'premium' | null
          location?: Json | null
          likes?: number
          comments?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_nearby_events: {
        Args: {
          lat: number
          lng: number
          radius_km: number
          max_results: number
        }
        Returns: {
          id: string
          creator_id: string
          title: string
          description: string | null
          location: Json
          start_date: string
          end_date: string
          type: 'public' | 'supporters-only'
          support_tier: 'basic' | 'premium' | null
          max_attendees: number | null
          current_attendees: number
          image_url: string | null
          price: number | null
          currency: string | null
          tags: string[]
          created_at: string
        }[]
      }
      get_nearby_communities: {
        Args: {
          lat: number
          lng: number
          radius_km: number
          max_results: number
        }
        Returns: {
          id: string
          name: string
          description: string | null
          location: Json
          creator_ids: string[]
          member_count: number
          image_url: string | null
          tags: string[]
          type: 'public' | 'private'
          created_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 