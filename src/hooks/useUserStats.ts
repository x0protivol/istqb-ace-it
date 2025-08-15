import { useState, useEffect, useCallback } from 'react'
import { supabase, UserStats } from '@/lib/supabase'

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      
      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('Supabase not configured, using mock data')
        setStats({
          id: 'mock',
          total_questions: 0,
          correct_answers: 0,
          total_points: 0,
          current_streak: 0,
          best_streak: 0,
          average_time: 0,
          exams_taken: 0
        })
        return
      }
      
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error
      }

      setStats(data || null)
    } catch (error) {
      console.error('Error fetching user stats:', error)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    refetch: fetchStats
  }
}