import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { MonthlyGoal } from '@/types/goals'

interface UseGoalsReturn {
  goals: MonthlyGoal[]
  isLoading: boolean
  fetchGoals: () => Promise<void>
  upsertGoal: (
    month: number,
    year: number,
    target_value: number,
  ) => Promise<{ data: MonthlyGoal | null; error: string | null }>
}

export const useGoals = (): UseGoalsReturn => {
  const { user } = useAuth()
  const [goals, setGoals] = useState<MonthlyGoal[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchGoals = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('monthly_goals')
        .select('*')

      if (error) throw error
      setGoals((data as MonthlyGoal[]) || [])
    } catch {
      /* silently fail */
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Realtime subscription for goals
  useEffect(() => {
    const channel = supabase
      .channel('goals-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'monthly_goals' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newGoal = payload.new as MonthlyGoal
            setGoals((prev) => {
              if (prev.some((g) => g.id === newGoal.id)) return prev
              return [...prev, newGoal]
            })
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as MonthlyGoal
            setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id
            setGoals((prev) => prev.filter((g) => g.id !== deletedId))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const upsertGoal = async (month: number, year: number, target_value: number) => {
    if (!user) return { data: null, error: 'Usuário não autenticado' }

    try {
      // Try UPDATE first (works if goal already exists for this month/year)
      const { data: updated, error: updateError } = await supabase
        .from('monthly_goals')
        .update({ target_value })
        .eq('month', month)
        .eq('year', year)
        .select()

      if (updateError) { console.error('Goal update error:', updateError); throw updateError }

      if (updated && updated.length > 0) {
        // Update succeeded
        const goal = updated[0] as MonthlyGoal
        setGoals((prev) => {
          const exists = prev.some((g) => g.id === goal.id)
          if (exists) return prev.map((g) => (g.id === goal.id ? goal : g))
          return [...prev.filter((g) => !(g.month === month && g.year === year)), goal]
        })
        return { data: goal, error: null }
      }

      // No existing goal found — INSERT new one
      const { data: inserted, error: insertError } = await supabase
        .from('monthly_goals')
        .insert([{ user_id: user.id, month, year, target_value }])
        .select()
        .single()

      if (insertError) { console.error('Goal insert error:', insertError); throw insertError }
      const goal = inserted as MonthlyGoal
      setGoals((prev) => [...prev, goal])
      return { data: goal, error: null }
    } catch (err) {
      console.error('Goal upsert failed:', err)
      return { data: null, error: 'Erro ao salvar meta' }
    }
  }

  return { goals, isLoading, fetchGoals, upsertGoal }
}
