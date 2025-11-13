import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ymihlmgnwmmbjlyaxzii.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltaWhsbWdud21tYmpseWF4emlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTYwNzIsImV4cCI6MjA3ODU5MjA3Mn0.VMx0dnqSisFUItjJEhvimxo-Fgq_Rw46O6TMcC0kpFU'

export const supabase = createClient(supabaseUrl, supabaseKey)

export const STORAGE_BUCKET = 'profile-images'
