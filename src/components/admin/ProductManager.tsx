'use client'

import { useState, useEffect } from 'react'
import { supabase, Product, Brand, Category, ProductColor } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Package, Palette } from 'lucide-react'

interface ProductManagerProps {
  onStatsUpdate: () => void
}

export default function ProductManager({ onStatsUpdate }: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stock: '',
    brand_id: '',
    category_id: ''
  })
  const [colors, setColors] = useState<{ color_name: string; image_url: string }[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Carregar produtos
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(*),
          category:categories(*),
          colors:product_colors(*)
        `)
        .order('created_at', { ascending: false })

      // Carregar marcas
      const { data: brandsData } = await supabase
        .from('brands')
        .select('*')
        .order('name')

      // Carregar categorias
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      setProducts(productsData || [])
      setBrands(brandsData || [])
      setCategories(categoriesData || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      stock: '',
      brand_id: '',
      category_id: ''
    })
    setColors([])
    setEditingProduct(null)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      stock: product.stock.toString(),
      brand_id: product.brand_id,
      category_id: product.category_id
    })
    setColors(product.colors?.map(c => ({ color_name: c.color_name, image_url: c.image_url })) || [])
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: 0, // Preço sempre 0
        stock: parseInt(formData.stock),
        brand_id: formData.brand_id,
        category_id: formData.category_id
      }

      let productId: string

      if (editingProduct) {
        // Atualizar produto
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error
        productId = editingProduct.id

        // Deletar cores antigas
        await supabase
          .from('product_colors')
          .delete()
          .eq('product_id', productId)
      } else {
        // Criar novo produto
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        if (error) throw error
        productId = data.id
      }

      // Inserir cores
      if (colors.length > 0) {
        const colorsData = colors.map(color => ({
          product_id: productId,
          color_name: color.color_name,
          image_url: color.image_url
        }))

        const { error: colorsError } = await supabase
          .from('product_colors')
          .insert(colorsData)

        if (colorsError) throw colorsError
      }

      setIsDialogOpen(false)
      resetForm()
      loadData()
      onStatsUpdate()
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      loadData()
      onStatsUpdate()
    } catch (error) {
      console.error('Erro ao deletar produto:', error)
    }
  }

  const addColor = () => {
    setColors([...colors, { color_name: '', image_url: '' }])
  }

  const updateColor = (index: number, field: string, value: string) => {
    const newColors = [...colors]
    newColors[index] = { ...newColors[index], [field]: value }
    setColors(newColors)
  }

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index))
  }

  if (loading) {
    return <div className="text-white">Carregando produtos...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gerenciar Produtos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl bg-black/90 border-red-500/30 backdrop-blur-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-black/30 border-red-500/30 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-white">Estoque</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="bg-black/30 border-red-500/30 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-black/30 border-red-500/30 text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Marca</Label>
                  <Select value={formData.brand_id} onValueChange={(value) => setFormData({...formData, brand_id: value})}>
                    <SelectTrigger className="bg-black/30 border-red-500/30 text-white">
                      <SelectValue placeholder="Selecione uma marca" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-red-500/30">
                      {brands.map(brand => (
                        <SelectItem key={brand.id} value={brand.id} className="text-white hover:bg-red-500/20">
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Categoria</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                    <SelectTrigger className="bg-black/30 border-red-500/30 text-white">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-red-500/30">
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id} className="text-white hover:bg-red-500/20">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cores */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Cores e Imagens</Label>
                  <Button type="button" onClick={addColor} variant="outline" size="sm" className="border-red-500/30 text-gray-300 hover:bg-red-500/10">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Cor
                  </Button>
                </div>

                {colors.map((color, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-black/30 rounded-lg border border-red-500/20">
                    <div className="space-y-2">
                      <Label className="text-white">Nome da Cor</Label>
                      <Input
                        value={color.color_name}
                        onChange={(e) => updateColor(index, 'color_name', e.target.value)}
                        className="bg-black/30 border-red-500/30 text-white"
                        placeholder="Ex: Preto, Branco, Vermelho"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">URL da Imagem</Label>
                      <Input
                        value={color.image_url}
                        onChange={(e) => updateColor(index, 'image_url', e.target.value)}
                        className="bg-black/30 border-red-500/30 text-white"
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        onClick={() => removeColor(index)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="border-red-500/30 text-gray-300 hover:bg-red-500/10"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                  {editingProduct ? 'Atualizar' : 'Criar'} Produto
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map(product => (
          <Card key={product.id} className="bg-black/30 border-red-500/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white text-lg line-clamp-2">
                    {product.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
                      {product.brand?.name}
                    </Badge>
                    <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                      {product.category?.name}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleEdit(product)}
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-gray-300 hover:bg-red-500/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(product.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-400 text-sm line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Estoque: {product.stock}
                  </span>
                </div>

                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {product.colors.length} cor(es) disponível(is)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {product.colors.map(color => (
                        <Badge key={color.id} variant="outline" className="text-xs border-red-500/30 text-red-400">
                          {color.color_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhum produto cadastrado</h3>
          <p className="text-gray-500">Clique em "Novo Produto" para começar.</p>
        </div>
      )}
    </div>
  )
}