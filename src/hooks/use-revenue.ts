import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Sale, Product } from '@/types/goals'

interface UseRevenueReturn {
  sales: Sale[]
  products: Product[]
  isLoadingSales: boolean
  isLoadingProducts: boolean
  salesError: string | null
  productsError: string | null
  fetchSales: () => Promise<void>
  insertSale: (
    sale: Omit<Sale, 'id' | 'user_id' | 'created_at'>,
  ) => Promise<{ data: Sale | null; error: string | null }>
  updateSale: (
    id: string,
    updates: Partial<Omit<Sale, 'id' | 'user_id' | 'created_at'>>,
  ) => Promise<{ data: Sale | null; error: string | null }>
  deleteSale: (id: string) => Promise<{ error: string | null }>
  fetchProducts: () => Promise<void>
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

  const [salesError, setSalesError] = useState<string | null>(null)
  const [productsError, setProductsError] = useState<string | null>(null)

  const fetchSales = useCallback(async () => {
    if (!user) {
      setSalesError('Usuário não autenticado')
      return
    }
    setIsLoadingSales(true)
    setSalesError(null)
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .order('sale_date', { ascending: false })

      if (error) throw error
      setSales(data as Sale[])
    } catch (err) {
      setSalesError('Erro ao carregar vendas')
    } finally {
      setIsLoadingSales(false)
    }
  }, [user])

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
      setSales((prev) => [newSale, ...prev])
      return { data: newSale, error: null }
    } catch (err) {
      return { data: null, error: 'Erro ao registrar venda' }
    }
  }

  const updateSale = async (
    id: string,
    updates: Partial<Omit<Sale, 'id' | 'user_id' | 'created_at'>>,
  ) => {
    if (!user) return { data: null, error: 'Usuário não autenticado' }
    try {
      const { data, error } = await supabase
        .from('sales')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      const updatedSale = data as Sale
      setSales((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedSale } : s)))
      return { data: updatedSale, error: null }
    } catch (err) {
      return { data: null, error: 'Erro ao atualizar venda' }
    }
  }

  const deleteSale = async (id: string) => {
    if (!user) return { error: 'Usuário não autenticado' }
    try {
      const { error } = await supabase.from('sales').delete().eq('id', id).eq('user_id', user.id)

      if (error) throw error
      setSales((prev) => prev.filter((s) => s.id !== id))
      return { error: null }
    } catch (err) {
      return { error: 'Erro ao excluir venda' }
    }
  }

  const fetchProducts = useCallback(async () => {
    if (!user) {
      setProductsError('Usuário não autenticado')
      return
    }
    setIsLoadingProducts(true)
    setProductsError(null)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data as Product[])
    } catch (err) {
      setProductsError('Erro ao carregar produtos')
    } finally {
      setIsLoadingProducts(false)
    }
  }, [user])

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
    } catch (err) {
      return { data: null, error: 'Erro ao criar produto' }
    }
  }

  const updateProduct = async (
    id: string,
    updates: Partial<Omit<Product, 'id' | 'user_id' | 'created_at'>>,
  ) => {
    if (!user) return { data: null, error: 'Usuário não autenticado' }
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      const updatedProduct = data as Product
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p)))
      return { data: updatedProduct, error: null }
    } catch (err) {
      return { data: null, error: 'Erro ao atualizar produto' }
    }
  }

  const deleteProduct = async (id: string) => {
    if (!user) return { error: 'Usuário não autenticado' }
    try {
      const { error } = await supabase.from('products').delete().eq('id', id).eq('user_id', user.id)

      if (error) throw error
      setProducts((prev) => prev.filter((p) => p.id !== id))
      return { error: null }
    } catch (err) {
      return { error: 'Erro ao excluir produto' }
    }
  }

  return {
    sales,
    products,
    isLoadingSales,
    isLoadingProducts,
    salesError,
    productsError,
    fetchSales,
    insertSale,
    updateSale,
    deleteSale,
    fetchProducts,
    insertProduct,
    updateProduct,
    deleteProduct,
  }
}
