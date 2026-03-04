import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Sale, Product } from '@/types/goals'

interface UseRevenueReturn {
  sales: Sale[]
  products: Product[]
  isLoadingSales: boolean
  isLoadingProducts: boolean
  fetchSales: () => Promise<void>
  fetchProducts: () => Promise<void>
  insertSale: (
    sale: Omit<Sale, 'id' | 'user_id' | 'created_at'>,
  ) => Promise<{ data: Sale | null; error: string | null }>
  deleteSale: (id: string) => Promise<{ error: string | null }>
  insertProduct: (
    product: Omit<Product, 'id' | 'user_id' | 'created_at'>,
  ) => Promise<{ data: Product | null; error: string | null }>
  updateProduct: (
    id: string,
    updates: Partial<Omit<Product, 'id' | 'user_id' | 'created_at'>>,
  ) => Promise<{ data: Product | null; error: string | null }>
  deleteProduct: (id: string) => Promise<{ error: string | null }>
}

export const useRevenue = (): UseRevenueReturn => {
  const { user } = useAuth()

  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [isLoadingSales, setIsLoadingSales] = useState<boolean>(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false)

  const fetchSales = useCallback(async () => {
    setIsLoadingSales(true)
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setSales((data as Sale[]) || [])
    } catch {
      /* silently fail */
    } finally {
      setIsLoadingSales(false)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('price', { ascending: false })

      if (error) throw error
      setProducts((data as Product[]) || [])
    } catch {
      /* silently fail */
    } finally {
      setIsLoadingProducts(false)
    }
  }, [])

  // Realtime subscription for sales
  useEffect(() => {
    const channel = supabase
      .channel('sales-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sales' },
        (payload) => {
          const newSale = payload.new as Sale
          setSales((prev) => {
            if (prev.some((s) => s.id === newSale.id)) return prev
            return [newSale, ...prev]
          })
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'sales' },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id
          setSales((prev) => prev.filter((s) => s.id !== deletedId))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const insertSale = async (sale: Omit<Sale, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { data: null, error: 'Usuário não autenticado' }
    try {
      const { data, error } = await supabase
        .from('sales')
        .insert([{ ...sale, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      const newSale = data as Sale
      // Optimistic update (realtime will also fire)
      setSales((prev) => {
        if (prev.some((s) => s.id === newSale.id)) return prev
        return [newSale, ...prev]
      })
      return { data: newSale, error: null }
    } catch (err) {
      console.error('Sale insert error:', err)
      return { data: null, error: 'Erro ao registrar venda' }
    }
  }

  const deleteSale = async (id: string) => {
    try {
      const { error } = await supabase.from('sales').delete().eq('id', id)
      if (error) throw error
      setSales((prev) => prev.filter((s) => s.id !== id))
      return { error: null }
    } catch {
      return { error: 'Erro ao excluir venda' }
    }
  }

  const insertProduct = async (product: Omit<Product, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { data: null, error: 'Usuário não autenticado' }
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...product, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      const newProduct = data as Product
      setProducts((prev) => [newProduct, ...prev])
      return { data: newProduct, error: null }
    } catch {
      return { data: null, error: 'Erro ao criar produto' }
    }
  }

  const updateProduct = async (
    id: string,
    updates: Partial<Omit<Product, 'id' | 'user_id' | 'created_at'>>,
  ) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      const updatedProduct = data as Product
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p)))
      return { data: updatedProduct, error: null }
    } catch {
      return { data: null, error: 'Erro ao atualizar produto' }
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      setProducts((prev) => prev.filter((p) => p.id !== id))
      return { error: null }
    } catch {
      return { error: 'Erro ao excluir produto' }
    }
  }

  return {
    sales,
    products,
    isLoadingSales,
    isLoadingProducts,
    fetchSales,
    fetchProducts,
    insertSale,
    deleteSale,
    insertProduct,
    updateProduct,
    deleteProduct,
  }
}
