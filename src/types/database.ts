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
      books: {
        Row: {
          id: number
          name: string
          slug: string
          chapter_count: number
          sort_order: number
        }
        Insert: {
          id?: number
          name: string
          slug: string
          chapter_count: number
          sort_order: number
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          chapter_count?: number
          sort_order?: number
        }
      }
      plans: {
        Row: {
          id: string
          user_id: string
          title: string
          start_date: string
          duration_days: number | null
          is_catch_up_mode: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          start_date?: string
          duration_days?: number | null
          is_catch_up_mode?: boolean
          created_at?: string
        }
      }
      plan_items: {
        Row: {
          id: string
          plan_id: string
          book_id: number
          chapter: number
          day_index: number
          sort_order: number
        }
        Insert: {
          id?: string
          plan_id: string
          book_id: number
          chapter: number
          day_index: number
          sort_order?: number
        }
      }
      reading_logs: {
        Row: {
          id: string
          user_id: string
          plan_item_id: string
          status: 'completed' | 'skipped'
          completed_at: string
          note_content: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan_item_id: string
          status?: 'completed' | 'skipped'
          completed_at?: string
          note_content?: string | null
        }
      }
    }
  }
}