'use client'

import { useState, useEffect } from 'react'
import { getSupabase, isSupabaseConfigured, Product, Brand, Category, ProductColor } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Package, 
  Tag, 
  Layers, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2,
  ShoppingBag,
  TrendingUp,
  Users,
  DollarSign,
  Image,
  Database,
  AlertCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import ProductManager from '@/components/admin/ProductManager'
import BrandManager from '@/components/admin/BrandManager'
import CategoryManager from '@/components/admin/CategoryManager'
import HeroSlideManager from '@/components/admin/HeroSlideManager'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBrands: 0,
    totalCategories: 0,
    totalSlides: 0
  })
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [supabaseError, setSupabaseError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Aguardar hidratação do cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    let isMounted = true
    
    const initializeAuth = async () => {
      try {
        // Aguardar um pouco para garantir que as variáveis de ambiente estejam disponíveis
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Verificar se o Supabase está configurado
        if (!isSupabaseConfigured()) {
          if (isMounted) {
            // Se Supabase não está configurado, permitir acesso direto
            setUser({ email: 'admin@novita.com' })
            setAuthChecked(true)
            setSupabaseError(true)
            setLoading(false)
          }
          return
        }

        const supabase = getSupabase()
        if (!supabase) {
          if (isMounted) {
            // Fallback para acesso direto
            setUser({ email: 'admin@novita.com' })
            setAuthChecked(true)
            setSupabaseError(true)
            setLoading(false)
          }
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (!session) {
          // Se não há sessão mas Supabase está configurado, redirecionar para login
          router.push('/admin')
          return
        }
        
        setUser(session.user)
        setAuthChecked(true)
        
        // Carregar stats apenas se autenticado
        await loadStats()
      } catch (error) {
        console.error('Erro na autenticação:', error)
        if (isMounted) {
          // Em caso de erro, permitir acesso direto
          setUser({ email: 'admin@novita.com' })
          setAuthChecked(true)
          setSupabaseError(true)
          setLoading(false)
        }
      }
    }

    initializeAuth()
    
    return () => {
      isMounted = false
    }
  }, [router, mounted])

  const loadStats = async () => {
    try {
      if (!isSupabaseConfigured()) {
        setSupabaseError(true)
        return
      }

      const supabase = getSupabase()
      if (!supabase) {
        setSupabaseError(true)
        return
      }

      // Usar Promise.all com timeout para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )

      const statsPromise = Promise.all([
        executeSupabaseOperation(
          () => supabase.from('products').select('*', { count: 'exact', head: true }),
          { count: 0 }
        ),
        executeSupabaseOperation(
          () => supabase.from('brands').select('*', { count: 'exact', head: true }),
          { count: 0 }
        ),
        executeSupabaseOperation(
          () => supabase.from('categories').select('*', { count: 'exact', head: true }),
          { count: 0 }
        ),
        executeSupabaseOperation(
          () => supabase.from('hero_slides').select('*', { count: 'exact', head: true }),
          { count: 0 }
        )
      ])

      const results = await Promise.race([statsPromise, timeoutPromise]) as any[]
      
      const [productsResult, brandsResult, categoriesResult, slidesResult] = results

      setStats({
        totalProducts: productsResult?.count || 0,
        totalBrands: brandsResult?.count || 0,
        totalCategories: categoriesResult?.count || 0,
        totalSlides: slidesResult?.count || 0
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      // Manter stats zerados em caso de erro
      setStats({
        totalProducts: 0,
        totalBrands: 0,
        totalCategories: 0,
        totalSlides: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabase()
        if (supabase) {
          await supabase.auth.signOut()
        }
      }
      router.push('/admin')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      // Forçar redirecionamento mesmo com erro
      router.push('/admin')
    }
  }

  // Não renderizar nada até a hidratação
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Carregando...</p>
        </div>
      </div>
    )
  }

  // Mostrar loading apenas se ainda não verificou auth
  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  // Se não há usuário após verificação, não renderizar nada (redirecionamento em andamento)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-orange-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-red-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Painel Administrativo</h1>
              <p className="text-gray-300">Novita - Gestão Completa</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                Olá, {user?.email || 'Admin'}
              </span>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="border-red-500/30 text-gray-300 hover:bg-red-500/10 bg-black/20 backdrop-blur-sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Alerta sobre Supabase */}
        {supabaseError && (
          <Alert className="border-orange-500/50 bg-orange-500/10 mb-8">
            <Database className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-300">
              <strong>Modo Local:</strong> Configure sua integração Supabase para salvar dados permanentemente no banco. 
              Atualmente os dados são salvos localmente e serão perdidos ao recarregar a página.
            </AlertDescription>
          </Alert>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/30 backdrop-blur-md border-red-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total de Produtos
              </CardTitle>
              <Package className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 backdrop-blur-md border-red-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Marcas
              </CardTitle>
              <Tag className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalBrands}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 backdrop-blur-md border-red-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Categorias
              </CardTitle>
              <Layers className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalCategories}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 backdrop-blur-md border-red-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Slides do Carousel
              </CardTitle>
              <Image className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalSlides}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Gerenciamento */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/30 backdrop-blur-md border border-red-500/20">
            <TabsTrigger value="products" className="data-[state=active]:bg-red-500/20 text-gray-300 data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="slides" className="data-[state=active]:bg-red-500/20 text-gray-300 data-[state=active]:text-white">
              <Image className="w-4 h-4 mr-2" />
              Carousel
            </TabsTrigger>
            <TabsTrigger value="brands" className="data-[state=active]:bg-red-500/20 text-gray-300 data-[state=active]:text-white">
              <Tag className="w-4 h-4 mr-2" />
              Marcas
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-red-500/20 text-gray-300 data-[state=active]:text-white">
              <Layers className="w-4 h-4 mr-2" />
              Categorias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductManager onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="slides">
            <HeroSlideManager onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="brands">
            <BrandManager onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager onStatsUpdate={loadStats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}