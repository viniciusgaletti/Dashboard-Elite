-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: monthly_goals
CREATE TABLE public.monthly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  target_value NUMERIC NOT NULL DEFAULT 0,
  UNIQUE(user_id, month, year)
);

-- Table: products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Table: sales
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  sale_value NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  seller_name TEXT DEFAULT '',
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can manage their own profile" 
ON public.profiles FOR ALL USING (auth.uid() = id);

-- Goals Policies
CREATE POLICY "Users can manage their own goals" 
ON public.monthly_goals FOR ALL USING (auth.uid() = user_id);

-- Products Policies
CREATE POLICY "Authenticated users can view all products" 
ON public.products FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage own products" 
ON public.products FOR ALL USING (auth.uid() = user_id);

-- Sales Policies
CREATE POLICY "Authenticated users can view all sales" 
ON public.sales FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage own sales" 
ON public.sales FOR ALL USING (auth.uid() = user_id);

-- Trigger to automatically create profile for new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (NEW.id, split_part(NEW.email, '@', 1), '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed Data (Admin user & mock data for End-to-End demonstration)
DO $$
DECLARE
  admin_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    admin_id, '00000000-0000-0000-0000-000000000000', 'admin@example.com',
    crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}', '{"name": "Admin"}',
    false, 'authenticated', 'authenticated',
    '', '', '', '', '', NULL, '', '', ''
  );

  -- Profile is created by trigger, let's just update it
  UPDATE public.profiles SET first_name = 'Admin', last_name = 'Apple' WHERE id = admin_id;

  -- Insert Monthly Goal
  INSERT INTO public.monthly_goals (id, user_id, month, year, target_value) VALUES
  (gen_random_uuid(), admin_id, extract(month from now())::integer, extract(year from now())::integer, 50000);

  -- Insert Products
  INSERT INTO public.products (id, user_id, name, price, is_default) VALUES
  (gen_random_uuid(), admin_id, 'MacBook Pro 16"', 12000, true),
  (gen_random_uuid(), admin_id, 'iPhone 15 Pro', 8000, true),
  (gen_random_uuid(), admin_id, 'AirPods Pro', 2000, true);

  -- Insert Sales (spread across recent days to populate chart)
  INSERT INTO public.sales (id, user_id, product_name, sale_value, quantity, sale_date) VALUES
  (gen_random_uuid(), admin_id, 'MacBook Pro 16"', 12000, 1, CURRENT_DATE),
  (gen_random_uuid(), admin_id, 'iPhone 15 Pro', 8000, 1, CURRENT_DATE),
  (gen_random_uuid(), admin_id, 'AirPods Pro', 2000, 1, CURRENT_DATE - interval '1 day'),
  (gen_random_uuid(), admin_id, 'MacBook Pro 16"', 24000, 2, CURRENT_DATE - interval '3 days'),
  (gen_random_uuid(), admin_id, 'iPhone 15 Pro', 8000, 1, CURRENT_DATE - interval '5 days'),
  (gen_random_uuid(), admin_id, 'iPad Air', 4500, 1, CURRENT_DATE - interval '7 days'),
  (gen_random_uuid(), admin_id, 'Apple Watch', 1500, 1, CURRENT_DATE - interval '10 days'),
  (gen_random_uuid(), admin_id, 'MacBook Pro 16"', 12000, 1, CURRENT_DATE - interval '14 days');
END $$;
