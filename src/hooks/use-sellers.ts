import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Seller } from '@/types/goals'

interface UseSellersReturn {
    sellers: Seller[]
    activeSellers: Seller[]
    isLoading: boolean
    fetchSellers: () => Promise<void>
    insertSeller: (name: string) => Promise<{ data: Seller | null; error: string | null }>
    updateSeller: (id: string, updates: Partial<Pick<Seller, 'name' | 'active'>>) => Promise<{ error: string | null }>
    deleteSeller: (id: string) => Promise<{ error: string | null }>
}

export const useSellers = (): UseSellersReturn => {
    const { user } = useAuth()
    const [sellers, setSellers] = useState<Seller[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchSellers = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('sellers')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error
            setSellers((data as Seller[]) || [])
        } catch {
            /* silently fail */
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Initial fetch
    useEffect(() => {
        fetchSellers()
    }, [fetchSellers])

    const activeSellers = sellers.filter((s) => s.active)

    const insertSeller = async (name: string) => {
        if (!user) return { data: null, error: 'Usuário não autenticado' }
        if (!name.trim()) return { data: null, error: 'Nome é obrigatório' }

        try {
            const { data, error } = await supabase
                .from('sellers')
                .insert([{ name: name.trim(), user_id: user.id, active: true }])
                .select()
                .single()

            if (error) throw error
            const newSeller = data as Seller
            setSellers((prev) => [...prev, newSeller].sort((a, b) => a.name.localeCompare(b.name)))
            return { data: newSeller, error: null }
        } catch (err: any) {
            if (err?.code === '23505') {
                return { data: null, error: 'Vendedor com este nome já existe.' }
            }
            return { data: null, error: 'Erro ao adicionar vendedor.' }
        }
    }

    const updateSeller = async (id: string, updates: Partial<Pick<Seller, 'name' | 'active'>>) => {
        try {
            const { error } = await supabase
                .from('sellers')
                .update(updates)
                .eq('id', id)

            if (error) throw error
            setSellers((prev) =>
                prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
            )
            return { error: null }
        } catch {
            return { error: 'Erro ao atualizar vendedor.' }
        }
    }

    const deleteSeller = async (id: string) => {
        try {
            const { error } = await supabase.from('sellers').delete().eq('id', id)
            if (error) throw error
            setSellers((prev) => prev.filter((s) => s.id !== id))
            return { error: null }
        } catch {
            return { error: 'Erro ao excluir vendedor.' }
        }
    }

    return {
        sellers,
        activeSellers,
        isLoading,
        fetchSellers,
        insertSeller,
        updateSeller,
        deleteSeller,
    }
}
