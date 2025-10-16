import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logs para verificar se as variáveis estão sendo carregadas
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseAnonKey ? "✅ Configurada" : "❌ Não configurada");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas')
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey || '',
      'Authorization': `Bearer ${supabaseAnonKey || ''}`,
    },
  },
})

// Função helper para operações do Supabase com tratamento de erro melhorado
export async function executeSupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        data: null,
        error: { 
          message: 'Supabase não configurado. Clique no banner laranja acima para configurar as variáveis de ambiente.',
          code: 'SUPABASE_NOT_CONFIGURED'
        }
      }
    }
    
    const result = await operation()
    
    // Log detalhado para debug
    if (result.error) {
      console.error('❌ Erro na operação Supabase:', {
        message: result.error.message,
        code: result.error.code,
        details: result.error.details,
        hint: result.error.hint
      })
    } else {
      console.log('✅ Operação Supabase bem-sucedida')
    }
    
    return result
  } catch (error: any) {
    console.error('❌ Erro crítico na operação Supabase:', error)
    return {
      data: null,
      error: { 
        message: error.message || 'Erro de conexão com o banco de dados',
        code: 'CONNECTION_ERROR'
      }
    }
  }
}

// Função para verificar se as tabelas existem
export async function checkTablesExist(): Promise<{
  products: boolean;
  categories: boolean;
  brands: boolean;
  hero_slides: boolean;
  allExist: boolean;
}> {
  const results = {
    products: false,
    categories: false,
    brands: false,
    hero_slides: false,
    allExist: false
  }

  try {
    // Verificar cada tabela individualmente
    const checks = [
      { name: 'products', key: 'products' as keyof typeof results },
      { name: 'categories', key: 'categories' as keyof typeof results },
      { name: 'brands', key: 'brands' as keyof typeof results },
      { name: 'hero_slides', key: 'hero_slides' as keyof typeof results }
    ]

    for (const check of checks) {
      try {
        const { error } = await supabase
          .from(check.name)
          .select('count', { count: 'exact', head: true })
          .limit(1)

        if (!error) {
          results[check.key] = true
          console.log(`✅ Tabela ${check.name} existe`)
        } else {
          console.warn(`❌ Tabela ${check.name} não existe:`, error.message)
        }
      } catch (err) {
        console.warn(`❌ Erro ao verificar tabela ${check.name}:`, err)
      }
    }

    results.allExist = results.products && results.categories && results.brands && results.hero_slides
    
    console.log('📊 Status das tabelas:', results)
    return results
  } catch (error) {
    console.error('❌ Erro geral ao verificar tabelas:', error)
    return results
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
  updated_at?: string
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