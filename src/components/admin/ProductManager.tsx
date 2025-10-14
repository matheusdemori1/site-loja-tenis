'use client'

import { useState, useEffect } from 'react'
import { getSupabase, isSupabaseConfigured, Product, Brand, Category, ProductColor } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package,
  AlertCircle,
  Database,
  Palette
} from 'lucide-react'

interface ProductManagerProps {
  onStatsUpdate?: () => void
}

export default function ProductManager({ onStatsUpdate }: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    brand_id: '',
    category_id: ''
  })
  const [colors, setColors] = useState<{ color_name: string; image_url: string }[]>([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const supabase = getSupabase()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        setError('Supabase não está configurado')
        setLoading(false)
        return
      }

      const [productsResult, brandsResult, categoriesResult] = await Promise.all([
        supabase
          .from('products')
          .select(`
            *,
            brand:brands(name),
            category:categories(name),
            colors:product_colors(*)
          `)
          .order('created_at', { ascending: false }),
        supabase.from('brands').select('*').order('name'),
        supabase.from('categories').select('*').order('name')
      ])

      if (productsResult.error) throw productsResult.error
      if (brandsResult.error) throw brandsResult.error
      if (categoriesResult.error) throw categoriesResult.error

      setProducts(productsResult.data || [])
      setBrands(brandsResult.data || [])
      setCategories(categoriesResult.data || [])
      setError('')
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      setError('Erro ao carregar dados: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase não está configurado')
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        brand_id: formData.brand_id,
        category_id: formData.category_id
      }

      let productId: string

      if (editingProduct) {
        // Atualizar produto existente
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (updateError) throw updateError
        productId = editingProduct.id

        // Remover cores antigas
        await supabase
          .from('product_colors')
          .delete()
          .eq('product_id', productId)
      } else {
        // Criar novo produto
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single()

        if (insertError) throw insertError
        productId = newProduct.id
      }

      // Adicionar cores
      if (colors.length > 0) {
        const colorData = colors.map(color => ({
          product_id: productId,
          color_name: color.color_name,
          image_url: color.image_url
        }))

        const { error: colorError } = await supabase
          .from('product_colors')
          .insert(colorData)

        if (colorError) throw colorError
      }

      await loadData()
      onStatsUpdate?.()
      setDialogOpen(false)
      resetForm()
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error)
      setError('Erro ao salvar produto: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase não está configurado')
      }

      // Remover cores primeiro
      await supabase
        .from('product_colors')
        .delete()
        .eq('product_id', id)

      // Remover produto
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      await loadData()
      onStatsUpdate?.()
    } catch (error: any) {
      console.error('Erro ao excluir produto:', error)
      setError('Erro ao excluir produto: ' + error.message)
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      brand_id: product.brand_id,
      category_id: product.category_id
    })
    setColors(product.colors?.map(c => ({ color_name: c.color_name, image_url: c.image_url })) || [])
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      brand_id: '',
      category_id: ''
    })
    setColors([])
    setError('')
  }

  const addColor = () => {
    setColors([...colors, { color_name: '', image_url: '' }])
  }

  const updateColor = (index: number, field: 'color_name' | 'image_url', value: string) => {
    const newColors = [...colors]
    newColors[index][field] = value
    setColors(newColors)
  }

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index))
  }

  if (!isSupabaseConfigured()) {
    return (
      <Card className="bg-black/30 backdrop-blur-md border-red-500/20">
        <CardContent className="p-6">
          <Alert className="border-orange-500/50 bg-orange-500/10">
            <Database className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-300">
              Configure sua integração Supabase nas configurações do projeto para gerenciar produtos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="bg-black/30 backdrop-blur-md border-red-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-3"></div>
            <span className="text-gray-300">Carregando produtos...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black/30 backdrop-blur-md border-red-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Package className="w-5 h-5 mr-2 text-red-400" />
              Gerenciar Produtos
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={resetForm}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/90 backdrop-blur-md border-red-500/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert className="border-red-500/50 bg-red-500/10">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-300">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">Nome</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nome do produto"
                        required
                        className="bg-black/20 border-red-500/30 text-white placeholder-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-gray-300">Preço</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        required
                        className="bg-black/20 border-red-500/30 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-300">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição do produto"
                      className="bg-black/20 border-red-500/30 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock" className="text-gray-300">Estoque</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        placeholder="0"
                        required
                        className="bg-black/20 border-red-500/30 text-white placeholder-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brand" className="text-gray-300">Marca</Label>
                      <Select value={formData.brand_id} onValueChange={(value) => setFormData({ ...formData, brand_id: value })}>
                        <SelectTrigger className="bg-black/20 border-red-500/30 text-white">
                          <SelectValue placeholder="Selecione uma marca" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-red-500/30">
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id} className="text-white hover:bg-red-500/20">
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-gray-300">Categoria</Label>
                      <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                        <SelectTrigger className="bg-black/20 border-red-500/30 text-white">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-red-500/30">
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id} className="text-white hover:bg-red-500/20">
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Cores do Produto</Label>
                      <Button
                        type="button"
                        onClick={addColor}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Palette className="w-4 h-4 mr-2" />
                        Adicionar Cor
                      </Button>
                    </div>

                    {colors.map((color, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2 p-3 bg-black/20 rounded-lg border border-red-500/20">
                        <Input
                          value={color.color_name}
                          onChange={(e) => updateColor(index, 'color_name', e.target.value)}
                          placeholder="Nome da cor"
                          className="bg-black/20 border-red-500/30 text-white placeholder-gray-400"
                        />
                        <div className="flex space-x-2">
                          <Input
                            value={color.image_url}
                            onChange={(e) => updateColor(index, 'image_url', e.target.value)}
                            placeholder="URL da imagem"
                            className="bg-black/20 border-red-500/30 text-white placeholder-gray-400"
                          />
                          <Button
                            type="button"
                            onClick={() => removeColor(index)}
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      className="border-gray-500 text-gray-300 hover:bg-gray-500/10"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                    >
                      {submitting ? 'Salvando...' : editingProduct ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10 mb-4">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum produto encontrado</p>
              <p className="text-gray-500 text-sm">Clique em "Novo Produto" para começar</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id} className="bg-black/20 border-red-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{product.name}</h3>
                        <p className="text-gray-400 text-sm">{product.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-green-400 font-semibold">
                            R$ {product.price.toFixed(2)}
                          </span>
                          <span className="text-gray-400 text-sm">
                            Estoque: {product.stock}
                          </span>
                          <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                            {product.brand?.name}
                          </Badge>
                          <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                            {product.category?.name}
                          </Badge>
                        </div>
                        {product.colors && product.colors.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-gray-400 text-sm">Cores:</span>
                            {product.colors.map((color, index) => (
                              <Badge key={index} variant="outline" className="border-orange-500/50 text-orange-300">
                                {color.color_name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(product)}
                          className="border-blue-500 text-blue-300 hover:bg-blue-500/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(product.id)}
                          className="border-red-500 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}