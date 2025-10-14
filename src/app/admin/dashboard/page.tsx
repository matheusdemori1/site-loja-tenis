'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  LogOut, 
  Package, 
  Tag, 
  Layers, 
  Image as ImageIcon,
  AlertCircle,
  Database,
  BarChart3
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase, type Product, type Category, type Brand, type HeroSlide } from '@/lib/supabase'

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'brands' | 'slides'>('products')
  
  // Data states
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const router = useRouter()

  // Aguardar hidratação do cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          console.log('❌ Usuário não autenticado, redirecionando...')
          router.push('/admin')
          return
        }

        setUser(session.user)
        await loadAllData()
        setLoading(false)
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        setError('Erro ao verificar autenticação')
        setLoading(false)
      }
    }

    checkAuth()
  }, [mounted, router])

  const loadAllData = async () => {
    try {
      // Carregar produtos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (productsError) {
        console.warn('Erro ao carregar produtos:', productsError)
        setProducts([])
      } else {
        setProducts(productsData || [])
      }

      // Carregar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (categoriesError) {
        console.warn('Erro ao carregar categorias:', categoriesError)
        setCategories([])
      } else {
        setCategories(categoriesData || [])
      }

      // Carregar marcas
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .order('name')

      if (brandsError) {
        console.warn('Erro ao carregar marcas:', brandsError)
        setBrands([])
      } else {
        setBrands(brandsData || [])
      }

      // Carregar slides
      const { data: slidesData, error: slidesError } = await supabase
        .from('hero_slides')
        .select('*')
        .order('order_index')

      if (slidesError) {
        console.warn('Erro ao carregar slides:', slidesError)
        setHeroSlides([])
      } else {
        setHeroSlides(slidesData || [])
      }

      console.log('✅ Todos os dados carregados com sucesso')
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setError('Erro ao carregar dados do banco')
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      console.log('✅ Logout realizado com sucesso')
      router.push('/')
    } catch (error) {
      console.warn('⚠️ Erro no logout, mas continuando:', error)
      router.push('/')
    }
  }

  const handleSaveItem = async (item: any) => {
    try {
      setError('')
      setSuccess('')

      if (activeTab === 'products') {
        // Processar cores se for string
        if (item.colors && typeof item.colors === 'string') {
          item.colors = item.colors.split(',').map((c: string) => c.trim()).filter(Boolean)
        }

        if (editingItem?.id) {
          // Atualizar produto existente
          const { error } = await supabase
            .from('products')
            .update({
              name: item.name,
              description: item.description,
              image_url: item.image_url,
              brand: item.brand,
              category: item.category,
              colors: item.colors || [],
              updated_at: new Date().toISOString()
            })
            .eq('id', editingItem.id)

          if (error) throw error
          
          setProducts(prev => prev.map(p => 
            p.id === editingItem.id 
              ? { ...p, ...item, colors: item.colors || [] }
              : p
          ))
        } else {
          // Criar novo produto
          const { data, error } = await supabase
            .from('products')
            .insert([{
              name: item.name,
              description: item.description,
              image_url: item.image_url,
              brand: item.brand,
              category: item.category,
              colors: item.colors || []
            }])
            .select()

          if (error) throw error
          if (data) setProducts(prev => [data[0], ...prev])
        }
      } else if (activeTab === 'categories') {
        const slug = item.slug || item.name.toLowerCase().replace(/\s+/g, '-')
        
        if (editingItem?.id) {
          const { error } = await supabase
            .from('categories')
            .update({ name: item.name, slug })
            .eq('id', editingItem.id)

          if (error) throw error
          
          setCategories(prev => prev.map(c => 
            c.id === editingItem.id ? { ...c, name: item.name, slug } : c
          ))
        } else {
          const { data, error } = await supabase
            .from('categories')
            .insert([{ name: item.name, slug }])
            .select()

          if (error) throw error
          if (data) setCategories(prev => [...prev, data[0]])
        }
      } else if (activeTab === 'brands') {
        const slug = item.slug || item.name.toLowerCase().replace(/\s+/g, '-')
        
        if (editingItem?.id) {
          const { error } = await supabase
            .from('brands')
            .update({ name: item.name, slug })
            .eq('id', editingItem.id)

          if (error) throw error
          
          setBrands(prev => prev.map(b => 
            b.id === editingItem.id ? { ...b, name: item.name, slug } : b
          ))
        } else {
          const { data, error } = await supabase
            .from('brands')
            .insert([{ name: item.name, slug }])
            .select()

          if (error) throw error
          if (data) setBrands(prev => [...prev, data[0]])
        }
      } else if (activeTab === 'slides') {
        if (editingItem?.id) {
          const { error } = await supabase
            .from('hero_slides')
            .update({
              title: item.title,
              subtitle: item.subtitle,
              description: item.description,
              image: item.image,
              order_index: item.order_index || 1,
              is_active: item.is_active !== false
            })
            .eq('id', editingItem.id)

          if (error) throw error
          
          setHeroSlides(prev => prev.map(s => 
            s.id === editingItem.id ? { ...s, ...item } : s
          ))
        } else {
          const { data, error } = await supabase
            .from('hero_slides')
            .insert([{
              title: item.title,
              subtitle: item.subtitle,
              description: item.description,
              image: item.image,
              order_index: item.order_index || 1,
              is_active: item.is_active !== false
            }])
            .select()

          if (error) throw error
          if (data) setHeroSlides(prev => [...prev, data[0]])
        }
      }

      setEditingItem(null)
      setShowAddForm(false)
      setSuccess('Item salvo com sucesso!')
      
      console.log('✅ Item salvo com sucesso no Supabase')
    } catch (error: any) {
      console.error('Erro ao salvar item:', error)
      setError('Erro ao salvar item: ' + error.message)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return

    try {
      setError('')
      setSuccess('')

      if (activeTab === 'products') {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id)

        if (error) throw error
        setProducts(prev => prev.filter(p => p.id !== id))
      } else if (activeTab === 'categories') {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id)

        if (error) throw error
        setCategories(prev => prev.filter(c => c.id !== id))
      } else if (activeTab === 'brands') {
        const { error } = await supabase
          .from('brands')
          .delete()
          .eq('id', id)

        if (error) throw error
        setBrands(prev => prev.filter(b => b.id !== id))
      } else if (activeTab === 'slides') {
        const { error } = await supabase
          .from('hero_slides')
          .delete()
          .eq('id', id)

        if (error) throw error
        setHeroSlides(prev => prev.filter(s => s.id !== id))
      }

      setSuccess('Item excluído com sucesso!')
      console.log('✅ Item excluído com sucesso do Supabase')
    } catch (error: any) {
      console.error('Erro ao excluir item:', error)
      setError('Erro ao excluir item: ' + error.message)
    }
  }

  // Não renderizar nada até a hidratação
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">
            {!mounted ? 'Carregando...' : 'Verificando autenticação...'}
          </p>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-orange-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/30 backdrop-blur-md border-red-500/20">
          <CardContent className="p-6">
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push('/')}
              className="w-full mt-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              Voltar ao Site
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tabs = [
    { id: 'products', label: 'Produtos', icon: Package, data: products },
    { id: 'categories', label: 'Categorias', icon: Layers, data: categories },
    { id: 'brands', label: 'Marcas', icon: Tag, data: brands },
    { id: 'slides', label: 'Slides Hero', icon: ImageIcon, data: heroSlides }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-orange-900">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-md border-b border-red-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                NOVITA Admin
              </h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">Painel Administrativo</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-300">
                Olá, <span className="text-red-400">{user?.email}</span>
              </div>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Ver Site
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/30 backdrop-blur-sm border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total de Produtos</p>
                  <p className="text-2xl font-bold text-white">{products.length}</p>
                </div>
                <Package className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/30 backdrop-blur-sm border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Categorias</p>
                  <p className="text-2xl font-bold text-white">{categories.length}</p>
                </div>
                <Layers className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/30 backdrop-blur-sm border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Marcas</p>
                  <p className="text-2xl font-bold text-white">{brands.length}</p>
                </div>
                <Tag className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/30 backdrop-blur-sm border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Slides Hero</p>
                  <p className="text-2xl font-bold text-white">{heroSlides.length}</p>
                </div>
                <ImageIcon className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="border-red-500/50 bg-red-500/10 mb-6">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500/50 bg-green-500/10 mb-6">
            <Database className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                    : 'bg-black/30 backdrop-blur-sm text-gray-300 hover:bg-black/50 border border-red-500/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {tab.data.length}
                </span>
              </button>
            )
          })}
        </div>

        {/* Content Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Gerenciar {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tabs.find(t => t.id === activeTab)?.data.map((item: any) => (
            <Card key={item.id} className="bg-black/30 backdrop-blur-sm border-red-500/20 hover:border-red-500/40 transition-all duration-300">
              <CardContent className="p-4">
                {(activeTab === 'products' || activeTab === 'slides') && (
                  <img
                    src={item.image_url || item.image}
                    alt={item.name || item.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-semibold text-white mb-2">
                  {item.name || item.title}
                </h3>
                {item.description && (
                  <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
                {item.brand && (
                  <p className="text-red-400 text-sm mb-2">Marca: {item.brand}</p>
                )}
                {item.slug && (
                  <p className="text-gray-400 text-xs mb-3">Slug: {item.slug}</p>
                )}
                {item.subtitle && (
                  <p className="text-orange-400 text-sm mb-2">{item.subtitle}</p>
                )}
                {item.colors && item.colors.length > 0 && (
                  <p className="text-gray-400 text-xs mb-3">
                    Cores: {Array.isArray(item.colors) ? item.colors.join(', ') : item.colors}
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => setEditingItem(item)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDeleteItem(item.id)}
                    size="sm"
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tabs.find(t => t.id === activeTab)?.data.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-12 border border-red-500/20">
              <p className="text-gray-400 text-xl mb-4">
                Nenhum item encontrado
              </p>
              <p className="text-gray-500 mb-6">
                Comece adicionando o primeiro item
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Item
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingItem) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingItem ? 'Editar' : 'Adicionar'} {
                    activeTab === 'products' ? 'Produto' :
                    activeTab === 'categories' ? 'Categoria' :
                    activeTab === 'brands' ? 'Marca' : 'Slide'
                  }
                </h3>
                <button
                  onClick={() => {
                    setEditingItem(null)
                    setShowAddForm(false)
                    setError('')
                    setSuccess('')
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <AdminForm
                type={activeTab}
                item={editingItem}
                onSave={handleSaveItem}
                onCancel={() => {
                  setEditingItem(null)
                  setShowAddForm(false)
                  setError('')
                  setSuccess('')
                }}
                categories={categories}
                brands={brands}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente de formulário admin
function AdminForm({ 
  type, 
  item, 
  onSave, 
  onCancel, 
  categories, 
  brands 
}: { 
  type: string
  item: any
  onSave: (item: any) => void
  onCancel: () => void
  categories: Category[]
  brands: Brand[]
}) {
  const [formData, setFormData] = useState(item || {})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações básicas
    if (type === 'products') {
      if (!formData.name || !formData.brand || !formData.category || !formData.image_url) {
        alert('Preencha todos os campos obrigatórios')
        return
      }
    } else if (type === 'categories' || type === 'brands') {
      if (!formData.name) {
        alert('Nome é obrigatório')
        return
      }
      if (!formData.slug) {
        formData.slug = formData.name.toLowerCase().replace(/\s+/g, '-')
      }
    } else if (type === 'slides') {
      if (!formData.title || !formData.subtitle || !formData.image) {
        alert('Preencha todos os campos obrigatórios')
        return
      }
    }

    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === 'products' && (
        <>
          <div>
            <Label className="text-gray-300">Nome *</Label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-black/30 border-red-500/30 text-white"
              required
            />
          </div>
          <div>
            <Label className="text-gray-300">Descrição</Label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-black/30 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              rows={3}
            />
          </div>
          <div>
            <Label className="text-gray-300">URL da Imagem *</Label>
            <Input
              type="url"
              value={formData.image_url || ''}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="bg-black/30 border-red-500/30 text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Marca *</Label>
              <select
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-black/30 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                required
              >
                <option value="">Selecione uma marca</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.name}>{brand.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-gray-300">Categoria *</Label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-black/30 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label className="text-gray-300">Cores (separadas por vírgula)</Label>
            <Input
              value={Array.isArray(formData.colors) ? formData.colors.join(', ') : formData.colors || ''}
              onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
              className="bg-black/30 border-red-500/30 text-white"
              placeholder="Ex: Preto, Branco, Vermelho"
            />
          </div>
        </>
      )}

      {(type === 'categories' || type === 'brands') && (
        <>
          <div>
            <Label className="text-gray-300">Nome *</Label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-black/30 border-red-500/30 text-white"
              required
            />
          </div>
          <div>
            <Label className="text-gray-300">Slug</Label>
            <Input
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="bg-black/30 border-red-500/30 text-white"
              placeholder="Será gerado automaticamente se vazio"
            />
          </div>
        </>
      )}

      {type === 'slides' && (
        <>
          <div>
            <Label className="text-gray-300">Título *</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-black/30 border-red-500/30 text-white"
              required
            />
          </div>
          <div>
            <Label className="text-gray-300">Subtítulo *</Label>
            <Input
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="bg-black/30 border-red-500/30 text-white"
              required
            />
          </div>
          <div>
            <Label className="text-gray-300">Descrição</Label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-black/30 border border-red-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              rows={3}
            />
          </div>
          <div>
            <Label className="text-gray-300">URL da Imagem *</Label>
            <Input
              type="url"
              value={formData.image || ''}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="bg-black/30 border-red-500/30 text-white"
              required
            />
          </div>
          <div>
            <Label className="text-gray-300">Ordem</Label>
            <Input
              type="number"
              value={formData.order_index || 1}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
              className="bg-black/30 border-red-500/30 text-white"
              min="1"
            />
          </div>
        </>
      )}

      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}