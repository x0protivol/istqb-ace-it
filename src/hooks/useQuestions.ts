import { useState, useEffect } from 'react'
import { supabase, Question } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuestions(data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addQuestions = async (newQuestions: Omit<Question, 'id' | 'created_at'>[]) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert(newQuestions)
        .select()

      if (error) throw error
      
      setQuestions(prev => [...(data || []), ...prev])
      toast({
        title: "Success",
        description: `Added ${newQuestions.length} questions`
      })
      
      return data
    } catch (error) {
      console.error('Error adding questions:', error)
      toast({
        title: "Error",
        description: "Failed to add questions",
        variant: "destructive"
      })
      throw error
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  return {
    questions,
    loading,
    refetch: fetchQuestions,
    addQuestions
  }
}