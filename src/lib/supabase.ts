import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not configured')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Função helper para operações do Supabase com tratamento de erro
export async function executeSupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        data: null,
        error: { message: 'Supabase não configurado. Configure as variáveis de ambiente.' }
      }
    }
    
    const result = await operation()
    return result
  } catch (error) {
    console.error('Erro na operação Supabase:', error)
    return {
      data: null,
      error: { message: 'Erro de conexão com o banco de dados' }
    }
  }
}

// Tipos para o banco de dados
export interface Product {
  id: string
  name: string
  description: string
  image_url: string
  brand: string
  category: string
  colors: string[]
  color_images?: { [key: string]: string }
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface HeroSlide {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  order_index: number
  is_active: boolean
  created_at: string
}