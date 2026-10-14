-- Migration: Add role column to profiles and create user jose.neto@adapta.org
-- Role: admin, Name: Pádua Neto, Password: padua12345

-- 1. Add role column to public.profiles if it does not already exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- 2. Create the user in auth.users and configure profile
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'jose.neto@adapta.org';

  IF target_user_id IS NULL THEN
    target_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      phone,
      phone_change,
      phone_change_token,
      reauthentication_token
    ) VALUES (
      target_user_id,
      '00000000-0000-0000-0000-000000000000',
      'jose.neto@adapta.org',
      crypt('padua12345', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"first_name": "Pádua", "last_name": "Neto", "role": "admin"}'::jsonb,
      false,
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      '',
      '',
      NULL,
      '',
      '',
      ''
    );
  ELSE
    -- If user already exists, update password and metadata
    UPDATE auth.users
    SET
      encrypted_password = crypt('padua12345', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      raw_user_meta_data = '{"first_name": "Pádua", "last_name": "Neto", "role": "admin"}'::jsonb,
      updated_at = NOW()
    WHERE id = target_user_id;
  END IF;

  -- Ensure profile row exists and has first_name, last_name, role
  INSERT INTO public.profiles (id, first_name, last_name, role, updated_at)
  VALUES (target_user_id, 'Pádua', 'Neto', 'admin', NOW())
  ON CONFLICT (id) DO UPDATE
  SET
    first_name = 'Pádua',
    last_name = 'Neto',
    role = 'admin',
    updated_at = NOW();

END $$;
