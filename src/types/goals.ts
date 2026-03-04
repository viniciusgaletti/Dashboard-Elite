export interface MonthlyGoal {
  id: string
  user_id: string
  month: number
  year: number
  target_value: number
}

export interface Product {
  id: string
  user_id: string
  name: string
  price: number
  is_default: boolean
  created_at: string
}

export interface Sale {
  id: string
  user_id: string
  product_name: string
  unit_price: number
  sale_value: number
  quantity: number
  seller_name: string
  sale_date: string
  notes: string
  created_at: string
}
