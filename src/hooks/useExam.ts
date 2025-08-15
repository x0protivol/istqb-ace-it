import { useState, useEffect } from 'react'
import { supabase, ExamSession, Question } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export const useExam = () => {
  const [examSession, setExamSession] = useState<ExamSession | null>(null)
  const [examQuestions, setExamQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const startExam = async (questionCount: number = 60) => {
    try {
      setLoading(true)
      
      // Fetch random questions
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .limit(questionCount)

      if (questionsError) throw questionsError
      
      if (!questions || questions.length === 0) {
        toast({
          title: "No Questions Available",
          description: "Please upload some questions first",
          variant: "destructive"
        })
        return null
      }

      // Shuffle questions
      const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5)
      
      // Create exam session
      const newSession: Omit<ExamSession, 'id'> = {
        question_ids: shuffledQuestions.map(q => q.id),
        answers: new Array(shuffledQuestions.length).fill(-1),
        score: 0,
        time_spent: 0,
        total_time: questionCount * 60, // 1 minute per question
        completed: false,
        started_at: new Date().toISOString()
      }

      const { data: session, error: sessionError } = await supabase
        .from('exam_sessions')
        .insert(newSession)
        .select()
        .single()

      if (sessionError) throw sessionError

      setExamSession(session)
      setExamQuestions(shuffledQuestions)
      
      toast({
        title: "Exam Started",
        description: `Good luck with your ${questionCount} question exam!`
      })
      
      return session
    } catch (error) {
      console.error('Error starting exam:', error)
      toast({
        title: "Error",
        description: "Failed to start exam",
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateAnswer = async (questionIndex: number, answer: number) => {
    if (!examSession) return

    try {
      const newAnswers = [...examSession.answers]
      newAnswers[questionIndex] = answer

      const { error } = await supabase
        .from('exam_sessions')
        .update({ answers: newAnswers })
        .eq('id', examSession.id)

      if (error) throw error

      setExamSession(prev => prev ? { ...prev, answers: newAnswers } : null)
    } catch (error) {
      console.error('Error updating answer:', error)
    }
  }

  const finishExam = async (timeSpent: number) => {
    if (!examSession || !examQuestions) return null

    try {
      // Calculate score
      let score = 0
      examSession.answers.forEach((answer, index) => {
        if (answer === examQuestions[index].correct_answer) {
          score += 1
        }
      })

      const completedSession = {
        ...examSession,
        score,
        time_spent: timeSpent,
        completed: true,
        completed_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('exam_sessions')
        .update({
          score: completedSession.score,
          time_spent: completedSession.time_spent,
          completed: true,
          completed_at: completedSession.completed_at
        })
        .eq('id', examSession.id)

      if (error) throw error

      // Update user stats
      await updateUserStats(score, examQuestions.length, timeSpent)

      setExamSession(completedSession)
      return completedSession
    } catch (error) {
      console.error('Error finishing exam:', error)
      toast({
        title: "Error",
        description: "Failed to save exam results",
        variant: "destructive"
      })
      return null
    }
  }

  const updateUserStats = async (score: number, totalQuestions: number, timeSpent: number) => {
    try {
      const { data: existingStats } = await supabase
        .from('user_stats')
        .select('*')
        .limit(1)
        .single()

      const avgTime = Math.floor(timeSpent / totalQuestions)
      
      if (existingStats) {
        const newTotalQuestions = existingStats.total_questions + totalQuestions
        const newCorrectAnswers = existingStats.correct_answers + score
        const newTotalPoints = existingStats.total_points + score
        const newExamsTaken = existingStats.exams_taken + 1
        
        const { error } = await supabase
          .from('user_stats')
          .update({
            total_questions: newTotalQuestions,
            correct_answers: newCorrectAnswers,
            total_points: newTotalPoints,
            exams_taken: newExamsTaken,
            average_time: Math.floor((existingStats.average_time + avgTime) / 2),
            last_exam_date: new Date().toISOString()
          })
          .eq('id', existingStats.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('user_stats')
          .insert({
            total_questions: totalQuestions,
            correct_answers: score,
            total_points: score,
            current_streak: 0,
            best_streak: 0,
            average_time: avgTime,
            exams_taken: 1,
            last_exam_date: new Date().toISOString()
          })

        if (error) throw error
      }
    } catch (error) {
      console.error('Error updating user stats:', error)
    }
  }

  return {
    examSession,
    examQuestions,
    loading,
    startExam,
    updateAnswer,
    finishExam
  }
}