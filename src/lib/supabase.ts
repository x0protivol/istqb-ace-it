import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not defined. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

// Create a mock client if environment variables are missing
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: () => ({
        select: () => ({
          limit: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          }),
          order: () => ({
            then: (callback: any) => callback({ data: [], error: null })
          }),
          insert: () => ({
            select: () => Promise.resolve({ data: [], error: null })
          }),
          update: () => ({
            eq: () => Promise.resolve({ error: null })
          })
        })
      }),
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
        })
      }
    } as any

// Database types
export interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  hint: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  source_pdf?: string
  created_at?: string
}

export interface ExamSession {
  id: string
  user_id?: string
  question_ids: string[]
  answers: number[]
  score: number
  time_spent: number
  total_time: number
  completed: boolean
  started_at: string
  completed_at?: string
}

export interface UserStats {
  id: string
  user_id?: string
  total_questions: number
  correct_answers: number
  total_points: number
  current_streak: number
  best_streak: number
  average_time: number
  exams_taken: number
  last_exam_date?: string
}