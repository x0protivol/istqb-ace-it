import { useState, useEffect } from 'react'
import { supabase, UserStats } from '@/lib/supabase'

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      setLoading(true)
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
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    refetch: fetchStats
  }
}