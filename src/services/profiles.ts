import { supabase } from '@/lib/supabase/client'

export const getProfile = async (userId: string) => {
  return await supabase.from('profiles').select('*').eq('id', userId).single()
}

export const updateProfile = async (
  userId: string,
  data: { first_name?: string; last_name?: string },
) => {
  return await supabase
    .from('profiles')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
}
