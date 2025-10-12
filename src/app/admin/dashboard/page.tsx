'use client'

import { useState, useEffect } from 'react'
import { supabase, Product, Brand, Category, ProductColor } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
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
  Image
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import ProductManager from '@/components/admin/ProductManager'
import BrandManager from '@/components/admin/BrandManager'
import CategoryManager from '@/components/admin/CategoryManager'
import HeroSlideManager from '@/components/admin/HeroSlideManager'

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
  const router = useRouter()

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return;
        
        if (!session) {
          router.push('/admin')
          return;
        }
        
        setUser(session.user)
        setAuthChecked(true)
        
        // Carregar stats apenas se autenticado
        await loadStats()
      } catch (error) {
        console.error('Erro na autenticação:', error)
        if (mounted) {
          router.push('/admin')
        }
      }
    }

    initializeAuth()
    
    return () => {
      mounted = false;
    }
  }, [router])

  const loadStats = async () => {
    try {
      // Usar Promise.all com timeout para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const statsPromise = Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('brands').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('hero_slides').select('*', { count: 'exact', head: true })
      ]);

      const results = await Promise.race([statsPromise, timeoutPromise]) as any[];
      
      const [productsResult, brandsResult, categoriesResult, slidesResult] = results;

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
      await supabase.auth.signOut()
      router.push('/admin')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      // Forçar redirecionamento mesmo com erro
      router.push('/admin')
    }
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
    return null;
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
                Olá, {user?.email}
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