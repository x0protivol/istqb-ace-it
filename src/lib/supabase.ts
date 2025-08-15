import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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