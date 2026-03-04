-- Migration: Enable shared data across all authenticated users + add unit_price

-- 1. Add unit_price to sales
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS unit_price NUMERIC NOT NULL DEFAULT 0;

-- 2. Drop existing restrictive RLS policies
DROP POLICY IF EXISTS "Users can manage their own goals" ON public.monthly_goals;
DROP POLICY IF EXISTS "Authenticated users can view all products" ON public.products;
DROP POLICY IF EXISTS "Users can manage own products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view all sales" ON public.sales;
DROP POLICY IF EXISTS "Users can manage own sales" ON public.sales;

-- 3. Create shared RLS policies

-- monthly_goals: any authenticated user can read/insert/update/delete
CREATE POLICY "Authenticated users can read all goals"
ON public.monthly_goals FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert goals"
ON public.monthly_goals FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update goals"
ON public.monthly_goals FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete goals"
ON public.monthly_goals FOR DELETE USING (auth.role() = 'authenticated');

-- products: any authenticated user can CRUD
CREATE POLICY "Authenticated users can read all products"
ON public.products FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert products"
ON public.products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products"
ON public.products FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete products"
ON public.products FOR DELETE USING (auth.role() = 'authenticated');

-- sales: any authenticated user can CRUD
CREATE POLICY "Authenticated users can read all sales"
ON public.sales FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert sales"
ON public.sales FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update sales"
ON public.sales FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete sales"
ON public.sales FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Remove UNIQUE constraint on monthly_goals (user_id, month, year) and make it (month, year)
-- so there's only one global goal per month
ALTER TABLE public.monthly_goals DROP CONSTRAINT IF EXISTS monthly_goals_user_id_month_year_key;

-- Add unique on month+year only (global goal per month)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'monthly_goals_month_year_key'
  ) THEN
    ALTER TABLE public.monthly_goals ADD CONSTRAINT monthly_goals_month_year_key UNIQUE (month, year);
  END IF;
END $$;

-- 5. Remove UNIQUE constraint on products (user_id, name) and make it just (name)
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_user_id_name_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_name_key'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT products_name_key UNIQUE (name);
  END IF;
END $$;

-- 6. Enable Realtime for the relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.monthly_goals;
