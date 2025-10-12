'use client'

import { useState, useEffect } from 'react'
import { supabase, Category } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Layers } from 'lucide-react'

interface CategoryManagerProps {
  onStatsUpdate: () => void
}

export default function CategoryManager({ onStatsUpdate }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: ''
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '' })
    setEditingCategory(null)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingCategory) {
        // Atualizar categoria
        const { error } = await supabase
          .from('categories')
          .update({ name: formData.name })
          .eq('id', editingCategory.id)

        if (error) throw error
      } else {
        // Criar nova categoria
        const { error } = await supabase
          .from('categories')
          .insert({ name: formData.name })

        if (error) throw error
      }

      setIsDialogOpen(false)
      resetForm()
      loadCategories()
      onStatsUpdate()
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta categoria?')) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      loadCategories()
      onStatsUpdate()
    } catch (error) {
      console.error('Erro ao deletar categoria:', error)
    }
  }

  if (loading) {
    return <div className="text-white">Carregando categorias...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gerenciar Categorias</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-black/90 border-red-500/30 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Nome da Categoria</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-black/30 border-red-500/30 text-white"
                  placeholder="Ex: Tênis, Camisetas, Acessórios"
                  required
                />
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
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  {editingCategory ? 'Atualizar' : 'Criar'} Categoria
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => (
          <Card key={category.id} className="bg-black/30 border-red-500/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-orange-400" />
                  {category.name}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleEdit(category)}
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-gray-300 hover:bg-red-500/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(category.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Layers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhuma categoria cadastrada</h3>
          <p className="text-gray-500">Clique em "Nova Categoria" para começar.</p>
        </div>
      )}
    </div>
  )
}