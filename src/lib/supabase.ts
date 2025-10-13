import { createClient } from '@supabase/supabase-js'

// Função para verificar se estamos no cliente
export const isClient = () => typeof window !== 'undefined'

// Configuração segura do Supabase - só acessa no cliente
const getSupabaseConfig = () => {
  if (!isClient()) {
    return { url: '', key: '' }
  }
  
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  }
}

// Cliente Supabase com inicialização lazy
let supabaseClient: any = null

export const supabase = (() => {
  // Mock para SSR
  const mockClient = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
      order: () => Promise.resolve({ data: [], error: null })
    }),
    auth: {
      signIn: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ data: null, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: null })
    }
  }

  // Se não estamos no cliente, retorna mock
  if (!isClient()) {
    return mockClient
  }

  // Se já temos cliente, retorna ele
  if (supabaseClient) {
    return supabaseClient
  }

  // Tenta criar cliente real
  try {
    const config = getSupabaseConfig()
    
    if (!config.url || !config.key) {
      console.warn('Supabase não configurado - usando mock')
      return mockClient
    }

    supabaseClient = createClient(config.url, config.key)
    return supabaseClient
  } catch (error) {
    console.error('Erro ao criar cliente Supabase:', error)
    return mockClient
  }
})()

// Função para obter o cliente Supabase (compatibilidade com código existente)
export const getSupabase = () => {
  if (!isClient()) {
    return supabase
  }
  
  // Se não temos cliente ainda, tenta criar
  if (!supabaseClient) {
    try {
      const config = getSupabaseConfig()
      
      if (config.url && config.key) {
        supabaseClient = createClient(config.url, config.key)
      }
    } catch (error) {
      console.error('Erro ao inicializar Supabase:', error)
    }
  }
  
  return supabaseClient || supabase
}

// Função helper para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  if (!isClient()) {
    return false
  }
  
  const config = getSupabaseConfig()
  return !!(config.url && config.key)
}

// Tipos do banco de dados
export interface Brand {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

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
}

export interface ProductColor {
  id: string
  product_id: string
  color_name: string
  image_url: string
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

// Configurações do WhatsApp
export const WHATSAPP_NUMBER = "5518981100463" // Número do WhatsApp