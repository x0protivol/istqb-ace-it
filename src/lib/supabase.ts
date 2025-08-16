import { createClient } from '@supabase/supabase-js'

// Prefer environment variables; fallback to hardcoded for immediate functionality
const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL
const envAnon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY

const supabaseUrl = envUrl || 'https://tdqjvhtanqpbhrbijqzm.supabase.co'
const supabaseAnonKey = envAnon || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkcWp2aHRhbnFwYmhyYmlqcXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyODMzNDYsImV4cCI6MjA3MDg1OTM0Nn0.f033MKao0EH-mzMaEZxM_Vk55XIShmUnIMlUsqm3zpA'

// Create Supabase client with retry logic
const createSupabaseClient = () => {
	try {
		return createClient(supabaseUrl, supabaseAnonKey, {
			auth: {
				persistSession: false,
				autoRefreshToken: false,
			},
			realtime: {
				params: {
					eventsPerSecond: 10,
				},
			},
		})
	} catch (error) {
		console.error('Failed to create Supabase client:', error)
		throw error
	}
}

export const supabase = createSupabaseClient()

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