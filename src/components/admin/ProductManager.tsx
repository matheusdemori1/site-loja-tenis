'use client'

import { useState, useEffect } from 'react'
import { getSupabase, isSupabaseConfigured, executeSupabaseOperation, Product, Brand, Category } from '@/lib/supabase'
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
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    brand: '',
    category: ''
  })
  const [colors, setColors] = useState<string[]>([])
  const [colorImages, setColorImages] = useState<{ [key: string]: string }>({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Categorias e marcas padrão
  const defaultCategories = ['running', 'casual', 'lifestyle', 'basketball']
  const defaultBrands = ['Nike', 'Adidas', 'Puma', 'New Balance']

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const result = await executeSupabaseOperation(
        () => getSupabase().from('products').select('*').order('created_at', { ascending: false }),
        []
      )

      setProducts(result.data || [])
      setError('')
    } catch (error: any) {
      console.error('Erro ao carregar produtos:', error)
      setError('Erro ao carregar produtos: ' + error.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        image_url: formData.image_url,
        brand: formData.brand,
        category: formData.category,
        colors: colors,
        color_images: colorImages
      }

      if (editingProduct) {
        // Atualizar produto existente
        await executeSupabaseOperation(
          () => getSupabase().from('products').update(productData).eq('id', editingProduct.id),
          null
        )
      } else {
        // Criar novo produto
        await executeSupabaseOperation(
          () => getSupabase().from('products').insert([productData]),
          null
        )
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
      await executeSupabaseOperation(
        () => getSupabase().from('products').delete().eq('id', id),
        null
      )

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
      image_url: product.image_url,
      brand: product.brand,
      category: product.category
    })
    setColors(product.colors || [])
    setColorImages(product.color_images || {})
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      image_url: '',
      brand: '',
      category: ''
    })
    setColors([])
    setColorImages({})
    setError('')
  }

  const addColor = () => {
    const newColor = `Cor ${colors.length + 1}`
    setColors([...colors, newColor])
  }

  const updateColor = (index: number, value: string) => {
    const newColors = [...colors]
    const oldColor = newColors[index]
    newColors[index] = value
    setColors(newColors)

    // Atualizar color_images se necessário
    if (oldColor !== value && colorImages[oldColor]) {
      const newColorImages = { ...colorImages }
      newColorImages[value] = newColorImages[oldColor]
      delete newColorImages[oldColor]
      setColorImages(newColorImages)
    }
  }

  const updateColorImage = (color: string, imageUrl: string) => {
    setColorImages(prev => ({
      ...prev,
      [color]: imageUrl
    }))
  }

  const removeColor = (index: number) => {
    const colorToRemove = colors[index]
    setColors(colors.filter((_, i) => i !== index))
    
    // Remover imagem da cor também
    const newColorImages = { ...colorImages }
    delete newColorImages[colorToRemove]
    setColorImages(newColorImages)
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
                    <Label htmlFor="description" className="text-gray-300">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição do produto"
                      className="bg-black/20 border-red-500/30 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url" className="text-gray-300">URL da Imagem Principal</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="bg-black/20 border-red-500/30 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand" className="text-gray-300">Marca</Label>
                      <Select value={formData.brand} onValueChange={(value) => setFormData({ ...formData, brand: value })}>
                        <SelectTrigger className="bg-black/20 border-red-500/30 text-white">
                          <SelectValue placeholder="Selecione uma marca" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-red-500/30">
                          {defaultBrands.map((brand) => (
                            <SelectItem key={brand} value={brand} className="text-white hover:bg-red-500/20">
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-gray-300">Categoria</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger className="bg-black/20 border-red-500/30 text-white">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-red-500/30">
                          {defaultCategories.map((category) => (
                            <SelectItem key={category} value={category} className="text-white hover:bg-red-500/20">
                              {category.charAt(0).toUpperCase() + category.slice(1)}
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
                          value={color}
                          onChange={(e) => updateColor(index, e.target.value)}
                          placeholder="Nome da cor"
                          className="bg-black/20 border-red-500/30 text-white placeholder-gray-400"
                        />
                        <div className="flex space-x-2">
                          <Input
                            value={colorImages[color] || ''}
                            onChange={(e) => updateColorImage(color, e.target.value)}
                            placeholder="URL da imagem desta cor"
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
                          <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                            {product.brand}
                          </Badge>
                          <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                            {product.category}
                          </Badge>
                        </div>
                        {product.colors && product.colors.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-gray-400 text-sm">Cores:</span>
                            {product.colors.map((color, index) => (
                              <Badge key={index} variant="outline" className="border-orange-500/50 text-orange-300">
                                {color}
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