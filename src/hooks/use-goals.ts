import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { MonthlyGoal } from '@/types/goals'

interface UseGoalsReturn {
  goals: MonthlyGoal[]
  isLoading: boolean
  error: string | null
  fetchGoals: () => Promise<void>
  insertGoal: (
    goal: Omit<MonthlyGoal, 'id' | 'user_id'>,
  ) => Promise<{ data: MonthlyGoal | null; error: string | null }>
  updateGoal: (
    id: string,
    updates: Partial<Omit<MonthlyGoal, 'id' | 'user_id'>>,
  ) => Promise<{ data: MonthlyGoal | null; error: string | null }>
}

export const useGoals = (): UseGoalsReturn => {
  const { user } = useAuth()
  const [goals, setGoals] = useState<MonthlyGoal[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setError('Usuário não autenticado')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('user_id', user.id)

      if (fetchError) throw fetchError

      setGoals(data as MonthlyGoal[])
    } catch (err) {
      setError('Erro ao carregar metas')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const insertGoal = async (goal: Omit<MonthlyGoal, 'id' | 'user_id'>) => {
    if (!user) {
      return { data: null, error: 'Usuário não autenticado' }
    }

    try {
      const { data, error: insertError } = await supabase
        .from('monthly_goals')
        .insert([{ ...goal, user_id: user.id }])
        .select()
        .single()

      if (insertError) throw insertError

      const newGoal = data as MonthlyGoal
      setGoals((prev) => [...prev, newGoal])
      return { data: newGoal, error: null }
    } catch (err) {
      return { data: null, error: 'Erro ao criar meta' }
    }
  }

  const updateGoal = async (id: string, updates: Partial<Omit<MonthlyGoal, 'id' | 'user_id'>>) => {
    if (!user) {
      return { data: null, error: 'Usuário não autenticado' }
    }

    try {
      const { data, error: updateError } = await supabase
        .from('monthly_goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      const updatedGoal = data as MonthlyGoal
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updatedGoal } : g)))
      return { data: updatedGoal, error: null }
    } catch (err) {
      return { data: null, error: 'Erro ao atualizar meta' }
    }
  }

  return { goals, isLoading, error, fetchGoals, insertGoal, updateGoal }
}
