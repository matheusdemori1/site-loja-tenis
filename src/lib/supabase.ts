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

// Função para obter o cliente Supabase
export const getSupabase = () => {
  if (!isClient()) {
    return null
  }
  
  // Se já temos cliente, retorna ele
  if (supabaseClient) {
    return supabaseClient
  }

  // Tenta criar cliente real
  try {
    const config = getSupabaseConfig()
    
    if (!config.url || !config.key) {
      console.warn('Supabase não configurado - variáveis de ambiente não encontradas')
      return null
    }

    supabaseClient = createClient(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
    
    return supabaseClient
  } catch (error) {
    console.error('Erro ao criar cliente Supabase:', error)
    return null
  }
}

// Cliente Supabase principal
export const supabase = getSupabase()

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