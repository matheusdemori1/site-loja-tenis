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

// Cliente Supabase com inicialização lazy e tratamento de erros robusto
let supabaseClient: any = null
let initializationAttempted = false

export const supabase = (() => {
  // Mock para SSR e fallback
  const mockClient = {
    from: (table: string) => ({
      select: (columns?: string, options?: any) => Promise.resolve({ data: [], error: null }),
      insert: (data: any) => Promise.resolve({ data: [], error: null }),
      update: (data: any) => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
      order: (column: string, options?: any) => Promise.resolve({ data: [], error: null }),
      eq: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      neq: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      gt: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      gte: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      lt: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      lte: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      like: (column: string, pattern: string) => Promise.resolve({ data: [], error: null }),
      ilike: (column: string, pattern: string) => Promise.resolve({ data: [], error: null }),
      is: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      in: (column: string, values: any[]) => Promise.resolve({ data: [], error: null }),
      contains: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      containedBy: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      rangeGt: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      rangeGte: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      rangeLt: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      rangeLte: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      rangeAdjacent: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      overlaps: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      textSearch: (column: string, query: string, options?: any) => Promise.resolve({ data: [], error: null }),
      match: (query: any) => Promise.resolve({ data: [], error: null }),
      not: (column: string, operator: string, value: any) => Promise.resolve({ data: [], error: null }),
      or: (filters: string) => Promise.resolve({ data: [], error: null }),
      filter: (column: string, operator: string, value: any) => Promise.resolve({ data: [], error: null }),
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      csv: () => Promise.resolve({ data: '', error: null }),
      geojson: () => Promise.resolve({ data: null, error: null }),
      explain: (options?: any) => Promise.resolve({ data: null, error: null }),
      rollback: () => Promise.resolve({ data: null, error: null }),
      returns: () => Promise.resolve({ data: [], error: null })
    }),
    auth: {
      signIn: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ data: null, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signUp: () => Promise.resolve({ data: null, error: null }),
      resetPasswordForEmail: () => Promise.resolve({ data: null, error: null }),
      updateUser: () => Promise.resolve({ data: null, error: null }),
      refreshSession: () => Promise.resolve({ data: null, error: null }),
      setSession: () => Promise.resolve({ data: null, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null })
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

  // Se já tentamos inicializar e falhou, retorna mock
  if (initializationAttempted && !supabaseClient) {
    console.warn('Supabase inicialização falhou anteriormente - usando mock')
    return mockClient
  }

  // Tenta criar cliente real
  try {
    initializationAttempted = true
    const config = getSupabaseConfig()
    
    if (!config.url || !config.key) {
      console.warn('Supabase não configurado - usando mock')
      return mockClient
    }

    // Validar formato das URLs e chaves
    if (!config.url.startsWith('https://') || !config.key.startsWith('eyJ')) {
      console.warn('Configurações Supabase inválidas - usando mock')
      return mockClient
    }

    supabaseClient = createClient(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'X-Client-Info': 'novita-store'
        }
      },
      realtime: {
        params: {
          eventsPerSecond: 2
        }
      }
    })
    
    console.log('Supabase cliente inicializado com sucesso')
    return supabaseClient
  } catch (error) {
    console.error('Erro ao criar cliente Supabase:', error)
    supabaseClient = null
    return mockClient
  }
})()

// Função para obter o cliente Supabase com retry
export const getSupabase = () => {
  if (!isClient()) {
    return supabase
  }
  
  // Se não temos cliente ainda, tenta criar com retry
  if (!supabaseClient && !initializationAttempted) {
    try {
      const config = getSupabaseConfig()
      
      if (config.url && config.key && config.url.startsWith('https://') && config.key.startsWith('eyJ')) {
        supabaseClient = createClient(config.url, config.key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
            flowType: 'pkce'
          },
          global: {
            headers: {
              'X-Client-Info': 'novita-store'
            }
          }
        })
        console.log('Supabase cliente criado com sucesso no retry')
      }
    } catch (error) {
      console.error('Erro ao inicializar Supabase no retry:', error)
    }
    initializationAttempted = true
  }
  
  return supabaseClient || supabase
}

// Função helper para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  if (!isClient()) {
    return false
  }
  
  const config = getSupabaseConfig()
  return !!(config.url && config.key && config.url.startsWith('https://') && config.key.startsWith('eyJ'))
}

// Função para executar operações Supabase com fallback
export const executeSupabaseOperation = async (operation: () => Promise<any>, fallbackData: any = []) => {
  try {
    if (!isSupabaseConfigured()) {
      return { data: fallbackData, error: null, fromFallback: true }
    }

    const client = getSupabase()
    if (!client || !supabaseClient) {
      return { data: fallbackData, error: null, fromFallback: true }
    }

    // Timeout para evitar travamento
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timeout')), 5000)
    )

    const result = await Promise.race([operation(), timeoutPromise])
    return { ...result, fromFallback: false }
  } catch (error) {
    console.error('Erro na operação Supabase:', error)
    return { data: fallbackData, error: null, fromFallback: true }
  }
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